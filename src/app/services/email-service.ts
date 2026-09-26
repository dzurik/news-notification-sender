import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { EmailNotificationModel } from '../shared/types/email.types';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private readonly serviceId = 'service_3js1nle';
  private readonly templateId = 'template_5phf92g';
  private readonly publicKey = 'Lpqm6h1Y6kV_UiL6u';

  sendEmail(notification: EmailNotificationModel): Promise<void> {
    return emailjs
      .send(
        this.serviceId,
        this.templateId,
        {
          to_email: notification.toEmail,
          title: notification.title,
          message: notification.message,
          source: notification.source ?? '',
          source_url: notification.sourceUrl ?? '',
          url: notification.url ?? '',
        },
        {
          publicKey: this.publicKey,
        },
      )
      .then(() => {
        console.log('Email sent successfully');
      });
  }
}
