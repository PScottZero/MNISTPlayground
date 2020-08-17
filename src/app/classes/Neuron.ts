import * as math from 'mathjs';
import {ActivationFunction} from './ActivationFunction';

export class Neuron {
  weights: math.Number[];
  bias: math.Number;
  activation: ActivationFunction;
  value: math.Number;

  constructor(weightCount: math.Number, activation: math.Number) {
    this.weights = Array.from({length: weightCount}, () => Math.random());
    this.activation = activation;
  }

  calculate(edges: math.Number[]): void {
    this.value = this.activation(math.add(math.multiply(this.weights, edges), this.bias));
  }
}
