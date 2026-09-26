import { NewsCategory } from './news.types';

export interface SubscriberModel {
  id: string;
  email: string;
  categories: NewsCategory[];
  emailNotification: boolean;
  slackNotification: boolean;
}

export type SubscribeTypes = 'email' | 'slack';
