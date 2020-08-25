import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule} from "@angular/common/http";

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import {IconButtonComponent} from './components/icon-button/icon-button.component';
import { NetworkComponent } from './components/network/network.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    IconButtonComponent,
    NetworkComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
