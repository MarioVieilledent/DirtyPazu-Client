import { Component, Input, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { DibiWord } from 'src/app/types';

@Component({
  selector: 'app-dibi-new-word',
  templateUrl: './dibi-new-word.component.html',
  styleUrls: ['./dibi-new-word.component.scss']
})
export class DibiNewWordComponent implements OnInit {

  dibiDict: DibiWord[];

  @Input() adminConnected: boolean; // Si un administrateur est connecté
  @Input() pwd: string; // Pwd en localSorage pour plus rester connecté

  message = { mes: '', color: '' };

  newWord: DibiWord = {
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
        this.newWord.dibi = '';
        this.newWord.french = '';
        this.newWord.english = '';
        // this.newWord.author = ''; // Auteur conservé
        this.newWord.date = '';
        this.newWord.description = '';
      } else {
        this.message = { mes: data.mes, color: 'red' };
      }
      // Clear du message au bout d'un certain délai
      setTimeout(() => { this.message = { mes: '', color: '' }; }, 10000);
    });
  }

  /**
   * Ajoute un mot dans la bdd
   */
  addWord(): void {
    if (!this.adminConnected) {
      alert('Administrateur non connecté.');
    } else {
      this.newWord.date = new Date();
      this.message = { mes: 'Enregistrement...', color: 'yellow' };
      this.socket.emit('addWord', { newWord: this.newWord, pwd: this.pwd });
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
    this.newWord[partOfSpeech] = value;
    // Auto adapt de la nature grammaticale
    if (partOfSpeech === 'dibi') {
      if (value.endsWith('e')) {
        this.newWord.partOfSpeech = 'Verb';
      } else if (value.endsWith('i') || value.endsWith('fo') || value.endsWith('ro') || value.endsWith('ti')) {
        this.newWord.partOfSpeech = 'Noun';
      } else if (value.endsWith('al')) {
        this.newWord.partOfSpeech = 'Adjective';
      } else if (value.endsWith('or')) {
        this.newWord.partOfSpeech = 'Adverb';
      }
    }
  }

}
