import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { NewsService } from './services/news-service';
import { NewsCategory, NewsModel, UpdatedNewsModel } from './shared/types/news.types';
import { forkJoin, interval, map } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  newsService = inject(NewsService);

  private timeBetweenNewFetchInMilliseconds: number = 600000; //10perc

  ngOnInit(): void {
    let subscribedCategories = this.getSubscribedCategories();
    if (subscribedCategories.length) {
      this.getArticlesByCategories(subscribedCategories);

      console.log(subscribedCategories);
    }

    // interval 10percenként lekérjük azokat a híreket amikre van létező feliratkozás, leiratkozás nem fog kelleni az intervalról, mert úgy is azt szeretnénk akkor ne működjön csak, ha már bezártuk az oldalt
    interval(this.timeBetweenNewFetchInMilliseconds).subscribe(() => {
      let subscribedCategories = this.getSubscribedCategories();
      // mivel az open API eléggé korlátolt megjelenített hírek számában, ezért érdemesebb minden topicot egyszer lekérni, mintsem az összeset

      if (subscribedCategories.length) {
        this.getArticlesByCategories(subscribedCategories);

        console.log(subscribedCategories);
      }
    });
  }

  getSubscribedCategories(): NewsCategory[] {
    let subscribersList = JSON.parse(localStorage.getItem('Subscribers')!) ?? [];

    subscribersList = [
      'business',
      'entertainment',
      'general',
      'health',
      'science',
      'sports',
      'technology',
    ];

    return subscribersList;
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

        console.log(response);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
