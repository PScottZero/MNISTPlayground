import * as math from 'mathjs';

export class NeuronDeriv {
  weightDeriv: math.Number[];
  biasDeriv: math.Number;
  activationDeriv: math.Number;

  constructor(weightCount: number) {
    this.weightDeriv = Array<math.Number>(weightCount).fill(0);
    this.biasDeriv = 0;
    this.activationDeriv = 0;
  }
}
