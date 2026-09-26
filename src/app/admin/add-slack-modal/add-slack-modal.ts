import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SlackWebhookModel } from '../../shared/types/notification.types';
import { ToastrService } from 'ngx-toastr';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-slack-modal',
  imports: [FormsModule],
  templateUrl: './add-slack-modal.html',
  styleUrl: './add-slack-modal.scss',
})
export class AddSlackModal {
  private toastr = inject(ToastrService);
  webhookUrl: string = '';

  constructor(private dialogRef: MatDialogRef<AddSlackModal>) {}

  addSlack(): void {
    let updatableSlackWebhooksList: SlackWebhookModel[] =
      JSON.parse(localStorage.getItem('Slacks')!) ?? [];

    let webhookAlreadyUsed = updatableSlackWebhooksList.find(
      (webhook) => webhook.url === this.webhookUrl?.trim(),
    );

    if (webhookAlreadyUsed) {
      this.toastr.error('Webhook is already used!');
      return;
    }

    updatableSlackWebhooksList.push({
      id: uuidv4(),
      url: this.webhookUrl,
    });

    localStorage.setItem('Slacks', JSON.stringify(updatableSlackWebhooksList));
    this.toastr.success('Webhook successful added');

    this.dialogRef.close(true);
  }

  close(): void {
    this.dialogRef.close();
  }
}
