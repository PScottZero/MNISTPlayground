import * as math from 'mathjs';
import {ActivationFunction, FunctionMode} from './ActivationFunction';

export class Neuron {
  weights: math.Number[];
  bias: math.Number;
  activation: ActivationFunction;
  value: math.Number;
  activationValue: math.Number;

  constructor(weightCount: math.Number, activation: math.Number) {
    this.weights = Array.from({length: weightCount}, () => math.random(0, 10));
    this.bias = math.random();
    this.activation = activation;
  }

  adjustWeights(gradient: math.Number[], eta: math.Number): void {
    this.weights = math.subtract(this.weights, math.multiply(eta, gradient));
  }

  adjustBias(gradient: math.Number, eta: math.Number): void {
    this.bias = math.subtract(this.bias, math.multiply(gradient, eta));
  }

  calculateValue(prevNeurons: Neuron[]): void {
    const prevActivations = prevNeurons.slice().map(neuron => neuron.activationValue);
    this.value = math.add(math.multiply(this.weights, prevActivations), this.bias);
  }

  calculateActivationValue(prevNeurons: Neuron[]): void {
    this.calculateValue(prevNeurons);
    this.activationValue = this.activation(this.value, FunctionMode.NORMAL);
  }
}
