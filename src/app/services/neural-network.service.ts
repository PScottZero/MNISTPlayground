import { Injectable } from '@angular/core';
import {Neuron} from '../classes/Neuron';
import * as math from 'mathjs';
import {ActivationFunction, SIGMOID} from '../classes/ActivationFunction';

const INPUT_SIZE = 784;
const OUTPUT_SIZE = 10;
const DEFAULT_SIZE = [16, 16];
const DEFAULT_ACTIVATION = [SIGMOID, SIGMOID];

@Injectable({
  providedIn: 'root'
})
export class NeuralNetworkService {
  inputLayer: math.Number[];
  hiddenLayers: Neuron[][];
  outputLayer: math.Number[];

  constructor() {
    this.configureNetwork(DEFAULT_SIZE, DEFAULT_ACTIVATION);
  }

  configureNetwork(layerSizes: number[], layerActivations: ActivationFunction[]): void {
    this.hiddenLayers = [];
    let inputWeightCount = INPUT_SIZE;
    for (let layerNo = 0; layerNo < layerSizes.length; layerNo++) {
      this.hiddenLayers.push([]);
      for (let neuronNo = 0; neuronNo < layerSizes[layerNo]; neuronNo++) {
        this.hiddenLayers[layerNo].push(new Neuron(inputWeightCount, layerActivations[layerNo]));
      }
      inputWeightCount = layerSizes[layerNo];
    }
  }
}
