import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NewsCategory } from '../shared/types/news.types';
import { TitleCasePipe } from '@angular/common';

import { SubscriberModel, SubscribeTypes } from '../shared/types/subscribe.types';
import { v4 as uuidv4 } from 'uuid';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-notification',
  imports: [ReactiveFormsModule, TitleCasePipe],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
})
export class Notification implements OnInit {
  private toastr = inject(ToastrService);

  newsCategories: NewsCategory[] = [
    'business',
    'entertainment',
    'general',
    'health',
    'science',
    'sports',
    'technology',
  ];

  subscribeTypes: SubscribeTypes[] = ['email', 'slack'];

  //Egyszerűbb lenne a simán ngmodelt használni jelenesetben, de jók a beépíthető validátorok
  notificationForm = new FormGroup({
    emailAddress: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.minLength(8)],
    }),
    business: new FormControl<boolean>(false),
    entertainment: new FormControl<boolean>(false),
    general: new FormControl<boolean>(false),
    health: new FormControl<boolean>(false),
    science: new FormControl<boolean>(false),
    sports: new FormControl<boolean>(false),
    technology: new FormControl<boolean>(false),
    allCategory: new FormControl<boolean>(false),
    email: new FormControl<boolean>(false),
    slack: new FormControl<boolean>(false),
  });

  ngOnInit(): void {
    this.notificationForm.controls.allCategory.valueChanges.subscribe((value) => {
      this.notificationForm.patchValue({
        business: value,
        entertainment: value,
        general: value,
        health: value,
        science: value,
        sports: value,
        technology: value,
      });
    });
  }

  subscribeForEmail(): void {
    let updatableSubscribedList: SubscriberModel[] =
      JSON.parse(localStorage.getItem('Subscribers')!) ?? [];
    let errorMessages: string[] = [];

    let isEmailAlreadyUsed = updatableSubscribedList.find(
      (subscriber) => subscriber.email === this.notificationForm.value.emailAddress?.trim(),
    );

    if (isEmailAlreadyUsed) {
      // az is egy megoldás lehetne, hogy ha már az email használatban van, akkor az előző opciókat felül írja
      errorMessages.push('Email is already used!');
    }

    if (!this.newsCategories.some((category) => this.notificationForm.value[category] === true)) {
      errorMessages.push('Category is not selected!');
    }

    if (!this.subscribeTypes.some((category) => this.notificationForm.value[category] === true)) {
      errorMessages.push('Subscribe type is not selected!');
    }

    if (errorMessages.length) {
      this.toastr.error(errorMessages.join(' '));
      return;
    }

    let subscribedCategories: NewsCategory[] = [];

    this.newsCategories.forEach((category) => {
      if (this.notificationForm.value[category]) subscribedCategories.push(category);
    });

    updatableSubscribedList.push({
      id: uuidv4(),
      email: this.notificationForm.value.emailAddress?.trim()!,
      categories: subscribedCategories,
      emailNotification: this.notificationForm.value.email!,
      slackNotification: this.notificationForm.value.slack!,
    });

    localStorage.setItem('Subscribers', JSON.stringify(updatableSubscribedList));
    this.toastr.success('Successful subscription');
    this.notificationForm.reset();
  }
}
