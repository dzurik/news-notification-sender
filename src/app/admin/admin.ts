import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { SubscriberModel } from '../shared/types/subscribe.types';
import { NotificationItemModel } from '../shared/types/notification.types';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { EmailService } from '../services/email-service';

@Component({
  selector: 'app-admin',
  imports: [DatePipe],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  private toastr = inject(ToastrService);
  private emailService = inject(EmailService);

  subscribedList = signal<SubscriberModel[]>([]);
  sentNotificationList = signal<NotificationItemModel[]>([]);

  constructor() {
    effect(() => {
      const refresh = this.emailService.refresh();

      this.getNotificationList();
    });
  }

  ngOnInit(): void {
    this.getSubscribersList();
    this.getNotificationList();
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

  unSubscribeEmail(id: string): void {
    // ide lehetne rakni egy megerősítő modalt
    let updatableSubscribedList: SubscriberModel[] = this.subscribedList().slice();
    updatableSubscribedList = updatableSubscribedList.filter((sub) => sub.id !== id);

    localStorage.setItem('Subscribers', JSON.stringify(updatableSubscribedList));
    this.subscribedList.set(updatableSubscribedList);

    this.toastr.success('Successfull delete');
  }
}
