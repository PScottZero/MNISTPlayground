import {Injectable} from '@angular/core';
import {Layer} from '../classes/Layer';
import {MnistService} from './mnist.service';
import {math} from '../classes/mathjs';
import {MNISTImage} from '../classes/MNISTImage';

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

  constructor(private mnistService: MnistService) {
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

  trainNetwork(): void {
    for (let epochNo = 0; epochNo < this.epochCount; epochNo++) {
      this.mnistService.shuffle();
      let correct = 0;
      for (const image of this.mnistService.trainData) {
        this.forwardPropagation(image);
        correct += (this.checkCorrect(image)) ? 1 : 0;
        this.backPropagation(image);
        this.updateNetwork();
      }
      console.log('Epoch', epochNo, 'accuracy:', correct / this.mnistService.trainData.length);
    }
  }

  checkCorrect(image: MNISTImage): boolean {
    const maxVal = math.max(this.layers[this.layers.length - 1].activValues);
    return image.getLabel() === this.layers[this.layers.length - 1].activValues.indexOf(maxVal);
  }

  forwardPropagation(image: MNISTImage): void {
    this.layers[0].activValues = [];
    for (const pixel of image.getImage()) {
      this.layers[0].activValues.push(pixel);
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
