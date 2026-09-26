import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NewsCategory, NewsModel, UpdatedNewsModel } from '../shared/types/news.types';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  http = inject(HttpClient);

  private apiKey = 'c29786a8112c491e835212c7cfbbd3ee'; // API kulcsot nem tárolunk így normális esetben, biztonsági okokból

  getNewsByCategory(category: NewsCategory | undefined = undefined): Observable<NewsModel> {
    let specificCategory: string = category ? `&category=${category}` : '';

    return this.http.get<NewsModel>(
      `https://newsapi.org/v2/top-headlines?apiKey=${this.apiKey}&language=en${specificCategory}`,
    );
  }
}
