import { Component, Input, OnInit } from '@angular/core';
import { SocialUser } from 'angularx-social-login';
import { Socket } from 'ngx-socket-io';
import { DibiWord } from 'src/app/types';

@Component({
  selector: 'app-dibi-suggest',
  templateUrl: './dibi-suggest.component.html',
  styleUrls: ['./dibi-suggest.component.scss']
})
export class DibiSuggestComponent implements OnInit {

  @Input() user: SocialUser;

  more = false; // Affiche plus d'infos sur la proposition d'un mot

  constructor(private socket: Socket) { }

  ngOnInit(): void {
  }

  /**
   * Propose un mot en l'ajoutant dans la bdd
   */
  suggestWord(word: DibiWord): void {
    console.log(word);
  }

  /**
   * Affiche ou masque plus d'infos
   */
  toggleMoreInfos(b: boolean): void {
    this.more = b;
  }

}
