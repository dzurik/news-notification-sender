import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog-modal',
  imports: [],
  templateUrl: './confirm-dialog-modal.html',
  styleUrl: './confirm-dialog-modal.scss',
})
export class ConfirmDialogModal {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      questionText?: string;
    },
    private dialogRef: MatDialogRef<ConfirmDialogModal>,
  ) {}

  confirmAnswer(value: boolean): void {
    this.dialogRef.close(value);
  }

  close(): void {
    this.dialogRef.close();
  }
}
