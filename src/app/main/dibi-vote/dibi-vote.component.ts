import { Component, Input, OnInit } from '@angular/core';
import { SocialUser } from 'angularx-social-login';
import { Socket } from 'ngx-socket-io';
import { AccountSettings, DibiWordSuggestion } from 'src/app/types';

@Component({
  selector: 'app-dibi-vote',
  templateUrl: './dibi-vote.component.html',
  styleUrls: ['./dibi-vote.component.scss']
})
export class DibiVoteComponent implements OnInit {

  @Input() user: SocialUser;
  @Input() accountSettings: AccountSettings;

  suggestions: DibiWordSuggestion[];

  constructor(private socket: Socket) { }

  ngOnInit(): void {

    // Récupération des suggestions
    this.socket.on('loadSuggestions', list => {
      this.suggestions = list;
    });

    this.socket.emit('fetchSuggestions', {});

  }

}
