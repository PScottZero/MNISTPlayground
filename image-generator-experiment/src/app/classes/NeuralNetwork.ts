import {Layer} from './Layer';
import {math} from './mathjs';

export class NeuralNetwork {
  size: number[];
  layers: Layer[];
  epochCount: number;
  eta: number;
  accuracy: number;

  constructor(size: number[], epochCount: number, eta: number) {
    this.configureNetwork(size);
    this.size = size;
    this.epochCount = epochCount;
    this.eta = eta;
    this.accuracy = 0;
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

  configureNetworkFromJSON(networkJSON: any): void {
    this.layers = [];
    for (const layer of networkJSON.layers) {
      const newLayer = new Layer(0, undefined, false);
      newLayer.weights = layer.weights;
      newLayer.biases = layer.biases;
      newLayer.isOutput = layer.isOutput;
      newLayer.size = layer.size;
      newLayer.activValues = math.zeros(layer.size);
      this.layers.push(newLayer);
    }
    this.size = networkJSON.size;
    this.epochCount = networkJSON.epochCount;
    this.eta = networkJSON.eta;
    this.accuracy = networkJSON.accuracy;
    this.restorePrevLayers();
  }

  removePrevLayers(): void {
    for (const layer of this.layers) {
      layer.prevLayer = undefined;
    }
  }

  restorePrevLayers(): void {
    for (let layerNo = 1; layerNo < this.layers.length; layerNo++) {
      this.layers[layerNo].prevLayer = this.layers[layerNo - 1];
    }
  }
}
