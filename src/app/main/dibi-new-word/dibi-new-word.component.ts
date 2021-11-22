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

  message = {mes: '', color: ''};

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
        this.message = {mes: 'Succès', color: 'green'};
        this.newWord.dibi = '';
        this.newWord.french = '';
        this.newWord.english = '';
        this.newWord.author = '';
        this.newWord.date = '';
        this.newWord.description = '';
      } else {
        this.message = {mes: data.mes, color: 'red'};
      }
      // Clear du message au bout d'un certain délai
      setTimeout(() => { this.message = {mes: '', color: ''}; }, 10000);
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
      this.message = {mes: 'Enregistrement...', color: 'yellow'};
      this.socket.emit('addWord', { newWord: this.newWord, pwd: this.pwd });
    }
  }

}
