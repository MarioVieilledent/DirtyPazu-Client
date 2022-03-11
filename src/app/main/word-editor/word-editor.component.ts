import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { DibiWord, Suggestion } from 'src/app/types';

@Component({
  selector: 'app-word-editor',
  templateUrl: './word-editor.component.html',
  styleUrls: ['./word-editor.component.scss']
})
export class WordEditorComponent implements OnInit {

  @Input() use; // Utilisation du component
  @Output() wordEmitter = new EventEmitter<any>(); // Emitter du mot sur lequel on a travaillé

  @Input() dibiDict: DibiWord[];
  message = { mes: '', color: '' };

  word: DibiWord = {
    dibi: '',
    french: '',
    english: '',
    partOfSpeech: 'Noun',
  }

  // Dans le cas d'une suggestion de mot, plusieurs suggestions peuvent être proposées pour le mot dibi
  multipleDibi = false;
  dibiSuggestions: Suggestion[] = [{}, {}, {}];

  constructor(private socket: Socket) { }

  ngOnInit(): void {
  }

  /**
   * Valide le mot, l'envoie au component parent pour ajout, modification ou proposition du mot selon le contexte
   */
  sendWord(): void {
    if (this.multipleDibi) {
      this.wordEmitter.emit({ word: this.word, multipleDibi: this.multipleDibi, dibiSuggestions: this.dibiSuggestions });
    } else {
      this.wordEmitter.emit({ word: this.word, multipleDibi: this.multipleDibi });
    }
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
        value = value.slice(0, -1);
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

  /**
   * Dans le cas d'une proposition d'un mot avec plusieurs versions Dibi, ajout d'une nouvelle ligne
   * Maximum 12 propositions
   */
  addRowSuggestion(): void {
    this.dibiSuggestions.push({});
  }

  /**
   * Dans le cas d'une proposition d'un mot avec plusieurs versions Dibi, suppression d'une ligne
   */
  removeRowSuggestion(i: number): void {
    this.dibiSuggestions.splice(i, 1);
  }

}
