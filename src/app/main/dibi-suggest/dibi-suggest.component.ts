import { Component, Input, OnInit } from '@angular/core';
import { SocialUser } from 'angularx-social-login';
import { Socket } from 'ngx-socket-io';
import { AccountSettings, DibiWord, DibiWordsSuggestion } from 'src/app/types';

@Component({
  selector: 'app-dibi-suggest',
  templateUrl: './dibi-suggest.component.html',
  styleUrls: ['./dibi-suggest.component.scss']
})
export class DibiSuggestComponent implements OnInit {

  @Input() dibiDict: DibiWord[];
  @Input() suggestions: DibiWordsSuggestion[];
  @Input() user: SocialUser;
  @Input() accountSettings: AccountSettings;

  allLoaded = false; // Attent que tous les éléments soit chargés depuis le component parent

  dibiWordsSuggestion: DibiWordsSuggestion;

  responseSuggestWord: string; // Message de succès ou d'erreur de suggestion
  statusResponse: number; // Status de succès ou d'erreur

  displaySendButton = false; // Affiche le boutton d'envoie une fois que tout est conforme

  more = false; // Affiche plus d'infos sur la proposition d'un mot

  constructor(private socket: Socket) { }

  ngOnInit(): void {
    // Récupération de la réponse serveur apprès proposition
    this.socket.on('responseSuggestWord', data => {
      this.responseSuggestWord = data.mes;
      this.statusResponse = data.status;
      if (data.status === 0) {
        this.dibiWordsSuggestion = {
          version: 1,
          author: this.user.email,
          words: [{
            dibis: [{ dibi: '' }],
            french: '',
            partOfSpeech: 'Noun'
          }],
          optionsDescription: [''],
          description: '',
          upVotes: [],
          downVotes: [],
          comments: [],
          state: 'suggested'
        }
      }
      setTimeout(() => {
        this.responseSuggestWord = undefined;
        this.statusResponse = undefined;
      }, 30000);
    });
  }

  ngOnChanges(): void {
    // Une fois que tous les éléments en inputs sont biens chargés
    if (this.dibiDict && this.suggestions && this.user && this.accountSettings && !this.allLoaded) {
      this.allLoaded = true;
      // Création de l'objet js dibiWordsSuggestion
      this.dibiWordsSuggestion = {
        version: 1,
        author: this.user.email,
        words: [{
          dibis: [{ dibi: '' }],
          french: '',
          partOfSpeech: 'Noun'
        }],
        optionsDescription: [''],
        description: '',
        upVotes: [],
        downVotes: [],
        comments: [],
        state: 'suggested'
      };
    }
  }

  /**
   * Ajoute un mot à la liste des mots suggérés
   */
  addWord(): void {
    // Ajout d'un mot jusqu'à 12 maximum pour une suggestion
    if (this.dibiWordsSuggestion.words.length < 12) {
      let temp = [];
      this.dibiWordsSuggestion.words[0].dibis.forEach(() => {
        temp.push({ dibi: '' });
      });
      this.dibiWordsSuggestion.words.push({
        dibis: temp,
        french: '',
        partOfSpeech: 'Noun'
      });
    }
  }

  /**
   * Retire un pot spécifique de la liste des mots suggérés
   */
  removeWord(index: number): void {
    this.dibiWordsSuggestion.words.splice(index, 1);
  }

  /**
   * Ajoute une option de mot dibi à tous les mots
   */
  addDibiOption(): void {
    // Enlevement d'une option jusqu'à 12 maximum
    if (this.dibiWordsSuggestion.words[0].dibis.length < 12) {
      // Modification de toutes les options de chaque mot
      this.dibiWordsSuggestion.words.forEach(word => {
        word.dibis.push({ dibi: '' });
      });
      // Modification du nombre de descriptions
      this.dibiWordsSuggestion.optionsDescription.push('');
    }
  }

  /**
   * Enlève une option (la dernière) de mot dibi à tous les mots
   */
  removeDibiOption(): void {
    // Enlevement d'une option sauf s'il en reste qu'une
    if (this.dibiWordsSuggestion.words[0].dibis.length > 1) {
      // Modification de toutes les options de chaque mot
      this.dibiWordsSuggestion.words.forEach(word => {
        word.dibis.pop();
      });
      // Modification du nombre de descriptions
      this.dibiWordsSuggestion.optionsDescription.pop();
    }
  }

  /**
   * Propose un mot en l'ajoutant dans la bdd
   */
  check(): void {
    // Vérification de la conformité des données
    this.responseSuggestWord = undefined;
    this.statusResponse = undefined;
    let isValid = true;
    this.dibiWordsSuggestion.words.forEach(word => {
      if (!word.french) {
        isValid = false;
      }
      word.dibis.forEach(option => {
        if (!option.dibi) {
          isValid = false;
        }
      })
    });
    if (isValid) {
      this.displaySendButton = true;
      this.responseSuggestWord = 'Ok';
      this.statusResponse = 0;
      setTimeout(() => {
        this.responseSuggestWord = undefined;
        this.statusResponse = undefined;
      }, 10000);
    } else {
      this.responseSuggestWord = 'Tous les champs obligatoires ne sont pas remplis';
      this.statusResponse = 1;
      setTimeout(() => {
        this.responseSuggestWord = undefined;
        this.statusResponse = undefined;
      }, 10000);
    }
  }

  /**
   * Envoie la suggestion au serveur
   */
  sendSuggestion(): void {
    this.responseSuggestWord = undefined;
    this.statusResponse = undefined;
    this.displaySendButton = false;
    this.socket.emit('sendSuggestion', this.dibiWordsSuggestion);
  }

  /**
   * Affiche ou masque plus d'infos
   */
  toggleMoreInfos(b: boolean): void {
    this.more = b;
  }

}
