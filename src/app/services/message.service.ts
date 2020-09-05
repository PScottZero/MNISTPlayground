import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  message: string;

  constructor() {}

  setEpochMessage(epochNo, accuracy, completed, total): void {
    this.message = `Epoch ${epochNo} accuracy: ${accuracy}% | Progress: ${completed}/${total}`;
  }

  setTrainingMessage(accuracy, completed, total): void {
    this.message = `Training accuracy: ${accuracy}% | Progress: ${completed}/${total}`;
  }
}
