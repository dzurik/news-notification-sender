import { NewsCategory } from './news.types';
import { SubscribeTypes } from './subscribe.types';

export interface EmailNotificationModel {
  toEmail: string;
  title: string;
  message: string;
  source?: string;
  sourceUrl?: string;
  url?: string;
}

export interface EmailModel {
  email: string;
  title: string;
  message: string;
  source: string;
  sourceUrl: string;
  url: string;
}

export interface NotificationItemModel {
  id: string;
  recipient: string;
  category: NewsCategory;
  articleTitle: string;
  sentAt: Date | string;
  notificationType: NotificationType;
  status: NotificationStatus;
}

export interface SlackNotificationModel {
  message: string;
  source: string;
  sourceUrl: string;
  url: string;
}

export interface SlackWebhookModel {
  id: string;
  url: string;
}

export enum NotificationStatus {
  Sent = 'Sent',
  Error = 'Error',
  Resent = 'Resent',
}

export enum NotificationType {
  Email = 'Email',
  Slack = 'Slack',
}
