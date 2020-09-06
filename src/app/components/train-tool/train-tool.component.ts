import { Component } from '@angular/core';
import {NeuralNetworkService} from '../../services/neural-network.service';
import {MessageService} from '../../services/message.service';

@Component({
  selector: 'app-train-tool',
  templateUrl: './train-tool.component.html',
  styleUrls: ['./train-tool.component.scss']
})
export class TrainToolComponent {
  constructor(private neuralNetworkService: NeuralNetworkService,
              private messageService: MessageService) {}

  getProgress(): number {
    return this.neuralNetworkService.getProgress();
  }

  getMessage(): string {
    return this.messageService.message;
  }

  async trainNetwork(): Promise<void> {
    if (!this.isTraining()) {
      this.neuralNetworkService.isTraining = true;
      await this.neuralNetworkService.trainNetwork();
      this.neuralNetworkService.testNetwork();
      this.neuralNetworkService.isTraining = false;
    }
  }

  isTraining(): boolean {
    return this.neuralNetworkService.isTraining;
  }
}
