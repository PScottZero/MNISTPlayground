import {Component, OnInit} from '@angular/core';
import {NeuralNetworkService} from '../../services/neural-network.service';
import * as math from 'mathjs';

const NEURON_OFF = [21, 193, 255];
const NEURON_ON = [0, 233, 113];
const WEIGHT_LOW = [105, 215, 255];
const WEIGHT_HIGH = [115, 240, 176];
const PADDING = 50;

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
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.generateNeuronCoords();
    this.drawWeights();
    this.drawNeurons();
    this.drawOutputLabels();
    this.drawCurrentMNISTImage();
  }

  generateNeuronCoords(): void {
    const layers = this.neuralNetworkService.network.layers;
    const layerSpacing = this.canvas.width / (layers.length - 1);
    this.neuronCoords = [[[600, this.canvas.height / 2]]];
    layers.forEach((layer, index) => {
      if (index !== 0) {
        const xVal = (index === layers.length - 1) ? this.canvas.width - 177.5 : layerSpacing * index;
        this.neuronCoords.push(this.generateLayerCoords(xVal, layer.activValues.length));
      }
    });
  }

  generateLayerCoords(x: number, neuronCount: number): number[][] {
    const neuronRadius = this.getNeuronRadius(neuronCount);
    const positions = [];
    for (let i = 0; i < neuronCount; i++) {
      positions.push([x, neuronRadius + i * (neuronRadius * 2 + PADDING)]);
    }
    return positions;
  }

  drawNeurons(): void {
    const grad = this.context.createLinearGradient(0, 0, 1200, 0);
    grad.addColorStop(0, '#15c1ff');
    grad.addColorStop(1, '#00e971');
    this.neuralNetworkService.network.layers.forEach((layer, layerIndex) => {
      this.neuronCoords[layerIndex].forEach((coord, coordIndex) => {
        let neuronSize = 600;
        this.context.fillStyle = grad;
        if (layerIndex !== 0) {
          neuronSize = this.getNeuronRadius(layer.activValues.length);
          let percent = layer.activValues[coordIndex] / math.max(layer.activValues);
          if (math.max(layer.activValues) === math.min(layer.activValues)) {
            percent = 0;
          }
          this.context.fillStyle = this.getColor(NEURON_OFF, NEURON_ON, percent);
        }
        this.context.beginPath();
        this.context.arc(coord[0], coord[1], neuronSize, 0, 2 * Math.PI);
        this.context.fill();
        this.context.closePath();
      });
    });
  }

  drawOutputLabels(): void {
    this.neuronCoords[this.neuronCoords.length - 1].forEach((coord, coordIndex) => {
      this.context.fillStyle = 'white';
      this.context.font = '200px Arial';
      this.context.fillText(coordIndex.toString(), coord[0] - 55, coord[1] + 70);
    });
  }

  drawCurrentMNISTImage(): void {
    for (let px = 0; px < this.currentImage.length; px++) {
      const intensity = this.currentImage[px];
      if (intensity < 150) {
        this.context.fillStyle = 'transparent';
      } else {
        this.context.fillStyle = 'white';
      }
      this.context.fillRect(180 + (px % 28) * 30,
        1580 + Math.floor(px / 28) * 30, 30, 30);
    }
  }

  drawWeights(): void {
    for (let layerNo = 0; layerNo < this.neuronCoords.length - 1; layerNo++) {
      const weights = this.neuralNetworkService.network.layers[layerNo + 1].weights;
      const max = math.max(weights);
      const min = math.min(weights);
      for (let neuron = 0; neuron < this.neuronCoords[layerNo].length; neuron++) {
        for (let neuronNext = 0; neuronNext < this.neuronCoords[layerNo + 1].length; neuronNext++) {
          const percent = (layerNo !== 0) ? (weights[neuronNext][neuron] - min) / (max - min) : 0;
          this.context.strokeStyle = this.getColor(WEIGHT_LOW, WEIGHT_HIGH, percent);
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

  getNeuronRadius(neuronCount: number): number {
    return (this.canvas.height - PADDING * (neuronCount - 1)) / (neuronCount * 2);
  }

  getColor(colorOff: number[], colorOn: number[], percent: number): string {
    const color = math.add(colorOff, math.multiply(math.subtract(colorOn, colorOff), percent));
    return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
  }
}
