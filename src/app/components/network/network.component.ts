import { Component, OnInit } from '@angular/core';
import {NeuralNetworkService} from '../../services/neural-network.service';

@Component({
  selector: 'app-network',
  templateUrl: './network.component.html',
  styleUrls: ['./network.component.scss']
})
export class NetworkComponent implements OnInit {

  constructor(private neuralNetworkService: NeuralNetworkService) { }

  ngOnInit(): void {
  }

}
