import * as math from 'mathjs';

export class Layer {
  weights: math.Number[][];
  biases: math.Number[];
  values: math.Number[];
  activValues: math.Number[];
  weightGradient: math.Number[][];
  biasGradient: math.Number[];
  activGradient: math.Number[];
  size: number;
  isOutput: boolean;
  prevLayer: Layer;

  constructor(size: number, prevLayer: Layer, isOutput: boolean) {
    this.size = size;
    this.isOutput = isOutput;
    this.prevLayer = prevLayer;
    this.activValues = [];
    if (prevLayer !== undefined) {
      this.weights = math.divide(math.random([size, prevLayer.size]), size);
      this.biases = math.divide(math.random([size]), size);
    }
  }

  propagate(): void {
    this.values = math.squeeze(math.add(math.multiply(this.weights, this.prevLayer.activValues), this.biases));
    if (!this.isOutput) {
      this.activValues = Array.from(this.values, x => this.relu(x));
    } else {
      this.activValues = this.softmax();
    }
  }

  calculateGradient(expectedValues: math.Number[]): void {
    if (!this.isOutput) {
      const reluDeriv = Array.from(this.values, x => this.reluDeriv(x));
      this.biasGradient = math.dotMultiply(reluDeriv, this.activGradient);
    } else {
      this.biasGradient = math.subtract(this.activValues, expectedValues);
    }
    this.weightGradient = math.multiply(math.transpose([this.biasGradient]), [this.prevLayer.activValues]);
    if (this.prevLayer.prevLayer !== undefined) {
      this.prevLayer.activGradient = math.multiply(math.transpose(this.weights), this.biasGradient);
    }
  }

  update(eta: math.Number): void {
    this.weights = math.subtract(this.weights, math.multiply(eta, this.weightGradient));
    this.biases = math.subtract(this.biases, math.multiply(eta, this.biasGradient));
  }

  softmax(): math.Number[] {
    const denom = math.sum(math.exp(math.bignumber(this.values)));
    return Array.from(this.values, x => math.number(math.divide(math.bignumber(x), denom)));
  }

  relu(x: math.Number): math.Number {
    return (x < 0) ? 0 : x;
  }

  reluDeriv(x: math.Number): math.Number {
    return (x <= 0) ? 0 : 1;
  }
}
