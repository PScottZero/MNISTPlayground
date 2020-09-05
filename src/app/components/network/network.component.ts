import { Component } from '@angular/core';
import {NeuralNetworkService} from '../../services/neural-network.service';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent {

  constructor(private neuralNetworkService: NeuralNetworkService) { }

  trainNetwork(): void {
    this.neuralNetworkService.isTraining = true;
    this.neuralNetworkService.trainNetwork();
    this.neuralNetworkService.testNetwork();
    this.neuralNetworkService.isTraining = false;
  }
}
