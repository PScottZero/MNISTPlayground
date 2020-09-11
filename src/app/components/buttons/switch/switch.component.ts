import {Component} from '@angular/core';
import {MnistService} from '../../../services/mnist.service';
import {NeuralNetworkService} from "../../../services/neural-network.service";

@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss']
})
export class SwitchComponent {
  constructor(private neuralNetworkService: NeuralNetworkService,
              private mnistService: MnistService) {}

  toggleSlider(): void {
    if (!this.isTraining()) {
      this.neuralNetworkService.toggleMode();
    }
  }

  isTraining(): boolean {
    return this.neuralNetworkService.isTraining;
  }

  useFashionMNIST(): boolean {
    return this.mnistService.useFashionMNIST;
  }

  getSelectedImage(): string {
    return (this.useFashionMNIST()) ? 'fashion-mnist' : 'digit-mnist';
  }
}
