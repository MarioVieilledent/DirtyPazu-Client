import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { ChartsModule } from 'ng2-charts';

import { MainComponent } from './main/main.component';
import { FlagComponent } from './main/flag/flag.component';
import { DibiInfosComponent } from './main/dibi-infos/dibi-infos.component';
import { DibiDictComponent } from './main/dibi-dict/dibi-dict.component';
import { DibiNewWordComponent } from './main/dibi-new-word/dibi-new-word.component';
import { DibiMcComponent } from './main/dibi-mc/dibi-mc.component';
import { LogsComponent } from './main/logs/logs.component';
import { InfosComponent } from './main/infos/infos.component';
import { ConnectCenterComponent } from './main/connect-center/connect-center.component';

const hostname = window.location.hostname;
const url = (hostname === 'localhost') ? `${window.location.protocol}//${hostname}:5000` : undefined;
const config: SocketIoConfig = { url, options: {} };

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    FlagComponent,
    DibiDictComponent,
    DibiInfosComponent,
    DibiNewWordComponent,
    DibiMcComponent,
    LogsComponent,
    InfosComponent,
    ConnectCenterComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    SocketIoModule.forRoot(config),
    ChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
