import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { NewsService } from './services/news-service';
import { NewsCategory } from './shared/types/news.types';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  newsService = inject(NewsService);

  protected readonly title = signal('news-notification-sender');

  ngOnInit(): void {
    this.getNews();
  }

  getNews(): void {
    this.newsService.getNews('sports').subscribe({
      next: (result) => {
        console.log(result);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
