import { Injectable } from '@angular/core';
import {MNISTImage} from '../classes/MNISTImage';
import {HttpClient} from '@angular/common/http';
import * as math from 'mathjs';

@Injectable({
  providedIn: 'root'
})
export class MnistService {
  trainData: MNISTImage[];
  testData: MNISTImage[];

  constructor(private http: HttpClient) {
    this.http.get('assets/mnist/mnist_train_reduced.csv', {responseType: 'text'})
      .subscribe(response => {
          const lines = response.split('\n');
          lines.pop();
          this.trainData = Array.from(lines, line => new MNISTImage(line.split(',')));
        }
      );
    this.http.get('assets/mnist/mnist_test_reduced.csv', {responseType: 'text'})
      .subscribe(response => {
          const lines = response.split('\n');
          lines.pop();
          this.testData = Array.from(lines, line => new MNISTImage(line.split(',')));
        }
      );
  }

  shuffle(): void {
    const shuffledData = [];
    while (this.trainData.length > 0) {
      const randIndex = math.randomInt(0, this.trainData.length);
      shuffledData.push(this.trainData[randIndex]);
      this.trainData.splice(randIndex, 1);
    }
    this.trainData = shuffledData;
  }
}
