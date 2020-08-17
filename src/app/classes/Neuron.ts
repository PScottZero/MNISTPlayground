import * as math from 'mathjs';
import {ActivationType} from './ActivationType';

export class Neuron {
  weights: math.Number[];
  activation: ActivationType;
}
