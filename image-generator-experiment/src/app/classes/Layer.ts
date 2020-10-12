import {math} from './mathjs';
import {LayerSaveData} from "./LayerSaveData";

export class Layer {
  weights: number[][];
  biases: number[];
  values: number[];
  activValues: number[];
  weightGradient: number[][];
  biasGradient: number[];
  activGradient: number[];
  size: number;
  isOutput: boolean;
  prevLayer: Layer;

  constructor(size: number, prevLayer: Layer, isOutput: boolean) {
    this.size = size;
    this.isOutput = isOutput;
    this.prevLayer = prevLayer;
    this.activValues = math.zeros(size);
    if (prevLayer !== undefined) {
      this.weights = math.divide(math.random([size, prevLayer.size]), size);
      this.biases = math.divide(math.random([size]), size);
    }
  }

  propagate(): void {
    this.values = math.add(math.multiply(this.weights, this.prevLayer.activValues), this.biases);
    if (!this.isOutput) {
      this.activValues = Array.from(this.values, x => this.relu(x));
    } else {
      this.activValues = this.softmax();
    }
  }

  calculateGradient(expectedValues: number[]): void {
    if (!this.isOutput) {
      const reluDeriv = Array.from(this.values, x => this.reluDeriv(x));
      this.biasGradient = math.dotMultiply(reluDeriv, this.activGradient);
    } else {
      this.biasGradient = math.subtract(this.activValues, expectedValues);
    }
    this.prevLayer.activGradient = math.multiply(math.transpose(this.weights), this.biasGradient);
  }

  update(eta: number): void {
    this.weights = math.subtract(this.weights, math.multiply(eta, this.weightGradient));
    this.biases = math.subtract(this.biases, math.multiply(eta, this.biasGradient));
  }

  softmax(): number[] {
    const denom = math.sum(math.exp(this.values));
    return Array.from(this.values, x => math.divide(math.exp(x), denom));
  }

  relu(x: number): number {
    return (x < 0) ? 0 : x;
  }

  reluDeriv(x: number): number {
    return (x <= 0) ? 0 : 1;
  }

  getLayerSaveData(): LayerSaveData {
    return new LayerSaveData(this.size, this.weights, this.biases);
  }
}
