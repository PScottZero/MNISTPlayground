import {Component} from '@angular/core';
import {MnistService} from '../../../services/mnist.service';
import {NeuralNetworkService} from '../../../services/neural-network.service';

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
      this.neuralNetworkService.updateNetworkVisual.emit();
    }
  }

  isTraining(): boolean {
    return this.neuralNetworkService.isTraining;
  }

  usingFashionMNIST(): boolean {
    return this.mnistService.usingFashionMNIST;
  }

  getSelectedImage(): string {
    return (this.usingFashionMNIST()) ? 'fashion-mnist' : 'digit-mnist';
  }
}
