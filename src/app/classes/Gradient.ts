import {NeuronDeriv} from './NeuronDeriv';
import * as math from 'mathjs';
import {Neuron} from './Neuron';

export class Gradient {
  layers: NeuronDeriv[][];

  constructor(networkSize: number[], outputLayer?: Neuron[], expectedValue?: math.Number[]) {
    this.layers = [];
    let prevLayerSize = 0;
    for (const layerSize of networkSize) {
      this.layers.push(Array<NeuronDeriv>(layerSize).fill(undefined).map(() => new NeuronDeriv(prevLayerSize)));
      prevLayerSize = layerSize;
    }
    if (outputLayer !== undefined) {
      for (let i = 0; i < outputLayer.length; i++) {
        this.layers[this.layers.length - 1][i].activationDeriv = math.multiply(2,
          math.subtract(outputLayer[i].activationValue, expectedValue[i]));
      }
    }
  }

  add(gradient: Gradient, miniBatchSize: number): void {
    for (let i = 0; i < this.layers.length; i++) {
      for (let j = 0; j < this.layers[i].length; j++) {
        this.layers[i][j].weightDeriv = math.add(this.layers[i][j].weightDeriv,
          math.divide(gradient.layers[i][j].weightDeriv, miniBatchSize));
        this.layers[i][j].biasDeriv = math.add(this.layers[i][j].biasDeriv,
          math.divide(gradient.layers[i][j].biasDeriv, miniBatchSize));
      }
    }
  }
}
