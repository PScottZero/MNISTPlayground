import { Component } from '@angular/core';
import {NeuralNetworkService} from '../../services/neural-network.service';
import {MessageService} from '../../services/message.service';

@Component({
  selector: 'app-train-window',
  templateUrl: './train-window.component.html',
  styleUrls: ['./train-window.component.scss']
})
export class TrainWindowComponent {
  constructor(private neuralNetworkService: NeuralNetworkService,
              private messageService: MessageService) {}

  getProgress(): number {
    return this.neuralNetworkService.getProgress();
  }

  getMessage(): string {
    return this.messageService.message;
  }

  isTraining(): boolean {
    return this.neuralNetworkService.isTraining;
  }
}
