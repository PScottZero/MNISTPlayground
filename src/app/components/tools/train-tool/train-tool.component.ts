import { Component } from '@angular/core';
import {NeuralNetworkService} from '../../../services/neural-network.service';
import {MessageService} from '../../../services/message.service';

@Component({
  selector: 'app-train-tool',
  templateUrl: './train-tool.component.html',
  styleUrls: ['./train-tool.component.scss']
})
export class TrainToolComponent {
  constructor(private neuralNetworkService: NeuralNetworkService,
              private messageService: MessageService) {}

  getPercentDone(): number {
    return this.neuralNetworkService.getProgress();
  }

  getStatus(): string {
    return this.messageService.status;
  }

  getProgress(): string {
    return this.messageService.progress;
  }

  getAccuracy(): string {
    return this.messageService.accuracy;
  }

  async trainNetwork(): Promise<void> {
    if (!this.isTraining()) {
      this.neuralNetworkService.isTraining = true;
      await this.neuralNetworkService.trainNetwork();
      await this.neuralNetworkService.testNetwork();
      this.neuralNetworkService.isTraining = false;
    }
  }

  isTraining(): boolean {
    return this.neuralNetworkService.isTraining;
  }
}
