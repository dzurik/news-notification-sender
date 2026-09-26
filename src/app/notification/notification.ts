import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-notification',
  imports: [ReactiveFormsModule],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
})
export class Notification {
  //Egyszerűbb lenne a simán ngmodelt használni jelenesetben, de jók a beépíthető validátorok
  notificationForm = new FormGroup({
    emailAddress: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)], //TODO email validálás regex
    }),
  });

  subscribeForEmail(): void {}
}
