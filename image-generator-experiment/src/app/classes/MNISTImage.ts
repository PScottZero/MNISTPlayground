export const FASHION_LABELS = [
  'T-Shirt',
  'Trouser',
  'Pullover',
  'Dress',
  'Coat',
  'Sandal',
  'Shirt',
  'Sneaker',
  'Bag',
  'Boot',
];

export class MNISTImage {
  imageData: number[];

  constructor(imageData: string[]) {
    this.imageData = Array.from(imageData, (data) => +data);
  }

  getImage(): number[] {
    return this.imageData.slice(1);
  }

  getLabel(): number {
    return this.imageData[0];
  }
}
