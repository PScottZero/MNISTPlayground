import * as math from 'mathjs';

export class MNISTData {
  imageData: math.Number[][];
  labels: math.Number[][];

  constructor() {
    this.imageData = [];
    this.labels = [];
  }

  shuffle(): void {
    const shuffledImageData = [];
    const shuffledLabels = [];
    while (this.imageData.length > 0) {
      const randIndex = math.randomInt(0, this.imageData.length - 1);
      shuffledImageData.push(this.imageData[randIndex]);
      shuffledLabels.push(this.labels[randIndex]);
      this.imageData.splice(randIndex, 1);
      this.labels.splice(randIndex, 1);
    }
    this.imageData = shuffledImageData;
    this.labels = shuffledLabels;
  }
}
