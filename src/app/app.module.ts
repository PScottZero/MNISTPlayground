import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { IconButtonComponent } from './components/buttons/icon-button/icon-button.component';
import { NetworkVisualComponent } from './components/network-visual/network-visual.component';
import { TrainToolComponent } from './components/tools/train-tool/train-tool.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { NetworkConfigToolComponent } from './components/tools/network-config-tool/network-config-tool.component';
import { DrawToolComponent } from './components/tools/draw-tool/draw-tool.component';
import { RoundedButtonComponent } from './components/buttons/rounded-button/rounded-button.component';
import { FormsModule } from '@angular/forms';
import { SwitchComponent } from './components/buttons/switch/switch.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    IconButtonComponent,
    NetworkVisualComponent,
    TrainToolComponent,
    ToolbarComponent,
    NetworkConfigToolComponent,
    DrawToolComponent,
    RoundedButtonComponent,
    SwitchComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
