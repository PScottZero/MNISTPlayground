import { EventEmitter, Injectable } from '@angular/core';
import { NeuralNetwork } from '../classes/NeuralNetwork';
import { math } from '../classes/mathjs';

const INPUT_SIZE = 784;
const OUTPUT_SIZE = 10;
const DEFAULT_SIZE = [INPUT_SIZE, 16, 16, OUTPUT_SIZE];
const DEFAULT_EPOCH_COUNT = 3;
const DEFAULT_LEARNING_RATE = 0.01;
const ITERATIONS = 1000;

@Injectable({
  providedIn: 'root',
})
export class NeuralNetworkService {
  network: NeuralNetwork;
  isTraining: boolean;
  sendMNISTImage: EventEmitter<void>;
  image: number[];
  certainty: number;

  constructor() {
    this.certainty = 0;
    this.sendMNISTImage = new EventEmitter<void>();
    this.network = new NeuralNetwork(
      DEFAULT_SIZE,
      DEFAULT_EPOCH_COUNT,
      DEFAULT_LEARNING_RATE
    );
    this.isTraining = false;
    this.initImage();
  }

  initImage(): void {
    this.image = math.zeros(INPUT_SIZE);
  }

  async train(label: number): Promise<void> {
    this.initImage();
    for (let i = 0; i < ITERATIONS; i++) {
      this.forwardPropagation(this.image);
      this.backPropagation(label);
      this.image = math.subtract(
        this.image,
        math.multiply(5, this.network.layers[0].activGradient)
      );
      this.image = this.image.map((value) => (value < 0 ? 0 : value));
      if (i % 10 === 0) {
        this.certainty = this.network.layers[
          this.network.layers.length - 1
        ].activValues[label];
        await this.delay(10);
        this.sendMNISTImage.emit();
      }
    }
  }

  forwardPropagation(imageData: number[]): void {
    this.network.layers[0].activValues = [];
    for (const pixel of imageData) {
      this.network.layers[0].activValues.push(pixel / 255);
    }
    for (const layer of this.network.layers) {
      if (layer.prevLayer !== undefined) {
        layer.propagate();
      }
    }
  }

  backPropagation(label: number): void {
    const expected = math.zeros(OUTPUT_SIZE);
    expected[label] = 1;
    for (let layerNo = this.network.layers.length - 1; layerNo > 0; layerNo--) {
      this.network.layers[layerNo].calculateGradient(expected);
    }
  }

  delay(ms: number): any {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
