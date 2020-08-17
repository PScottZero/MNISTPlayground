import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  buttonList = [
    {icon: 'about_me.svg', link: 'http://pjs4.com', color: '#15c1ff'},
    {icon: 'github.svg', link: 'https://github.com/PScottZero/MNISTPlayground', color: '#00e971'}
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
