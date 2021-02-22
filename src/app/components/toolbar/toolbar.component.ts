import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent implements OnInit {
  showConfigWindow: boolean;
  showTrainWindow: boolean;
  showDrawWindow: boolean;

  ngOnInit(): void {
    if (window.innerWidth < 700) {
      this.showConfigWindow = false;
      this.showTrainWindow = false;
      this.showDrawWindow = false;
    } else {
      this.showConfigWindow = true;
      this.showTrainWindow = true;
      this.showDrawWindow = true;
    }
  }

  toggleConfigWindow(): void {
    this.showConfigWindow = !this.showConfigWindow;
    if (this.showConfigWindow === true) {
      this.showTrainWindow = false;
      this.showDrawWindow = false;
    }
  }

  toggleTrainWindow(): void {
    this.showTrainWindow = !this.showTrainWindow;
    if (this.showTrainWindow === true) {
      this.showConfigWindow = false;
      this.showDrawWindow = false;
    }
  }

  toggleDrawWindow(): void {
    this.showDrawWindow = !this.showDrawWindow;
    if (this.showDrawWindow === true) {
      this.showConfigWindow = false;
      this.showTrainWindow = false;
    }
  }
}
