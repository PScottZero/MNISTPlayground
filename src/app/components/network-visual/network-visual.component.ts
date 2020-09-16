import {Component, OnInit} from '@angular/core';
import {NeuralNetworkService} from '../../services/neural-network.service';
import {MnistService} from '../../services/mnist.service';
import {FASHION_LABELS} from '../../classes/MNISTImage';
import * as math from 'mathjs';

const NEURON_OFF = [21, 193, 255];
const NEURON_ON = [0, 233, 113];
const WEIGHT_LOW = [105, 215, 255];
const WEIGHT_HIGH = [115, 240, 176];
const PADDING = 25;
const INPUT_RADIUS = 300;
const OUTPUT_RADIUS = 88.75;
const INNER_INPUT_RADIUS = 275;
const FASHION_OUTPUT_WIDTH = 400;
const WEIGHT_SIZE = 7;

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

  constructor(private neuralNetworkService: NeuralNetworkService,
              private mnistService: MnistService) {}

  ngOnInit(): void {
    this.canvas = document.getElementById('network-visual') as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d');
    this.currentImage = [];
    this.drawNetwork();
    this.neuralNetworkService.sendMNISTImage.subscribe((image) => {
      this.currentImage = image;
      this.drawNetwork();
    });
    this.neuralNetworkService.updateNetworkVisual.subscribe(() => {
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
    this.neuronCoords = [[[INPUT_RADIUS, this.canvas.height / 2]]];
    layers.forEach((layer, index) => {
      if (index !== 0) {
        let xVal: number;
        if (this.mnistService.usingFashionMNIST && index === layers.length - 1) {
          xVal = this.canvas.width - FASHION_OUTPUT_WIDTH;
        } else if (index === layers.length - 1) {
          xVal = this.canvas.width - OUTPUT_RADIUS;
        } else {
          xVal = layerSpacing * index;
        }
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
    const grad = this.context.createLinearGradient(0, 0, INPUT_RADIUS * 2, 0);
    grad.addColorStop(0, '#15c1ff');
    grad.addColorStop(1, '#00e971');
    const layers = this.neuralNetworkService.network.layers;
    layers.forEach((layer, layerIndex) => {
      this.neuronCoords[layerIndex].forEach((coord, coordIndex) => {
        let neuronRadius = INPUT_RADIUS;
        this.context.fillStyle = grad;
        if (layerIndex !== 0) {
          neuronRadius = this.getNeuronRadius(layer.activValues.length);
          let percent = layer.activValues[coordIndex] / math.max(layer.activValues);
          if (math.max(layer.activValues) === math.min(layer.activValues)) {
            percent = 0;
          }
          this.context.fillStyle = this.getColor(NEURON_OFF, NEURON_ON, percent);
        }
        if (this.mnistService.usingFashionMNIST && layerIndex === layers.length - 1) {
          this.context.fillRect(coord[0], coord[1] - neuronRadius, FASHION_OUTPUT_WIDTH, neuronRadius * 2);
        } else {
          this.context.beginPath();
          this.context.arc(coord[0], coord[1], neuronRadius, 0, 2 * Math.PI);
          this.context.fill();
          this.context.closePath();
        }
      });
    });
  }

  drawOutputLabels(): void {
    this.neuronCoords[this.neuronCoords.length - 1].forEach((coord, coordIndex) => {
      this.context.fillStyle = 'white';
      this.context.font = '100px Arial';
      this.context.textAlign = 'center';

      if (!this.mnistService.usingFashionMNIST) {
        this.context.fillText(coordIndex.toString(), coord[0], coord[1] + 35);
      } else {
        this.context.fillText(FASHION_LABELS[coordIndex], coord[0] + FASHION_OUTPUT_WIDTH / 2, coord[1] + 35);
      }
    });
  }

  drawCurrentMNISTImage(): void {
    this.context.fillStyle = 'black';
    this.context.beginPath();
    this.context.arc(INPUT_RADIUS, 1000, INNER_INPUT_RADIUS, 0, 2 * Math.PI);
    this.context.fill();
    this.context.closePath();
    for (let px = 0; px < this.currentImage.length; px++) {
      const intensity = this.currentImage[px];
      this.context.fillStyle = 'rgb(' + intensity + ',' + intensity + ',' + intensity + ')';
      this.context.fillRect(111 + (px % 28) * 13.5,
        811 + Math.floor(px / 28) * 13.5, 13.5, 13.5);
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
          this.context.lineWidth = WEIGHT_SIZE;
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
