import { Injectable } from '@angular/core';
import {Neuron} from '../classes/Neuron';
import * as math from 'mathjs';
import {ActivationFunction, SIGMOID} from '../classes/ActivationFunction';
import {HttpClient} from '@angular/common/http';

const INPUT_SIZE = 784;
const OUTPUT_SIZE = 10;
const DEFAULT_SIZE = [16, 16];
const DEFAULT_ACTIVATION = [SIGMOID, SIGMOID];

@Injectable({
  providedIn: 'root'
})
export class NeuralNetworkService {
  layers: Neuron[][];
  expectedValue: math.Number[];
  miniBatchSize: number;

  constructor(private http: HttpClient) {
    this.configureNetwork(DEFAULT_SIZE, DEFAULT_ACTIVATION);
    this.trainNetwork();
  }

  configureNetwork(layerSizes: number[], layerActivations: ActivationFunction[]): void {
    this.layers = [Array<Neuron>(INPUT_SIZE)
      .fill(undefined).map(() => new Neuron(0, undefined))];
    let prevSize = INPUT_SIZE;
    for (let i = 0; i < layerSizes.length; i++) {
      this.layers.push(Array<Neuron>(layerSizes[i])
        .fill(undefined).map(() => new Neuron(prevSize, layerActivations[i])));
      prevSize = layerSizes[i];
    }
    this.layers.push(Array<Neuron>(OUTPUT_SIZE)
      .fill(undefined).map(() => new Neuron(prevSize, SIGMOID)));
  }

  trainNetwork(): void {
    this.http.get('assets/mnist/reduced_mnist_train.csv', {responseType: 'text'})
      .subscribe(response => {
        const parsedData = this.parseCSV(response);
      }
    );
  }

  parseCSV(csvText: string): any {
    const dataX = [];
    const dataY = [];
    const lines = csvText.split('\n');
    for (const line of lines) {
      const data = line.split(',');
      dataY.push(data[0]);
      dataX.push(data.shift());
    }
    return [dataX, dataY];
  }

  backpropagation(currLayer: number, prevLayerNeuron: number): math.Number {
    let sum = 0;
    for (let i = 0; i < this.layers[currLayer].length; i++) {
      const currNeuron = this.layers[currLayer][i];
      let prod = math.multiply(
        currNeuron.weights[prevLayerNeuron],
        currNeuron.activation(currNeuron.value, true),
      );
      if (currLayer !== this.layers.length - 1) {
        prod = math.multiply(prod, this.backpropagation(currLayer + 1, i));
      } else {
        prod = math.multiply(prod, 2, math.subtract(currNeuron.activationValue, this.expectedValue[i]));
      }
      sum = math.add(sum, prod);
    }
    return sum;
  }

  getCostWeightDerivative(layer: number, destNeuron: number, origNeuron: number): math.Number {
    const currNeuron = this.layers[layer][destNeuron];
    const prod = math.multiply(
      this.layers[layer - 1][origNeuron].activationValue,
      currNeuron.activation(currNeuron.value, true),
    );
    if (layer !== this.layers.length - 1) {
      return math.multiply(prod, this.backpropagation(layer + 1, destNeuron));
    } else {
      return math.multiply(prod, 2, math.subtract(currNeuron.activationValue, this.expectedValue[destNeuron]));
    }
  }

  getCostBiasDerivative(layer: number, neuron: number): math.Number {
    const currNeuron = this.layers[layer][neuron];
    if (layer !== this.layers.length - 1) {
      return math.multiply(currNeuron.activation(currNeuron.value, true),
        this.backpropagation(layer + 1, neuron));
    } else {
      return math.multiply(currNeuron.activation(currNeuron.value, true), 2,
        math.subtract(currNeuron.activationValue, this.expectedValue[neuron]));
    }
  }
}
