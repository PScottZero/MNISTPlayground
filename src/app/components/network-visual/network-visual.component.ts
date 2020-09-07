import {Component, OnInit} from '@angular/core';
import {NeuralNetworkService} from '../../services/neural-network.service';
import * as math from 'mathjs';

@Component({
  selector: 'app-network',
  templateUrl: './network-visual.component.html',
  styleUrls: ['./network-visual.component.scss']
})
export class NetworkVisualComponent implements OnInit {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  currentImage: number[];

  constructor(private neuralNetworkService: NeuralNetworkService) {}

  ngOnInit(): void {
    this.canvas = document.getElementById('network-visual') as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');
    this.currentImage = [];
    this.drawNetwork();

    this.neuralNetworkService.imageEmitter.subscribe((image) => {
      this.currentImage = image;
      this.drawNetwork();
    });
  }

  drawNetwork(): void {
    this.drawInputLayer();
    this.drawHiddenLayers();
    this.drawOutputLayer();
  }

  drawInputLayer(): void {
    const grad = this.context.createLinearGradient(0, 0, 1200, 0);
    grad.addColorStop(0, '#15c1ff');
    grad.addColorStop(1, '#00e971');
    this.context.fillStyle = grad;
    this.context.beginPath();
    this.context.arc(600, 2000, 600, 0, 2 * Math.PI);
    this.context.fill();
    this.context.closePath();
    this.drawCurrentImage();
  }

  drawHiddenLayers(): void {
    const layers = this.neuralNetworkService.network.layers;
    const layerCount = layers.length;
    const spacing = 8000 / (layerCount - 1);
    for (let i = 1; i < layerCount - 1; i++) {
      const currLayer = this.neuralNetworkService.network.layers[i];
      const neuronCount = currLayer.activValues.length;
      const positions = this.getNeuronPositions(neuronCount, 50);
      const neuronSize = this.getNeuronSize(neuronCount, 50);
      const max = math.max(currLayer.activValues);
      const xVal = spacing * i;
      for (let j = 0; j < neuronCount; j++) {
        this.context.beginPath();
        this.context.fillStyle = this.getNeuronColor(currLayer.activValues[j] / max);
        this.context.arc(xVal, positions[j], neuronSize / 2, 0, 2 * Math.PI);
        this.context.fill();
        this.context.closePath();
      }
    }
  }

  drawOutputLayer(): void {
    const output = this.neuralNetworkService.network.layers[
      this.neuralNetworkService.network.layers.length - 1];
    for (let i = 0; i < 10; i++) {
      this.context.beginPath();
      this.context.fillStyle = this.getNeuronColor(output.activValues[i]);
      this.context.arc(7822.5, 177.5 + (400 * i), 177.5, 0, 2 * Math.PI);
      this.context.fill();
      this.context.closePath();
      this.context.fillStyle = 'white';
      this.context.font = '200px Arial';
      this.context.fillText(i.toString(), 7770, 250 + (400 * i));
    }
  }

  drawCurrentImage(): void {
    const baseX = 180;
    const baseY = 1580;
    const width = 28;
    const pxSize = 30;
    for (let px = 0; px < this.currentImage.length; px++) {
      const intensity = this.currentImage[px];
      if (intensity < 150) {
        this.context.fillStyle = 'transparent';
      } else {
        this.context.fillStyle = 'white';
      }
      this.context.fillRect(baseX + (px % width) * pxSize,
        baseY + Math.floor(px / width) * pxSize, pxSize, pxSize);
    }
  }

  getNeuronSize(neuronCount: number, padding: number): number {
    return (4000 - padding * (neuronCount - 1)) / neuronCount;
  }

  getNeuronPositions(neuronCount: number, padding: number): number[] {
    const neuronSize = this.getNeuronSize(neuronCount, padding);
    const positions = [];
    const base = neuronSize / 2;
    for (let i = 0; i < neuronCount; i++) {
      positions.push(base + i * (neuronSize + padding));
    }
    return positions;
  }

  getNeuronColor(percent: number): string {
    const off = [21, 193, 255];
    const on = [0, 233, 113];
    const color = math.add(off, math.multiply(math.subtract(on, off), percent));
    return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
  }
}
