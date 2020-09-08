import {Component, OnInit} from '@angular/core';
import {NeuralNetworkService} from '../../services/neural-network.service';
import * as math from 'mathjs';

const NEURON_OFF = [21, 193, 255];
const NEURON_ON = [0, 233, 113];
const WEIGHT_LOW = [105, 215, 255];
const WEIGHT_HIGH = [115, 240, 176];
const CANVAS_WIDTH = 8000;
const CANVAS_HEIGHT = 4000;

@Component({
  selector: 'app-network',
  templateUrl: './network-visual.component.html',
  styleUrls: ['./network-visual.component.scss']
})
export class NetworkVisualComponent implements OnInit {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  currentImage: number[];
  neuronCoords: number[][][];

  constructor(private neuralNetworkService: NeuralNetworkService) {}

  ngOnInit(): void {
    this.canvas = document.getElementById('network-visual') as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');
    this.context.globalCompositeOperation = 'destination-over';
    this.currentImage = [];
    this.drawNetwork();

    this.neuralNetworkService.imageEmitter.subscribe((image) => {
      this.currentImage = image;
      this.drawNetwork();
    });

    this.neuralNetworkService.updateNetworkImage.subscribe(() => {
      this.drawNetwork();
    });
  }

  drawNetwork(): void {
    this.context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.neuronCoords = [];
    this.drawInputLayer();
    this.drawHiddenLayers();
    this.drawOutputLayer();
    this.drawWeightLines();
  }

  drawInputLayer(): void {
    this.drawCurrentImage();
    const grad = this.context.createLinearGradient(0, 0, 1200, 0);
    grad.addColorStop(0, '#15c1ff');
    grad.addColorStop(1, '#00e971');
    this.context.fillStyle = grad;
    this.context.beginPath();
    this.context.arc(600, 2000, 600, 0, 2 * Math.PI);
    this.context.fill();
    this.context.closePath();
    this.neuronCoords.push([[600, 2000]]);
  }

  drawHiddenLayers(): void {
    const layers = this.neuralNetworkService.network.layers;
    const layerCount = layers.length;
    const spacing = CANVAS_WIDTH / (layerCount - 1);
    for (let i = 1; i < layerCount - 1; i++) {
      const currLayer = this.neuralNetworkService.network.layers[i];
      const neuronCount = currLayer.activValues.length;
      const positions = this.getNeuronPositions(neuronCount, 50);
      const neuronSize = this.getNeuronSize(neuronCount, 50);
      const max = math.max(currLayer.activValues);
      const xVal = spacing * i;
      this.neuronCoords.push([]);
      for (let j = 0; j < neuronCount; j++) {
        this.context.beginPath();
        this.context.fillStyle = this.getColor(NEURON_OFF, NEURON_ON, currLayer.activValues[j] / max);
        this.context.arc(xVal, positions[j], neuronSize / 2, 0, 2 * Math.PI);
        this.context.fill();
        this.context.closePath();
        this.neuronCoords[i].push([xVal, positions[j]]);
      }
    }
  }

  drawOutputLayer(): void {
    const output = this.neuralNetworkService.network.layers[
      this.neuralNetworkService.network.layers.length - 1];
    this.neuronCoords.push([]);
    for (let i = 0; i < 10; i++) {
      this.context.fillStyle = 'white';
      this.context.font = '200px Arial';
      this.context.fillText(i.toString(), 7770, 250 + (400 * i));
      this.context.beginPath();
      this.context.fillStyle = this.getColor([21, 193, 255], [0, 233, 113], output.activValues[i]);
      this.context.arc(7822.5, 177.5 + (400 * i), 177.5, 0, 2 * Math.PI);
      this.context.fill();
      this.context.closePath();
      this.neuronCoords[this.neuronCoords.length - 1].push([7822.5, 177.5 + (400 * i)]);
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

  drawWeightLines(): void {
    for (let layerNo = 0; layerNo < this.neuronCoords.length - 1; layerNo++) {
      const weights = this.neuralNetworkService.network.layers[layerNo + 1].weights;
      const max = math.max(weights);
      for (let neuron = 0; neuron < this.neuronCoords[layerNo].length; neuron++) {
        for (let neuronNext = 0; neuronNext < this.neuronCoords[layerNo + 1].length; neuronNext++) {
          this.context.strokeStyle = this.getColor(WEIGHT_LOW, WEIGHT_HIGH, weights[neuronNext][neuron] / max);
          this.context.lineWidth = 14;
          this.context.beginPath();
          this.context.moveTo(this.neuronCoords[layerNo][neuron][0],
            this.neuronCoords[layerNo][neuron][1]);
          this.context.lineTo(this.neuronCoords[layerNo + 1][neuronNext][0],
            this.neuronCoords[layerNo + 1][neuronNext][1]);
          this.context.stroke();
          this.context.closePath();
        }
      }
    }
  }

  getNeuronSize(neuronCount: number, padding: number): number {
    return (CANVAS_HEIGHT - padding * (neuronCount - 1)) / neuronCount;
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

  getColor(colorOff: number[], colorOn: number[], percent: number): string {
    const color = math.add(colorOff, math.multiply(math.subtract(colorOn, colorOff), percent));
    return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
  }
}
