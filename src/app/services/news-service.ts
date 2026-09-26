import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NewsCategory, NewsModel, UpdatedNewsModel } from '../shared/types/news.types';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  http = inject(HttpClient);

  //régi c29786a8112c491e835212c7cfbbd3ee
  private apiKey = '0ab75e8810af44f4a90ec8f8eb72b5f1'; // API kulcsot nem tárolunk így normális esetben, biztonsági okokból

  getNewsByCategory(category: NewsCategory | undefined = undefined): Observable<NewsModel> {
    let specificCategory: string = category ? `&category=${category}` : '';

    // return this.http.get<NewsModel>(
    //   `https://newsapi.org/v2/top-headlines?apiKey=${this.apiKey}&language=en${specificCategory}`,
    // );

    return of({
      status: 'ok',
      totalResults: 1,
      articles: [
        {
          source: {
            id: 'asd',
            name: 'BBC News',
          },
          author: 'Paul Battison',
          title: "NHL: Pittsburgh Penguins forward Andrei Kuzmenko's father killed by bear - BBC",
          description:
            'Pittsburgh Penguins forward Andrei Kuzmenko returns to Russia before the start of the NHL season after his father was killed by a bear.',
          url: 'https://www.bbc.com/sport/ice-hockey/articles/cx62mem6v3e6o',
          urlToImage:
            'https://ichef.bbci.co.uk/ace/branded_sport/1200/cpsprodpb/b6d9/live/c2350e30-b8be-11f1-8668-c7d18ac42397.jpg',
          publishedAt: '2026-09-25T09:12:36Z',
          content:
            "Pittsburgh Penguins forward Andrei Kuzmenko has returned to Russia before the start of the NHL season after his father was killed by a bear.\r\nKuzmenko's father Alexander, who was an ice hockey coach … [+1336 chars]",
        },
      ],
    });
  }
}
