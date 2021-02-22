import { Component, OnInit } from '@angular/core';
import { NeuralNetworkService } from '../../services/neural-network.service';
import { NetworkSaveData } from '../../classes/NetworkSaveData';
import { NeuralNetwork } from '../../classes/NeuralNetwork';
import digitNetwork from '../../../assets/pretrained/digitNetwork.json';

@Component({
  selector: 'app-visual',
  templateUrl: './visual.component.html',
  styleUrls: ['./visual.component.scss'],
})
export class VisualComponent implements OnInit {
  canvas: HTMLCanvasElement;
  current: number;

  constructor(private neuralNetworkService: NeuralNetworkService) {}

  ngOnInit(): void {
    this.current = 0;
    this.neuralNetworkService.sendMNISTImage.subscribe(() => this.drawImage());
    this.canvas = document.getElementById('visual') as HTMLCanvasElement;
    this.parseNetworkSaveData(digitNetwork);
    this.drawImage();
  }

  async train(): Promise<void> {
    for (let i = 0; i < 10; i++) {
      this.current = i;
      await this.neuralNetworkService.train(i);
    }
  }

  getCertainty(): number {
    return Math.round(this.neuralNetworkService.certainty * 10000) / 100;
  }

  drawImage(): void {
    const context = this.canvas.getContext('2d');
    for (let px = 0; px < this.neuralNetworkService.image.length; px++) {
      const intensity = this.neuralNetworkService.image[px];
      context.fillStyle =
        'rgb(' + intensity + ',' + intensity + ',' + intensity + ')';
      context.fillRect((px % 28) * 10, Math.floor(px / 28) * 10, 10, 10);
    }
  }

  parseNetworkSaveData(networkSave: NetworkSaveData): void {
    const size = networkSave.layers.slice().map((layer) => layer.size);
    size.unshift(784);
    const network = new NeuralNetwork(
      size,
      networkSave.epochCount,
      networkSave.eta
    );
    for (let i = 1; i < network.layers.length; i++) {
      network.layers[i].weights = networkSave.layers[i - 1].weights;
      network.layers[i].biases = networkSave.layers[i - 1].biases;
    }
    network.accuracy = networkSave.accuracy;
    this.neuralNetworkService.network = network;
  }
}
