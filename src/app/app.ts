import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { NewsService } from './services/news-service';
import { ArticleModel, NewsCategory, NewsModel, UpdatedNewsModel } from './shared/types/news.types';
import { forkJoin, interval, map } from 'rxjs';
import { EmailService } from './services/email-service';
import {
  EmailModel,
  NotificationItemModel,
  NotificationStatus,
  NotificationType,
  SlackWebhookModel,
} from './shared/types/notification.types';
import { SubscriberModel } from './shared/types/subscribe.types';
import { v4 as uuidv4 } from 'uuid';
import { ToastrService } from 'ngx-toastr';
import { SlackService } from './services/slack-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private newsService = inject(NewsService);
  private emailService = inject(EmailService);
  private toastr = inject(ToastrService);
  private slackService = inject(SlackService);

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

    //subscribedCategory = ['sports']; //TODO Tesztelhetőség miatt van benne a korlátozás, mert ha túl sokszor van lekérdezve, 24órát kell várni

    return subscribedCategory;
  }

  getArticlesByCategories(subscribedCategories: NewsCategory[]) {
    let subscribersList: SubscriberModel[] = JSON.parse(localStorage.getItem('Subscribers')!) ?? [];

    // Az adott kategóriára kikeresem hogy van e feliratkozás és csak azok a categoriák lesznek lekérve
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

        // Megnézem, hogy van-e olyan hír ami még nem volt-e kiküldve, ha igen az mindent arra feliratkozónak kimegy
        let sentNotificationList: NotificationItemModel[] =
          JSON.parse(localStorage.getItem('Notifications')!) ?? [];

        //létrehozom, hogy milyen kategóriákba lehetnek hírek, amikoről még nem ment email
        let notEmailSentFromArticles: UpdatedNewsModel[] = subscribedCategories.map((category) => {
          return {
            category: category,
            articles: [],
          };
        });

        response.forEach((resp) => {
          resp.articles.forEach((article) => {
            let categoryIndex = notEmailSentFromArticles.findIndex(
              (news) => news.category === resp.category,
            );

            let anyNotificationSent = false;
            sentNotificationList.forEach((notification) => {
              if (notification.articleTitle.includes(article.title)) {
                anyNotificationSent = true;
              }
            });

            if (!sentNotificationList.length || !anyNotificationSent) {
              notEmailSentFromArticles[categoryIndex].articles.push(article);
            }
          });
        });

        // végig megyek az kategóriákon, ha van olyan amiben olyan hír van amiről még nem volt kiküldés, kiküldöm típusunkont (email/slack külön nézve)
        notEmailSentFromArticles.forEach((news) => {
          subscribersList.forEach((sub) => {
            if (sub.categories.includes(news.category)) {
              news.articles.forEach((article) => {
                //email kiküldés
                if (sub.emailNotification) {
                  this.emailNotificationSend(
                    {
                      email: sub.email,
                      title: article.title,
                      message: article.description,
                      source: article.source?.name,
                      sourceUrl: article.urlToImage,
                      url: article.url,
                    },
                    news.category,
                  );
                }

                //slack kiküldés
                if (sub.slackNotification) {
                  let slackWebhooksList: SlackWebhookModel[] =
                    JSON.parse(localStorage.getItem('Slacks')!) ?? [];

                  slackWebhooksList.forEach((slack) => {
                    this.slackService
                      .sendMessage(slack.url, {
                        message: article.description,
                        source: article.source?.name,
                        sourceUrl: article.urlToImage,
                        url: article.url,
                      })
                      .subscribe({
                        next: (response) => {
                          this.sendingLogging(
                            false,
                            true,
                            {
                              email: sub.email,
                              title: article.title,
                              message: article.description,
                              source: article.source?.name,
                              sourceUrl: article.urlToImage,
                              url: article.url,
                            },
                            news.category,
                          );
                        },
                        error: (error) => {
                          this.sendingLogging(
                            false,
                            false,
                            {
                              email: sub.email,
                              title: article.title,
                              message: article.description,
                              source: article.source?.name,
                              sourceUrl: article.urlToImage,
                              url: article.url,
                            },
                            news.category,
                          );
                        },
                      });
                  });
                }
              });
            }
          });
        });

  
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  async emailNotificationSend(emailData: EmailModel, category: NewsCategory) {
    try {
      await this.emailService.sendEmail({
        toEmail: emailData.email,
        title: emailData.title,
        message: emailData.message,
        source: emailData.source,
        sourceUrl: emailData.sourceUrl,
        url: emailData.url,
      });

      this.sendingLogging(true, true, emailData, category);
    } catch (error) {
      //logolás akkor is megtörténik mikor nem sikerült kiküldeni, lehetne bővíteni a listát újraküldés funkcióval
      this.sendingLogging(true, false, emailData, category);
    }
  }

  sendingLogging(
    isEmail: boolean,
    isSuccess: boolean,
    emailData: EmailModel,
    category: NewsCategory,
  ): void {
    let updatableSentNotificationList: NotificationItemModel[] =
      JSON.parse(localStorage.getItem('Notifications')!) ?? [];

    updatableSentNotificationList.push({
      id: uuidv4(),
      recipient: emailData.email,
      category: category,
      articleTitle: emailData.title,
      sentAt: new Date(),
      notificationType: isEmail ? NotificationType.Email : NotificationType.Slack,
      status: isSuccess ? NotificationStatus.Sent : NotificationStatus.Error,
    });

    localStorage.setItem('Notifications', JSON.stringify(updatableSentNotificationList));
    this.emailService.notificationRefresh();

    if (isSuccess) this.toastr.success(`${isEmail ? 'Email' : 'Slack'} sent successfully`);
    else this.toastr.error(`${isEmail ? 'Email' : 'Slack'} sent failed`);
  }
}
