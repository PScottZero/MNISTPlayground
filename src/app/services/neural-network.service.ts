import {EventEmitter, Injectable} from '@angular/core';
import {MnistService} from './mnist.service';
import {math} from '../classes/mathjs';
import {MessageService} from './message.service';
import {NeuralNetwork} from '../classes/NeuralNetwork';

const INPUT_SIZE = 784;
const OUTPUT_SIZE = 10;
const DEFAULT_SIZE = [INPUT_SIZE, 16, 16, OUTPUT_SIZE];
const DEFAULT_EPOCH_COUNT = 3;
const DEFAULT_LEARNING_RATE = 0.01;

@Injectable({
  providedIn: 'root'
})
export class NeuralNetworkService {
  network: NeuralNetwork;
  isTraining: boolean;
  totalCompleted: number;
  imageEmitter: EventEmitter<number[]>;

  constructor(private mnistService: MnistService, private messageService: MessageService) {
    this.network = new NeuralNetwork(DEFAULT_SIZE, DEFAULT_EPOCH_COUNT, DEFAULT_LEARNING_RATE);
    this.isTraining = false;
    this.totalCompleted = 0;
    this.imageEmitter = new EventEmitter<number[]>();
  }

  async trainNetwork(): Promise<void> {
    this.totalCompleted = 0;
    for (let epochNo = 0; epochNo < this.network.epochCount; epochNo++) {
      this.mnistService.shuffle();
      let completed = 0;
      let correct = 0;
      for (const image of this.mnistService.trainData) {
        this.forwardPropagation(image.getImage());
        correct += (this.checkCorrect(image.getLabel())) ? 1 : 0;
        this.backPropagation(image.getLabel());
        this.updateNetwork();
        if (completed % 20 === 0) {
          await this.delay(8);
        }
        completed++;
        this.totalCompleted++;
        const accuracy = math.round((correct / completed) * 100, 2);
        this.messageService.setEpochMessage(epochNo + 1, this.network.epochCount, accuracy,
          completed, this.mnistService.trainData.length);
      }
    }
  }

  async testNetwork(): Promise<void> {
    let correct = 0;
    let completed = 0;
    for (const image of this.mnistService.testData) {
      this.forwardPropagation(image.getImage());
      correct += this.checkCorrect(image.getLabel()) ? 1 : 0;
      if (completed % 20 === 0) {
        await this.delay(8);
      }
      completed++;
      this.totalCompleted++;
      this.network.accuracy = math.round((correct / completed) * 100, 2);
      this.messageService.setTrainingMessage(this.network.accuracy, completed, this.mnistService.testData.length);
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
      this.imageEmitter.emit(imageData);
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

  getProgress(): number {
    const total = (this.mnistService.trainData.length * this.network.epochCount) + this.mnistService.testData.length;
    return (this.totalCompleted / total) * 100;
  }

  getGuess(): number {
    const outerLayer = this.network.layers[this.network.layers.length - 1].activValues;
    return outerLayer.indexOf(math.max(outerLayer));
  }

  delay(ms: number): any {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
