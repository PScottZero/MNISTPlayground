export class MNISTImage {
  imageData: number[];

  constructor(imageData: string[]) {
    this.imageData = Array.from(imageData, data => +data / 255);
  }

  getImage(): number[] {
    return this.imageData.slice(1);
  }

  getLabel(): number {
    return this.imageData[0];
  }
}
