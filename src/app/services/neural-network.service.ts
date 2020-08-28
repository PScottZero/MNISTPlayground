import {Injectable} from '@angular/core';
import {Neuron} from '../classes/Neuron';
import * as math from 'mathjs';
import {ActivationFunction, FunctionMode, RELU, SIGMOID} from '../classes/ActivationFunction';
import {HttpClient} from '@angular/common/http';
import {NeuronDeriv} from '../classes/NeuronDeriv';

const INPUT_SIZE = 784;
const OUTPUT_SIZE = 10;
const DEFAULT_SIZE = [16, 16];
const DEFAULT_ACTIVATION = [RELU, RELU];

@Injectable({
  providedIn: 'root'
})
export class NeuralNetworkService {
  layers: Neuron[][];
  gradients: NeuronDeriv[][][];
  expectedValue: math.Number[];
  activationDeriv: math.Number[];

  miniBatchSize: number;
  epochCount: number;
  totalCorrect: math.Number;

  constructor(private http: HttpClient) {
    this.configureNetwork(DEFAULT_SIZE, DEFAULT_ACTIVATION);
    this.epochCount = 1;
    this.miniBatchSize = 128;
    this.totalCorrect = 0;
    this.gradients = [];
    this.trainNetwork();
  }

  configureNetwork(layerSizes: number[], layerActivations: ActivationFunction[]): void {
    this.layers = [Array<Neuron>(INPUT_SIZE)
      .fill(undefined).map(() => new Neuron(0, undefined))];
    let prevSize = INPUT_SIZE;
    for (let i = 0; i < layerSizes.length; i++) {
      this.layers.push(Array<Neuron>(layerSizes[i])
        .fill(undefined).map(() => new Neuron(prevSize, layerActivations[i])));
      prevSize = layerSizes[i];
    }
    this.layers.push(Array<Neuron>(OUTPUT_SIZE)
      .fill(undefined).map(() => new Neuron(prevSize, SIGMOID)));
  }

  trainNetwork(): void {
    this.http.get('assets/mnist/reduced_mnist_train.csv', {responseType: 'text'})
      .subscribe(response => {
        let data = this.parseCSV(response);
        let trainX = data[0];
        let trainY = data[1];

        for (let epoch = 0; epoch < this.epochCount; epoch++) {
          console.log('Epoch ' + epoch);
          data = this.shuffleData(trainX, trainY);
          trainX = data[0];
          trainY = data[1];
          for (let i = 0; i < trainX.length; i++) {
            if ((i + 1) % this.miniBatchSize === 0 || i === trainX.length - 1) {
              const accuracy = math.round(math.multiply(math.divide(this.totalCorrect, this.miniBatchSize), 100), 2);
              console.log('* Mini-batch ' + (((i + 1) / this.miniBatchSize)) + ' accuracy ' + accuracy + '%');
              this.updateWeights();
              this.gradients = [];
              this.totalCorrect = 0;
            }
            this.runNetwork(trainX[i]);
            this.expectedValue = trainY[i];
            this.checkCorrect(trainY[i].indexOf(1));
            this.gradients.push(this.calculateGradient());
          }
        }
      }
    );
  }

  checkCorrect(expectedValueIndex: number): void {
    let maxIndex = 0;
    let maxValue = -1;
    let index = 0;
    for (const neuron of this.layers[this.layers.length - 1]) {
      if (neuron.activationValue > maxValue) {
        maxValue = neuron.activationValue;
        maxIndex = index;
      }
      index += 1;
    }
    if (maxIndex === expectedValueIndex) {
      this.totalCorrect += 1;
    }
  }

  shuffleData(dataX: math.Number[][], dataY: math.Number[][]): math.Number[][][] {
    const shuffledDataX = [];
    const shuffledDataY = [];
    while (dataX.length > 0) {
      const randIndex = math.randomInt(0, dataX.length - 1);
      shuffledDataX.push(dataX[randIndex]);
      shuffledDataY.push(dataY[randIndex]);
      dataX.splice(randIndex, 1);
      dataY.splice(randIndex, 1);
    }
    return [shuffledDataX, shuffledDataY];
  }

  runNetwork(imageData: math.Number[]): void {
     for (let px = 0; px < imageData.length; px++) {
       this.layers[0][px].activationValue = math.divide(imageData[px], 255);
     }
     for (let layerNo = 1; layerNo < this.layers.length; layerNo++) {
       for (const neuron of this.layers[layerNo]) {
         neuron.calculateActivationValue(this.layers[layerNo - 1]);
       }
     }
  }

  parseCSV(csvText: string): math.Number[][][] {
    const dataX = [];
    const dataY = [];
    const lines = csvText.split('\n');
    for (const line of lines) {
      const data = line.split(',').map(entry => +entry);
      const label = Array<math.Number>(10).fill(0);
      label[data[0]] = 1;
      data.shift();
      dataX.push(data);
      dataY.push(label);
    }
    return [dataX, dataY];
  }

  createEmptyNeuronDerivArray(): NeuronDeriv[][] {
    const neuronDeriv = [];
    for (let i = 1; i < this.layers.length; i++) {
      neuronDeriv.push(Array<NeuronDeriv>(this.layers[i].length).fill(undefined).map(() => new NeuronDeriv()));
    }
    return neuronDeriv;
  }

  updateWeights(): void {
    const avgGrad = this.getAverageGradient();
    const eta = 0.01;
    for (let i = 1; i < this.layers.length; i++) {
      for (let j = 0; j < this.layers[i].length; j++) {
        this.layers[i][j].adjustWeights(avgGrad[i - 1][j].weightDeriv, eta);
        this.layers[i][j].adjustBias(avgGrad[i - 1][j].biasDeriv, eta);
      }
    }
  }

  getAverageGradient(): NeuronDeriv[][] {
    const avgGrad = this.createEmptyNeuronDerivArray();
    for (let i = 1; i < this.layers.length; i++) {
      for (let j = 0; j < this.layers[i].length; j++) {
        avgGrad[i - 1][j].weightDeriv = Array<math.Number>(this.layers[i - 1].length).fill(0);
      }
    }
    for (const gradient of this.gradients) {
      for (let i = 0; i < gradient.length; i++) {
        for (let j = 0; j < gradient[i].length; j++) {
          avgGrad[i][j].biasDeriv = math.add(avgGrad[i][j].biasDeriv,
            math.divide(gradient[i][j].biasDeriv, gradient[i].length));
          avgGrad[i][j].weightDeriv = math.add(avgGrad[i][j].weightDeriv,
            math.divide(gradient[i][j].weightDeriv, gradient[i].length));
        }
      }
    }
    return avgGrad;
  }

  calculateGradient(): NeuronDeriv[][] {
    const gradient = this.createEmptyNeuronDerivArray();
    for (let layerNo = this.layers.length - 1; layerNo > 0; layerNo--) {
      this.activationDeriv = Array<math.Number>(this.layers[layerNo - 1].length).fill(0);
      for (let neuronNo = 0; neuronNo < this.layers[layerNo].length; neuronNo++) {
        const neuron = this.layers[layerNo][neuronNo];
        const biasDeriv = this.getCostBiasDeriv(layerNo, neuronNo);
        gradient[layerNo - 1][neuronNo].biasDeriv = biasDeriv;
        for (let weightNo = 0; weightNo < neuron.weights.length; weightNo++) {
          gradient[layerNo - 1][neuronNo].weightDeriv.push(
            this.getCostWeightDeriv(layerNo, neuronNo, weightNo, biasDeriv));
          this.activationDeriv = math.add(this.activationDeriv,
            this.getCostActivationDeriv(layerNo, neuronNo, weightNo, biasDeriv));
        }
      }
    }
    return gradient;
  }

  getCostBiasDeriv(layer: number, currNeuron: number): math.Number {
    const neuron = this.layers[layer][currNeuron];
    return math.multiply(neuron.activation(neuron.value, FunctionMode.DERIV),
      this.getPrevCostActivationDeriv(layer, currNeuron));
  }

  getCostWeightDeriv(layer: number, currNeuron: number, prevNeuron: number, costBiasDeriv: math.Number): math.Number {
    return math.multiply(this.layers[layer - 1][prevNeuron].activationValue, costBiasDeriv);
  }

  getCostActivationDeriv(layer: number, currNeuron: number, prevNeuron: number, costBiasDeriv: math.Number): math.Number {
    return math.multiply(this.layers[layer][currNeuron].weights[prevNeuron], costBiasDeriv);
  }

  getPrevCostActivationDeriv(layer: number, currNeuron): math.Number {
    if (layer === this.layers.length - 1) {
      return math.multiply(2, math.subtract(this.layers[layer][currNeuron].activationValue,
        this.expectedValue[currNeuron]));
    } else {
      return this.activationDeriv[currNeuron];
    }
  }
}

