import { LayerSaveData } from './LayerSaveData';

export class NetworkSaveData {
  constructor(
    public layers: LayerSaveData[],
    public accuracy: number,
    public epochCount: number,
    public eta: number
  ) {}
}
