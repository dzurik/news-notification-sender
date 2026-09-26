import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { SubscriberModel } from '../shared/types/subscribe.types';
import { NotificationItemModel, SlackWebhookModel } from '../shared/types/notification.types';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { EmailService } from '../services/email-service';
import { ConfirmDialogModal } from '../shared/components/confirm-dialog-modal/confirm-dialog-modal';
import { MatDialog } from '@angular/material/dialog';
import { AddSlackModal } from './add-slack-modal/add-slack-modal';

@Component({
  selector: 'app-admin',
  imports: [DatePipe],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  private toastr = inject(ToastrService);
  private emailService = inject(EmailService);
  private dialog = inject(MatDialog);

  subscribedList = signal<SubscriberModel[]>([]);
  sentNotificationList = signal<NotificationItemModel[]>([]);
  slackWebhooksList = signal<SlackWebhookModel[]>([]);

  constructor() {
    effect(() => {
      const refresh = this.emailService.refresh();

      console.log(refresh);

      this.getNotificationList();
    });
  }

  ngOnInit(): void {
    this.getSubscribersList();
    this.getNotificationList();
    this.getSlackWebhooksList();
  }
  getSubscribersList(): void {
    let subscribedList: SubscriberModel[] = JSON.parse(localStorage.getItem('Subscribers')!) ?? [];

    this.subscribedList.set(subscribedList);
  }

  getNotificationList(): void {
    let sentNotificationList: NotificationItemModel[] =
      JSON.parse(localStorage.getItem('Notifications')!) ?? [];

    this.sentNotificationList.set(sentNotificationList);
  }

  getSlackWebhooksList(): void {
    let slackWebhooksList: SlackWebhookModel[] = JSON.parse(localStorage.getItem('Slacks')!) ?? [];

    this.slackWebhooksList.set(slackWebhooksList);
  }

  unSubscribeEmail(id: string): void {
    this.dialog
      .open(ConfirmDialogModal, {
        data: {
          questionText: `Are you sure you want to delete this subscription?`,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          let updatableSubscribedList: SubscriberModel[] = this.subscribedList().slice();
          updatableSubscribedList = updatableSubscribedList.filter((sub) => sub.id !== id);

          localStorage.setItem('Subscribers', JSON.stringify(updatableSubscribedList));
          this.subscribedList.set(updatableSubscribedList);

          this.toastr.success('Successfull delete');
        }
      });
  }

  unSubscribeSlack(id: string): void {
    this.dialog
      .open(ConfirmDialogModal, {
        data: {
          questionText: `Are you sure you want to delete this slack?`,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          let updatableSlackWebhooksList: SlackWebhookModel[] = this.slackWebhooksList().slice();
          updatableSlackWebhooksList = updatableSlackWebhooksList.filter((sub) => sub.id !== id);

          localStorage.setItem('Slacks', JSON.stringify(updatableSlackWebhooksList));
          this.slackWebhooksList.set(updatableSlackWebhooksList);

          this.toastr.success('Successfull delete');
        }
      });
  }

  addSlack(): void {
    this.dialog
      .open(AddSlackModal, {})
      .afterClosed()
      .subscribe((result) => {
        if (result) this.getSlackWebhooksList();
      });
  }
}
