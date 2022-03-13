import { Component, Input, OnInit } from '@angular/core';
import { SocialUser } from 'angularx-social-login';
import { Socket } from 'ngx-socket-io';
import { AccountSettings, DibiWord, DibiWordsSuggestion } from 'src/app/types';

@Component({
  selector: 'app-dibi-vote',
  templateUrl: './dibi-vote.component.html',
  styleUrls: ['./dibi-vote.component.scss']
})
export class DibiVoteComponent implements OnInit {

  @Input() dibiDict: DibiWord[];
  @Input() suggestions: DibiWordsSuggestion[];
  @Input() user: SocialUser;
  @Input() accountSettings: AccountSettings;
  @Input() profiles: any;

  allLoaded = false; // Attent que tous les éléments soit chargés depuis le component parent

  constructor(private socket: Socket) { }

  ngOnInit(): void {

  }

  ngOnChanges(): void {
    // Une fois que tous les éléments en inputs sont biens chargés
    if (this.dibiDict && this.suggestions && this.user && this.accountSettings && this.profiles && !this.allLoaded) {
      this.allLoaded = true;
    }
  }

}
