import { Injectable } from '@angular/core';
import { MNISTImage } from '../classes/MNISTImage';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as math from 'mathjs';

@Injectable({
  providedIn: 'root',
})
export class MnistService {
  digitTrain: MNISTImage[];
  digitTest: MNISTImage[];
  fashionTrain: MNISTImage[];
  fashionTest: MNISTImage[];
  usingFashionMNIST: boolean;

  constructor(private http: HttpClient) {
    this.loadData('assets/mnist/mnist_train_reduced.csv').subscribe(
      (csv) => (this.digitTrain = this.parseCsv(csv))
    );
    this.loadData('assets/mnist/mnist_test_reduced.csv').subscribe(
      (csv) => (this.digitTest = this.parseCsv(csv))
    );
    this.loadData('assets/mnist/fashion-mnist_train_reduced.csv').subscribe(
      (csv) => (this.fashionTrain = this.parseCsv(csv))
    );
    this.loadData('assets/mnist/fashion-mnist_test_reduced.csv').subscribe(
      (csv) => (this.fashionTest = this.parseCsv(csv))
    );
    this.usingFashionMNIST = false;
  }

  loadData(dir: string): Observable<string> {
    return this.http.get(dir, { responseType: 'text' });
  }

  parseCsv(csv: string): MNISTImage[] {
    const lines = csv.split('\n');
    lines.pop();
    return Array.from(lines, (line) => new MNISTImage(line.split(',')));
  }

  getTrainData(): MNISTImage[] {
    return this.usingFashionMNIST ? this.fashionTrain : this.digitTrain;
  }

  getTestData(): MNISTImage[] {
    return this.usingFashionMNIST ? this.fashionTest : this.digitTest;
  }

  shuffle(): void {
    const shuffledData = [];
    while (this.getTrainData().length > 0) {
      const randIndex = math.randomInt(0, this.getTrainData().length);
      shuffledData.push(this.getTrainData()[randIndex]);
      this.getTrainData().splice(randIndex, 1);
    }
    if (this.usingFashionMNIST) {
      this.fashionTrain = shuffledData;
    } else {
      this.digitTrain = shuffledData;
    }
  }

  getRandomTestImage(): number[] {
    const randIndex = math.randomInt(0, this.getTestData().length);
    if (this.usingFashionMNIST) {
      return this.fashionTest[randIndex].getImage();
    } else {
      return this.digitTest[randIndex].getImage();
    }
  }
}
