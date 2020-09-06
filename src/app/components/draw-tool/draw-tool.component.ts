import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NeuralNetworkService} from '../../services/neural-network.service';

@Component({
  selector: 'app-draw-tool',
  templateUrl: './draw-tool.component.html',
  styleUrls: ['./draw-tool.component.scss']
})
export class DrawToolComponent implements OnInit {
  @ViewChild('drawing')
  canvas: ElementRef<HTMLCanvasElement>;
  drawingEnabled: boolean;
  guess: number;

  constructor(private neuralNetworkService: NeuralNetworkService) { }

  ngOnInit(): void {
    this.guess = 0;
    this.disableDrawing();
  }

  isTraining(): boolean {
    return this.neuralNetworkService.isTraining;
  }

  enableDrawing(): void {
    this.drawingEnabled = true;
  }

  disableDrawing(): void {
    this.drawingEnabled = false;
  }

  testDrawing(): void {
    const image = this.canvas.nativeElement.getContext('2d').getImageData(0, 0, 28, 28);
    const imageArray = [];
    for (let i = 0; i < image.data.length; i += 4) {
      imageArray.push((image.data[i] + image.data[i + 1] + image.data[i + 2]) / 3);
    }
    this.neuralNetworkService.forwardPropagation(imageArray);
    this.guess = this.neuralNetworkService.getGuess();
  }

  clearDrawing(): void {
    const ctx = this.canvas.nativeElement.getContext('2d');
    ctx.clearRect(0, 0, 28, 28);
  }

  draw(event): void {
    if (this.drawingEnabled)  {
      const ctx = this.canvas.nativeElement.getContext('2d');
      const bound = this.canvas.nativeElement.getBoundingClientRect();
      const ratio = bound.width / this.canvas.nativeElement.width;
      const mouseX = event.pageX - bound.x;
      const mouseY = event.pageY - bound.y;
      ctx.fillStyle = 'white';
      ctx.fillRect(Math.floor(mouseX / ratio), Math.floor(mouseY / ratio), 2, 2);
    }
  }
}
