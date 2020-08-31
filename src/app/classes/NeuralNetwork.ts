import {Neuron} from './Neuron';
import {ActivationFunction, FunctionMode, SOFTMAX} from './ActivationFunction';
import * as math from 'mathjs';

export class NeuralNetwork {
  layers: Neuron[][];

  constructor(layerSizes: number[], layerActivations: ActivationFunction[]) {
    this.layers = [];
    let prevSize = 0;
    for (let i = 0; i < layerSizes.length; i++) {
      this.layers.push(Array<Neuron>(layerSizes[i])
        .fill(undefined).map(() => new Neuron(prevSize, layerActivations[i])));
      prevSize = layerSizes[i];
    }
  }

  getSize(): number[] {
    return Array.from(this.layers, layer => layer.length);
  }

  getOutputLayer(): Neuron[] {
    return this.layers[this.layers.length - 1];
  }

  getOutputLayerValues(): math.Number[] {
    return Array.from(this.getOutputLayer(), neuron => neuron.value);
  }

  runNetwork(imageData: math.Number[]): void {
    this.setInputLayer(imageData);
    for (let layerNo = 1; layerNo < this.layers.length; layerNo++) {
      for (const neuron of this.layers[layerNo]) {
        neuron.calculateActivationValue(this.layers[layerNo - 1]);
      }
    }
    for (const neuron of this.getOutputLayer()) {
      neuron.activationValue = SOFTMAX(neuron.value, FunctionMode.NORMAL, this.getOutputLayerValues());
    }
  }

  setInputLayer(imageData: math.Number[]): void {
    for (let px = 0; px < imageData.length; px++) {
      this.layers[0][px].activationValue = math.divide(imageData[px], 255);
    }
  }
}
