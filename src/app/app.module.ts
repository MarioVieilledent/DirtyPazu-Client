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
import { LogsComponent } from './main/logs/logs.component';
import { InfosComponent } from './main/infos/infos.component';
import { ConnectCenterComponent } from './main/connect-center/connect-center.component';
import { DibiSuggestComponent } from './main/dibi-suggest/dibi-suggest.component';
import { WordEditorComponent } from './main/word-editor/word-editor.component';
import { DibiVoteComponent } from './main/dibi-vote/dibi-vote.component';

// Social connexion
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
const socialId = '886518860996-o45rlpuk1f0n9verombausklme0ampga.apps.googleusercontent.com';

// Socket.io
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
    LogsComponent,
    InfosComponent,
    ConnectCenterComponent,
    DibiSuggestComponent,
    WordEditorComponent,
    DibiVoteComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    SocketIoModule.forRoot(config),
    ChartsModule,
    SocialLoginModule
  ],
  providers: [{
    provide: 'SocialAuthServiceConfig',
    useValue: {
      autoLogin: false,
      providers: [
        {
          id: GoogleLoginProvider.PROVIDER_ID,
          provider: new GoogleLoginProvider(socialId)
        },
        {
          id: FacebookLoginProvider.PROVIDER_ID,
          provider: new FacebookLoginProvider(socialId)
        }
      ]
    } as SocialAuthServiceConfig,
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
