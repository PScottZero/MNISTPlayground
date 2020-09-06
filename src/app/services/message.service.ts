import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  status: string;
  progress: string;
  accuracy: string;

  constructor() {}

  setEpochMessage(epochNo, accuracy, completed, total): void {
    this.status = `Epoch ${epochNo}`;
    this.setProgressAndAccuracy(accuracy, completed, total);
  }

  setProgressAndAccuracy(accuracy, completed, total): void {
    this.progress = `Progress: ${completed}/${total}`;
    this.accuracy = `Accuracy: ${accuracy}%`;
  }

  setTrainingMessage(accuracy, completed, total): void {
    this.status = `Testing`;
    this.setProgressAndAccuracy(accuracy, completed, total);
  }
}
