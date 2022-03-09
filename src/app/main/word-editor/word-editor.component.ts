import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { DibiWord } from 'src/app/types';

@Component({
  selector: 'app-word-editor',
  templateUrl: './word-editor.component.html',
  styleUrls: ['./word-editor.component.scss']
})
export class WordEditorComponent implements OnInit {

  @Input() buttonMessage; // Message à afficher dans le bouton d'envoie en bas (Ajouter, Modifier, Proposer)
  @Output() wordEmitter = new EventEmitter<DibiWord>(); // Emitter du mot sur lequel on a travaillé

  dibiDict: DibiWord[];
  message = { mes: '', color: '' };

  word: DibiWord = {
    dibi: '',
    french: '',
    english: '',
    partOfSpeech: 'Noun',
  }

  constructor(private socket: Socket) { }

  ngOnInit(): void {
    this.socket.on('responseAddWord', (data) => {
      if (data.status === 0) {
        this.message = { mes: 'Succès', color: 'green' };
        this.word.dibi = '';
        this.word.french = '';
        this.word.english = '';
        // this.newWord.author = ''; // Auteur conservé
        this.word.date = '';
        this.word.description = '';
      } else {
        this.message = { mes: data.mes, color: 'red' };
      }
      // Clear du message au bout d'un certain délai
      setTimeout(() => { this.message = { mes: '', color: '' }; }, 10000);
    });
  }

  /**
   * Valide le mot, l'envoie au component parent pour ajout, modification ou proposition du mot selon le contexte
   */
  sendWord(): void {
    this.wordEmitter.emit(this.word);
  }

  /**
   * 1)
   * Adapte automatique le formatage de la saisie des mots Dibis, Français et Anglais.
   * Format = Majuscule au début du mot, le reste en minuscule.
   * 2)
   * Vérifie que le mot ne se termine par un espace
   * 3)
   * Scrute la terminaison du mot pour adapter sa nature grammaticale (uniquement si mot Dibi)
   */
  checkFormat(event: any, partOfSpeech: string): void {
    // Setup
    let value: string = event.target.value;
    // Met tout en minuscule (qui le mot Dibi)
    if (partOfSpeech === 'dibi') {
      value = value.toLocaleLowerCase();
    }
    // Set de la première lettre en majuscule
    value = value.charAt(0).toUpperCase() + value.slice(1);
    // Suppression d'espaces à la fin (que le mot Dibi)
    if (partOfSpeech === 'dibi') {
      if (value.endsWith(' ')) {
        console.log(value + '!');
        value = value.slice(0, -1);
        console.log(value + '!');
      }
    }
    // Set du bon formatage du mot Dibi
    this.word[partOfSpeech] = value;
    // Autoadapt de la nature grammaticale
    if (partOfSpeech === 'dibi') {
      if (value.endsWith('e')) {
        this.word.partOfSpeech = 'Verb';
      } else if (value.endsWith('i') || value.endsWith('fo') || value.endsWith('ro') || value.endsWith('ti')) {
        this.word.partOfSpeech = 'Noun';
      } else if (value.endsWith('al')) {
        this.word.partOfSpeech = 'Adjective';
      } else if (value.endsWith('or')) {
        this.word.partOfSpeech = 'Adverb';
      }
    }
  }

}
