import { Component, Input, OnInit } from '@angular/core';
import { SocialUser } from 'angularx-social-login';
import { Socket } from 'ngx-socket-io';
import { AccountSettings, DibiWord } from 'src/app/types';

@Component({
  selector: 'app-dibi-suggest',
  templateUrl: './dibi-suggest.component.html',
  styleUrls: ['./dibi-suggest.component.scss']
})
export class DibiSuggestComponent implements OnInit {

  @Input() user: SocialUser;
  @Input() accountSettings: AccountSettings;
  @Input() dibiDict: DibiWord[]; // Dictionnaire récupéré du component principal

  responseSuggestWord: string; // Message de succès ou d'erreur de suggestion
  statusResponse: number; // Status de succès ou d'erreur

  more = false; // Affiche plus d'infos sur la proposition d'un mot

  constructor(private socket: Socket) { }

  ngOnInit(): void {
    this.socket.on('responseSuggestWord', data => {
      this.responseSuggestWord = data.mes;
      this.statusResponse = data.status;
      setTimeout(() => {
        this.responseSuggestWord = undefined;
        this.statusResponse = undefined;
      }, 10000);
    })
  }

  /**
   * Propose un mot en l'ajoutant dans la bdd
   */
  suggestWord(data: any): void {
    if (this.user) {
      if (this.accountSettings?.discordPseudo && this.accountSettings?.discordTag) {
        data.word.author = this.accountSettings.discordPseudo + '#' + this.accountSettings.discordTag;
      }
      if (data.multipleDibi) {
        this.socket.emit('suggestWord', { author: this.user.email, word: data.word, multipleDibi: data.multipleDibi, dibiSuggestions: data.dibiSuggestions });
      } else {
        this.socket.emit('suggestWord', { author: this.user.email, word: data.word, multipleDibi: data.multipleDibi });
      }
    } else {
      window.alert('Vous n\'êtes pas connecté.\nIl faut être connecté pour proposer un mot.');
    }
  }

  /**
   * Affiche ou masque plus d'infos
   */
  toggleMoreInfos(b: boolean): void {
    this.more = b;
  }

}
