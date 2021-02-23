import { Component } from '@angular/core';
import { IconButton } from '../../classes/IconButton';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  buttonList = [
    new IconButton(
      'wikipedia.svg',
      'https://en.wikipedia.org/wiki/MNIST_database',
      '#15c1ff'
    ),
    new IconButton('about_me.svg', 'http://pjs4.com', '#0bd5b8'),
    new IconButton(
      'github.svg',
      'https://github.com/PScottZero/MNISTPlayground',
      '#00e971'
    ),
  ];
}
