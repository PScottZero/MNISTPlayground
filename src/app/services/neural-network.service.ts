import { EventEmitter, Injectable } from '@angular/core';
import { MnistService } from './mnist.service';
import { MessageService } from './message.service';
import { NeuralNetwork } from '../classes/NeuralNetwork';
import { math } from '../classes/mathjs';

const INPUT_SIZE = 784;
const OUTPUT_SIZE = 10;
const DEFAULT_SIZE = [INPUT_SIZE, 16, 16, OUTPUT_SIZE];
const DEFAULT_EPOCH_COUNT = 3;
const DEFAULT_LEARNING_RATE = 0.01;
const REDRAW_COUNT = 10;
const DELAY = 1;

@Injectable({
  providedIn: 'root',
})
export class NeuralNetworkService {
  network: NeuralNetwork;
  isTraining: boolean;
  totalCompleted: number;
  sendMNISTImage: EventEmitter<number[]>;
  updateNetworkVisual: EventEmitter<void>;

  constructor(
    private mnistService: MnistService,
    private messageService: MessageService
  ) {
    this.updateNetworkVisual = new EventEmitter<void>();
    this.sendMNISTImage = new EventEmitter<number[]>();
    this.network = new NeuralNetwork(
      DEFAULT_SIZE,
      DEFAULT_EPOCH_COUNT,
      DEFAULT_LEARNING_RATE
    );
    this.isTraining = false;
    this.totalCompleted = 0;
  }

  toggleMode(): void {
    this.network = new NeuralNetwork(
      this.network.size,
      this.network.epochCount,
      this.network.eta
    );
    this.mnistService.usingFashionMNIST = !this.mnistService.usingFashionMNIST;
  }

  usingFashionMNIST(): boolean {
    return this.mnistService.usingFashionMNIST;
  }

  async trainNetwork(): Promise<void> {
    this.totalCompleted = 0;
    for (let epochNo = 0; epochNo < this.network.epochCount; epochNo++) {
      this.mnistService.shuffle();
      let completed = 0;
      let correct = 0;
      for (const image of this.mnistService.getTrainData()) {
        this.forwardPropagation(image.getImage());
        correct += this.checkCorrect(image.getLabel()) ? 1 : 0;
        this.backPropagation(image.getLabel());
        this.updateNetwork();
        if (completed % REDRAW_COUNT === 0) {
          await this.delay(DELAY);
        }
        completed++;
        this.totalCompleted++;
        this.messageService.setEpochMessage(
          epochNo + 1,
          this.network.epochCount,
          this.getAccuracy(correct, completed),
          completed,
          this.mnistService.getTrainData().length
        );
      }
    }
  }

  async testNetwork(): Promise<void> {
    let correct = 0;
    let completed = 0;
    for (const image of this.mnistService.getTestData()) {
      this.forwardPropagation(image.getImage());
      correct += this.checkCorrect(image.getLabel()) ? 1 : 0;
      if (completed % REDRAW_COUNT === 0) {
        await this.delay(DELAY);
      }
      completed++;
      this.totalCompleted++;
      this.network.accuracy = this.getAccuracy(correct, completed);
      this.messageService.setTrainingMessage(
        this.network.accuracy,
        completed,
        this.mnistService.getTestData().length
      );
    }
    this.totalCompleted = 0;
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
    if (this.totalCompleted % 100 === 0) {
      this.sendMNISTImage.emit(imageData);
    }
  }

  backPropagation(label: number): void {
    const expected = math.zeros(OUTPUT_SIZE);
    expected[label] = 1;
    for (let layerNo = this.network.layers.length - 1; layerNo > 0; layerNo--) {
      this.network.layers[layerNo].calculateGradient(expected);
    }
  }

  updateNetwork(): void {
    this.network.layers.forEach((layer, index) => {
      if (index !== 0) {
        layer.update(this.network.eta);
      }
    });
  }

  checkCorrect(label: number): boolean {
    return label === this.getGuess();
  }

  getAccuracy(correct: number, completed: number): number {
    return math.round((correct / completed) * 100, 2);
  }

  getProgress(): number {
    const total =
      this.mnistService.getTrainData().length * this.network.epochCount +
      this.mnistService.getTestData().length;
    return (this.totalCompleted / total) * 100;
  }

  getGuess(): number {
    const outerLayer = this.network.layers[this.network.layers.length - 1]
      .activValues;
    return outerLayer.indexOf(math.max(outerLayer));
  }

  delay(ms: number): any {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
