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
