import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { NewsService } from './services/news-service';
import { NewsCategory, NewsModel, UpdatedNewsModel } from './shared/types/news.types';
import { forkJoin, interval, map } from 'rxjs';
import { EmailService } from './services/email-service';
import { EmailModel } from './shared/types/email.types';
import { SubscriberModel } from './shared/types/subscribe.types';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  newsService = inject(NewsService);
  emailService = inject(EmailService);

  private timeBetweenNewFetchInMilliseconds: number = 600000; //10perc

  ngOnInit(): void {
    let subscribedCategories = this.getSubscribedCategories();
    if (subscribedCategories.length) {
      this.getArticlesByCategories(subscribedCategories);
    }

    // interval 10percenként lekérjük azokat a híreket amikre van létező feliratkozás, leiratkozás nem fog kelleni az intervalról, mert úgy is azt szeretnénk akkor ne működjön csak, ha már bezártuk az oldalt
    interval(this.timeBetweenNewFetchInMilliseconds).subscribe(() => {
      let subscribedCategories = this.getSubscribedCategories();
      // mivel az open API eléggé korlátolt megjelenített hírek számában, ezért érdemesebb minden topicot egyszer lekérni, mintsem az összeset

      if (subscribedCategories.length) {
        // this.getArticlesByCategories(subscribedCategories);
      }
    });
  }

  getSubscribedCategories(): NewsCategory[] {
    let subscribersList: SubscriberModel[] = JSON.parse(localStorage.getItem('Subscribers')!) ?? [];
    let subscribedCategory: NewsCategory[] = [];

    subscribersList.forEach((sub) => {
      sub.categories.forEach((category) => {
        if (!subscribedCategory.includes(category)) subscribedCategory.push(category);
      });
    });

    subscribedCategory = ['sports']; //TODO a korlátozás miatt majd kivenni

    return subscribedCategory;
  }

  getArticlesByCategories(subscribedCategories: NewsCategory[]) {
    const requests = subscribedCategories.map((category) =>
      this.newsService.getNewsByCategory(category).pipe(
        map((response: NewsModel) => ({
          category,
          articles: response.articles,
        })),
      ),
    );

    forkJoin(requests).subscribe({
      next: (response: UpdatedNewsModel[]) => {
        // értesítés küldés

        this.emailNotificationSend({
          email: 'dzurikskill@hotmail.com',
          title: response[0].articles[0].title,
          message: response[0].articles[0].description,
          source: response[0].articles[0].source?.name,
          sourceUrl: response[0].articles[0].urlToImage,
          url: response[0].articles[0].url,
        });

        console.log(response);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  async emailNotificationSend(emailData: EmailModel) {
    try {
      await this.emailService.sendEmail({
        toEmail: emailData.email,
        title: emailData.title,
        message: emailData.message,
        source: emailData.source,
        sourceUrl: emailData.sourceUrl,
        url: emailData.url,
      });

      console.log('Success');
    } catch (error) {
      console.error('Email sending failed', error);
    }
  }
}
