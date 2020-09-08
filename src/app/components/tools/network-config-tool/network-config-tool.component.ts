import {Component, EventEmitter, OnInit} from '@angular/core';
import {NeuralNetworkService} from '../../../services/neural-network.service';
import {NeuralNetwork} from '../../../classes/NeuralNetwork';

@Component({
  selector: 'app-network-config-tool',
  templateUrl: './network-config-tool.component.html',
  styleUrls: ['./network-config-tool.component.scss']
})
export class NetworkConfigToolComponent implements OnInit {
  loadNetworkPrompt: HTMLElement;
  size: string;
  epochCount: string;
  learningRate: string;
  inputValidity: boolean[];

  constructor(private neuralNetworkService: NeuralNetworkService) { }

  ngOnInit(): void {
    this.loadNetworkPrompt = document.getElementById('load-network');
    this.initFields();
    this.validateInput();
  }

  initFields(): void {
    const size = this.neuralNetworkService.network.size
      .slice(1, this.neuralNetworkService.network.size.length - 1);
    this.size = size.toString();
    this.epochCount = this.neuralNetworkService.network.epochCount.toString();
    this.learningRate = this.neuralNetworkService.network.eta.toString();
  }

  saveNetwork(): void {
    const anchor = document.createElement('a');
    document.body.appendChild(anchor);
    anchor.setAttribute('style', 'display: none;');
    this.neuralNetworkService.network.removePrevLayers();
    const url = window.URL.createObjectURL(new Blob([JSON.stringify(this.neuralNetworkService.network)],
      {type: 'octet/stream'}));
    this.neuralNetworkService.network.restorePrevLayers();
    anchor.setAttribute('href', url);
    anchor.setAttribute('download',
      'mnist-network-' + Math.round(this.neuralNetworkService.network.accuracy) + '.json');
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  loadNetwork(event): void {
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.neuralNetworkService.network.configureNetworkFromJSON(
        JSON.parse(fileReader.result as string));
      this.initFields();
      this.neuralNetworkService.updateNetworkImage.emit();
    };
    fileReader.readAsText(file);
  }

  validateInput(): boolean {
    this.inputValidity = [true, true, true];
    let allInputsValid = true;
    for (const layerSize of this.getNetworkSize()) {
      if (Number.isNaN(layerSize) || this.getNetworkSize().length > 6) {
        this.inputValidity[0] = false;
        allInputsValid = false;
        break;
      }
    }
    if (Number.isNaN(+this.epochCount) || this.inputEmpty(this.epochCount)) {
      this.inputValidity[1] = false;
      allInputsValid = false;
    }
    if (Number.isNaN(+this.learningRate) || this.inputEmpty(this.learningRate)) {
      this.inputValidity[2] = false;
      allInputsValid = false;
    }
    return allInputsValid;
  }

  inputEmpty(input: string): boolean {
    return input.trim().length === 0;
  }

  getNetworkSize(): number[] {
    let size;
    if (!this.inputEmpty(this.size)) {
      size = this.size.split(',').map(layerSize => +layerSize);
      size.unshift(784);
      size.push(10);
      for (let i = 1; i < size.length - 1; i++) {
        if (size[i] < 4) {
          size[i] = 4;
        } else if (size[i] > 32) {
          size[i] = 32;
        }
      }
    } else {
      size = [784, 10];
    }
    return size;
  }

  setNetworkConfig(): void {
    if (this.validateInput()) {
      this.neuralNetworkService.network = new NeuralNetwork(this.getNetworkSize(),
        +this.epochCount, +this.learningRate);
    }
    this.neuralNetworkService.updateNetworkImage.emit();
  }

  isTraining(): boolean {
    return this.neuralNetworkService.isTraining;
  }
}
