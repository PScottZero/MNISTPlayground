import {Injectable} from '@angular/core';
import {FunctionMode, RELU, SOFTMAX} from '../classes/ActivationFunction';
import {HttpClient} from '@angular/common/http';
import * as math from 'mathjs';
import {MNISTData} from '../classes/MNISTData';
import {Gradient} from '../classes/Gradient';
import {NeuralNetwork} from '../classes/NeuralNetwork';

const INPUT_SIZE = 784;
const OUTPUT_SIZE = 10;
const DEFAULT_SIZE = [INPUT_SIZE, 16, 16, OUTPUT_SIZE];
const DEFAULT_ACTIVATION = [undefined, RELU, RELU, SOFTMAX];
const DEFAULT_EPOCH_COUNT = 3;
const DEFAULT_MINI_BATCH_SIZE = 100;

@Injectable({
  providedIn: 'root'
})
export class NeuralNetworkService {
  network: NeuralNetwork;
  miniBatchGradient: Gradient;
  expectedValue: math.Number[];

  miniBatchSize: number;
  epochCount: number;

  constructor(private http: HttpClient) {
    this.network = new NeuralNetwork(DEFAULT_SIZE, DEFAULT_ACTIVATION);
    this.configureTraining(DEFAULT_EPOCH_COUNT, DEFAULT_MINI_BATCH_SIZE);
    this.trainNetwork();
  }

  configureTraining(epochCount: number, miniBatchSize: number): void {
    this.miniBatchGradient = new Gradient(this.network.getSize());
    this.epochCount = epochCount;
    this.miniBatchSize = miniBatchSize;
  }

  parseCSV(csvText: string): MNISTData {
    const data = new MNISTData();
    const lines = csvText.split('\n');
    for (const line of lines) {
      const imageData = line.split(',').map(entry => +entry);
      const label = Array<math.Number>(10).fill(0);
      label[imageData[0]] = 1;
      imageData.shift();
      data.imageData.push(imageData);
      data.labels.push(label);
    }
    return data;
  }

  trainNetwork(): void {
    this.http.get('assets/mnist/reduced_mnist_train.csv', {responseType: 'text'})
      .subscribe(response => {
        const trainingData = this.parseCSV(response);
        for (let epoch = 0; epoch < this.epochCount; epoch++) {
          console.log('Epoch ' + (epoch + 1));
          trainingData.shuffle();
          let miniBatchCorrect = 0;
          for (let i = 0; i < trainingData.imageData.length; i++) {
            this.network.runNetwork(trainingData.imageData[i]);
            this.expectedValue = trainingData.labels[i];
            miniBatchCorrect += (this.checkCorrect(trainingData.labels[i].indexOf(1))) ? 1 : 0;
            this.calculateGradient();
            if ((i + 1) % this.miniBatchSize === 0 || i === trainingData.imageData.length - 1) {
              const accuracy = math.round(math.multiply(math.divide(miniBatchCorrect, this.miniBatchSize), 100), 2);
              console.log('* Mini-batch ' + (math.ceil(((i + 1) / this.miniBatchSize))) + ' accuracy ' + accuracy + '%');
              this.updateWeights(math.divide(miniBatchCorrect, this.miniBatchSize));
              this.miniBatchGradient = new Gradient(this.network.getSize());
              miniBatchCorrect = 0;
            }
          }
        }
        this.testNetwork();
      }
    );
  }

  testNetwork(): void {
    this.http.get('assets/mnist/reduced_mnist_test.csv', {responseType: 'text'})
      .subscribe(response => {
        const testingData = this.parseCSV(response);
        let correct = 0;
        for (let i = 0; i < testingData.imageData.length; i++) {
          this.network.runNetwork(testingData.imageData[i]);
          correct += (this.checkCorrect(testingData.labels[i].indexOf(1))) ? 1 : 0;
        }
        console.log(math.multiply(math.divide(correct, 1000), 100));
      }
    );
  }

  checkCorrect(expectedValue: number): boolean {
    const guess = Array.from(this.network.getOutputLayer(), neuron => neuron.activationValue);
    return guess.indexOf(math.max(guess)) === expectedValue;
  }

  calculateGradient(): void {
    const gradient = new Gradient(this.network.getSize(), this.network.getOutputLayer(), this.expectedValue);
    for (let layerNo = this.network.getSize().length - 1; layerNo > 0; layerNo--) {
      for (let neuronNo = 0; neuronNo < this.network.layers[layerNo].length; neuronNo++) {
        const neuron = this.network.layers[layerNo][neuronNo];
        const neuronDeriv = gradient.layers[layerNo][neuronNo];
        const biasDeriv = this.getCostBiasDeriv(layerNo, neuronNo, gradient);
        neuronDeriv.biasDeriv = biasDeriv;
        for (let weightNo = 0; weightNo < neuron.weights.length; weightNo++) {
          neuronDeriv.weightDeriv[weightNo] = this.getCostWeightDeriv(layerNo, weightNo, biasDeriv);
          gradient.layers[layerNo - 1][weightNo].activationDeriv = math.add(
            gradient.layers[layerNo - 1][weightNo].activationDeriv,
            this.getCostActivationDeriv(layerNo, neuronNo, weightNo, biasDeriv)
          );
        }
      }
    }
    this.miniBatchGradient.add(gradient, this.miniBatchSize);
  }

  updateWeights(accuracy: math.Number): void {
    const eta = math.multiply(math.subtract(1, accuracy), 1);
    for (let i = 1; i < this.network.layers.length; i++) {
      for (let j = 0; j < this.network.layers[i].length; j++) {
        this.network.layers[i][j].adjustWeights(this.miniBatchGradient.layers[i][j].weightDeriv, eta);
        this.network.layers[i][j].adjustBias(this.miniBatchGradient.layers[i][j].biasDeriv, eta);
      }
    }
  }

  getCostBiasDeriv(layerNo: number, neuronNo: number, gradient: Gradient): math.Number {
    const neuron = this.network.layers[layerNo][neuronNo];
    if (layerNo !== this.network.layers.length - 1) {
      return math.multiply(neuron.activation(neuron.value, FunctionMode.DERIV),
        gradient.layers[layerNo][neuronNo].activationDeriv);
    } else {
      return math.multiply(neuron.activation(neuron.value, FunctionMode.DERIV, this.network.getOutputLayerValues()),
        gradient.layers[layerNo][neuronNo].activationDeriv);
    }
  }

  getCostWeightDeriv(layerNo: number, weightNo: number, costBiasDeriv: math.Number): math.Number {
    return math.multiply(this.network.layers[layerNo - 1][weightNo].activationValue, costBiasDeriv);
  }

  getCostActivationDeriv(layerNo: number, neuronNo: number, weightNo: number, costBiasDeriv: math.Number): math.Number {
    return math.multiply(this.network.layers[layerNo][neuronNo].weights[weightNo], costBiasDeriv);
  }
}
