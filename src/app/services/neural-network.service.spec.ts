import { TestBed } from '@angular/core/testing';

import { NeuralNetworkService } from './neural-network.service';

describe('NeuralNetworkService', () => {
  let service: NeuralNetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NeuralNetworkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('test network setup', () => {
    expect(service.layers.length).toBe(4);
    expect(service.layers[0].length).toBe(784);
    expect(service.layers[1].length).toBe(16);
    expect(service.layers[2].length).toBe(16);
    expect(service.layers[3].length).toBe(10);
  });
});
