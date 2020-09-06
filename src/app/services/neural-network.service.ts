import {Injectable} from '@angular/core';
import {Layer} from '../classes/Layer';
import {MnistService} from './mnist.service';
import {math} from '../classes/mathjs';
import {MNISTImage} from '../classes/MNISTImage';
import {MessageService} from './message.service';

const INPUT_SIZE = 784;
const OUTPUT_SIZE = 10;
const DEFAULT_SIZE = [INPUT_SIZE, 32, OUTPUT_SIZE];
const DEFAULT_EPOCH_COUNT = 3;
const DEFAULT_LEARNING_RATE = 0.001;

@Injectable({
  providedIn: 'root'
})
export class NeuralNetworkService {
  layers: Layer[];
  epochCount: number;
  eta: number;
  isTraining: boolean;
  totalCompleted: number;
  accuracy: number;

  constructor(private mnistService: MnistService, private messageService: MessageService) {
    this.isTraining = false;
    this.totalCompleted = 0;
    this.accuracy = 0;
    this.configureNetwork(DEFAULT_SIZE);
    this.configureTraining(DEFAULT_EPOCH_COUNT, DEFAULT_LEARNING_RATE);
  }

  configureNetwork(size: number[]): void {
    let prevLayer;
    let isOutput = false;
    this.layers = [];
    size.forEach((layerSize, index) => {
      if (index === size.length - 1) {
        isOutput = true;
      }
      const newLayer = new Layer(layerSize, prevLayer, isOutput);
      this.layers.push(newLayer);
      prevLayer = newLayer;
    });
  }

  configureTraining(epochCount: number, eta: number): void {
    this.epochCount = epochCount;
    this.eta = eta;
  }

  async trainNetwork(): Promise<void> {
    for (let epochNo = 0; epochNo < this.epochCount; epochNo++) {
      this.mnistService.shuffle();
      let completed = 0;
      let correct = 0;
      for (const image of this.mnistService.trainData) {
        this.forwardPropagation(image);
        correct += (this.checkCorrect(image)) ? 1 : 0;
        this.backPropagation(image);
        this.updateNetwork();
        completed++;
        this.totalCompleted++;
        if (completed % 20 === 0) {
          await this.delay(16);
        }
        const accuracy = math.round((correct / completed) * 100, 2);
        this.messageService.setEpochMessage(epochNo + 1, accuracy,
          completed, this.mnistService.trainData.length);
      }
    }
  }

  testNetwork(): void {
    let correct = 0;
    let completed = 0;
    for (const image of this.mnistService.testData) {
      this.forwardPropagation(image);
      correct += this.checkCorrect(image) ? 1 : 0;
      completed++;
      this.totalCompleted++;
      this.accuracy = math.round((correct / completed) * 100, 2);
      this.messageService.setTrainingMessage(this.accuracy, completed, this.mnistService.testData.length);
    }
  }

  getProgress(): number {
    const total = (this.mnistService.trainData.length * this.epochCount) + this.mnistService.testData.length;
    return (this.totalCompleted / total) * 100;
  }

  delay(ms: number): any {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  checkCorrect(image: MNISTImage): boolean {
    const outerLayer = this.layers[this.layers.length - 1].activValues;
    return image.getLabel() === outerLayer.indexOf(math.max(outerLayer));
  }

  forwardPropagation(image: MNISTImage): void {
    this.layers[0].activValues = [];
    for (const pixel of image.getImage()) {
      this.layers[0].activValues.push(pixel / 255);
    }
    for (const layer of this.layers) {
      if (layer.prevLayer !== undefined) {
        layer.propagate();
      }
    }
  }

  backPropagation(image: MNISTImage): void {
    const expected = math.zeros(OUTPUT_SIZE);
    expected[image.getLabel()] = 1;
    for (let layerNo = this.layers.length - 1; layerNo > 0; layerNo--) {
      this.layers[layerNo].calculateGradient(expected);
    }
  }

  updateNetwork(): void {
    this.layers.forEach((layer, index) => {
      if (index !== 0) {
        layer.update(this.eta);
      }
    });
  }
}
