import {Component, OnInit} from '@angular/core';
import {NeuralNetworkService} from '../../../services/neural-network.service';
import {NeuralNetwork} from '../../../classes/NeuralNetwork';
import {NetworkSaveData} from '../../../classes/NetworkSaveData';
import digitNetwork from '../../../../assets/pretrained/digitNetwork.json';
import fashionNetwork from '../../../../assets/pretrained/fashionNetwork.json';

@Component({
  selector: 'app-network-config-tool',
  templateUrl: './network-config-tool.component.html',
  styleUrls: ['./network-config-tool.component.scss']
})
export class NetworkConfigToolComponent implements OnInit {
  fileExplorer: HTMLElement;
  size: string;
  epochCount: string;
  learningRate: string;
  inputValidity: boolean[];
  loadPromptVisible: boolean;

  constructor(private neuralNetworkService: NeuralNetworkService) { }

  ngOnInit(): void {
    this.fileExplorer = document.getElementById('explorer');
    this.loadPromptVisible = false;
    this.initFields();
    this.validateInput();
  }

  toggleLoadPrompt(): void {
    this.loadPromptVisible = !this.loadPromptVisible;
  }

  initFields(): void {
    const size = this.neuralNetworkService.network.size
      .slice(1, this.neuralNetworkService.network.size.length - 1);
    this.size = size.toString();
    this.epochCount = this.neuralNetworkService.network.epochCount.toString();
    this.learningRate = this.neuralNetworkService.network.eta.toString();
  }

  saveNetwork(): void {
    const prefix = this.neuralNetworkService.usingFashionMNIST() ? 'mnist-fashion-' : 'mnist-digit-';
    const anchor = document.createElement('a');
    document.body.appendChild(anchor);
    anchor.setAttribute('style', 'display: none;');
    const url = window.URL.createObjectURL(new Blob([JSON.stringify(this.createNetworkSaveData())],
      {type: 'octet/stream'}));
    anchor.setAttribute('href', url);
    anchor.setAttribute('download',
      prefix + Math.round(this.neuralNetworkService.network.accuracy) + '.json');
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  createNetworkSaveData(): NetworkSaveData {
    const layerSaveData = [];
    for (const layer of this.neuralNetworkService.network.layers) {
      layerSaveData.push(layer.getLayerSaveData());
    }
    layerSaveData.shift();
    return new NetworkSaveData(
      layerSaveData,
      this.neuralNetworkService.network.accuracy,
      this.neuralNetworkService.network.epochCount,
      this.neuralNetworkService.network.eta
    );
  }

  loadNetworkJSON(event): void {
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.parseNetworkSaveData(JSON.parse(fileReader.result as string));
      this.initFields();
      this.neuralNetworkService.updateNetworkVisual.emit();
    };
    fileReader.readAsText(file);
    this.loadPromptVisible = false;
  }

  parseNetworkSaveData(networkSave: NetworkSaveData): void {
    const size = networkSave.layers.slice().map((layer) => layer.size);
    size.unshift(784);
    const network = new NeuralNetwork(size, networkSave.epochCount, networkSave.eta);
    for (let i = 1; i < network.layers.length; i++) {
      network.layers[i].weights = networkSave.layers[i - 1].weights;
      network.layers[i].biases = networkSave.layers[i - 1].biases;
    }
    network.accuracy = networkSave.accuracy;
    this.neuralNetworkService.network = network;
    this.neuralNetworkService.updateNetworkVisual.emit();
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
    this.neuralNetworkService.updateNetworkVisual.emit();
  }

  isTraining(): boolean {
    return this.neuralNetworkService.isTraining;
  }

  getServerCopyAccuracy(): number {
    return this.neuralNetworkService.usingFashionMNIST() ? fashionNetwork.accuracy : digitNetwork.accuracy;
  }

  loadPretrainedNetwork(): void {
    this.neuralNetworkService.usingFashionMNIST() ?
      this.parseNetworkSaveData(fashionNetwork) : this.parseNetworkSaveData(digitNetwork);
    this.loadPromptVisible = false;
  }
}
