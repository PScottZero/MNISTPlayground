import * as math from 'mathjs';
import {ActivationFunction} from './ActivationFunction';

export class Neuron {
  weights: math.Number[];
  bias: math.Number;
  activation: ActivationFunction;
  value: math.Number;
  activationValue: math.Number;

  constructor(weightCount: math.Number, activation: math.Number) {
    this.weights = Array.from({length: weightCount}, () => math.random());
    this.bias = math.random();
    this.activation = activation;
  }

  calculateValue(prevNeurons: Neuron[]): void {
    const prevActivations = prevNeurons.slice().map(neuron => neuron.value);
    this.value = math.add(math.multiply(this.weights, prevActivations), this.bias);
  }

  calculateActivationValue(prevNeurons: Neuron[]): void {
    this.calculateValue(prevNeurons);
    this.activationValue = this.activation(this.value, false);
  }
}
