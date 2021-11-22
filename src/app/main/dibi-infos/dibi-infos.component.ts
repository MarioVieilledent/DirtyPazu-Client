import { Component, OnInit } from '@angular/core';
import { ChartOptions } from 'chart.js';
import { Socket } from 'ngx-socket-io';
import { DibiWord } from 'src/app/types';

@Component({
  selector: 'app-dibi-infos',
  templateUrl: './dibi-infos.component.html',
  styleUrls: ['./dibi-infos.component.scss']
})
export class DibiInfosComponent implements OnInit {

  dibiDict: DibiWord[]; // Tous les mots

  // Stats
  nbPartsOfSpeech: any = [
    { label: 'Noms', savedAs: 'Noun', nb: 0 , color: '#8AE'},
    { label: 'Pronoms', savedAs: 'Pronoun', nb: 0 , color: '#8EE'},
    { label: 'Verbes', savedAs: 'Verb', nb: 0 , color: '#E88'},
    { label: 'Adjectifs', savedAs: 'Adjective', nb: 0 , color: '#8E8'},
    { label: 'Adverbes', savedAs: 'Adverb', nb: 0 , color: '#EA8'},
    { label: 'Conjonctions', savedAs: 'Conjonction', nb: 0 , color: '#E8E'},
    { label: 'Particules', savedAs: 'Particule', nb: 0, color: '#EE8' },
    { label: 'Prépositions', savedAs: 'Preposition', nb: 0 , color: 'rgb(197, 194, 194)'},
    { label: 'Interjections', savedAs: 'Interjection', nb: 0 , color: '#A8E'}
  ]

  // Pie Chart
  options: ChartOptions = { aspectRatio: 1 }
  pieChartLabels = [];
  pieChartData = [];
  pieChartColors: any = [{
    backgroundColor: []
  }];

  constructor(private socket: Socket) { }

  ngOnInit(): void {

    // Demande du dictionnaire
    this.socket.emit('fetchDict', { });

    // Récupération du dictionnaire
    this.socket.on('loadDict', (data) => {
      let list = data.dict;
      this.dibiDict = list;

      // Récupérations des stats
      this.dibiDict.forEach(word => {
        switch (word.partOfSpeech) {
          case('Noun'): this.nbPartsOfSpeech.find(i => i.savedAs === 'Noun').nb++; break;
          case('Pronoun'): this.nbPartsOfSpeech.find(i => i.savedAs === 'Pronoun').nb++; break;
          case('Verb'): this.nbPartsOfSpeech.find(i => i.savedAs === 'Verb').nb++; break;
          case('Adjective'): this.nbPartsOfSpeech.find(i => i.savedAs === 'Adjective').nb++; break;
          case('Adverb'): this.nbPartsOfSpeech.find(i => i.savedAs === 'Adverb').nb++; break;
          case('Preposition'): this.nbPartsOfSpeech.find(i => i.savedAs === 'Preposition').nb++; break;
          case('Conjonction'): this.nbPartsOfSpeech.find(i => i.savedAs === 'Conjonction').nb++; break;
          case('Interjection'): this.nbPartsOfSpeech.find(i => i.savedAs === 'Interjection').nb++; break;
          case('Particule'): this.nbPartsOfSpeech.find(i => i.savedAs === 'Particule').nb++; break;
        }
      });

      // Tri par nombre
      this.nbPartsOfSpeech.sort((a, b) => {
        if (a.nb < b.nb) {
          return 1;
        } else if (a.nb > b.nb) {
          return -1;
        } else {
          return 0;
        }
      });

      // Construction du piechart des natures grammaticales
      this.nbPartsOfSpeech.forEach(element => {
        this.pieChartLabels.push(element.label);
        this.pieChartData.push(element.nb);
        this.pieChartColors[0].backgroundColor.push(element.color);
      });
    });
  }

}
