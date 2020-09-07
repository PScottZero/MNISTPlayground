import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-rounded-button',
  templateUrl: './rounded-button.component.html',
  styleUrls: ['./rounded-button.component.scss']
})
export class RoundedButtonComponent {
  @Input() text: string;
  @Input() disabled: boolean;
}
