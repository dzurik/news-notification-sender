import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SlackNotificationModel } from '../shared/types/notification.types';

@Injectable({
  providedIn: 'root',
})
export class SlackService {
  private http = inject(HttpClient);

  // webhookPath = '/services/T0C4S54P8BT/B0C4TT2F2BE/T62bQpLXFolZbdvYlLJ0g6mX';

  sendMessage(webhook: string, notification: SlackNotificationModel): Observable<string> {
    return this.http.post(
      webhook,
      {
        blocks: [
          {
            type: 'image',
            image_url: notification.sourceUrl,
            alt_text: 'News image',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Description:* ${notification.message}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Source:* ${notification.source}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Read more here:* <${notification.url}|link>`,
            },
          },
        ],
      },
      {
        responseType: 'text',
      },
    );
  }
}
