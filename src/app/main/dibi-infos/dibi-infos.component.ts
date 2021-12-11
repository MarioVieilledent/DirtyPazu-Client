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

  // Stats de répartition des natures gr.
  nbPartsOfSpeech: any = [
    { label: 'Noms', savedAs: 'Noun', nb: 0, color: '#8AE' },
    { label: 'Pronoms', savedAs: 'Pronoun', nb: 0, color: '#8EE' },
    { label: 'Verbes', savedAs: 'Verb', nb: 0, color: '#E88' },
    { label: 'Adjectifs', savedAs: 'Adjective', nb: 0, color: '#8E8' },
    { label: 'Adverbes', savedAs: 'Adverb', nb: 0, color: '#EA8' },
    { label: 'Conjonctions', savedAs: 'Conjonction', nb: 0, color: '#E8E' },
    { label: 'Particules', savedAs: 'Particule', nb: 0, color: '#EE8' },
    { label: 'Interjections', savedAs: 'Interjection', nb: 0, color: '#A8E' }
  ]

  // Options Charts
  options: ChartOptions = { aspectRatio: 1 }

  // Pie Chart pour la répartition des natures gr.
  pieChartLabels = [];
  pieChartData = [];
  pieChartColors: any = [{
    backgroundColor: []
  }];

  // Bar Chart pour le nb de mots selon leur nature grammaticale en fonction du temps
  numbersOfWords = {
    Total: 0,
    Noms: 0,
    Pronoms: 0,
    Verbes: 0,
    Adjectifs: 0,
    Adverbes: 0,
    Conjonctions: 0,
    Particules: 0,
    Interjections: 0
  };
  barChartDataNG = [
    { data: [], label: 'Noms', borderColor: '#8AE', backgroundColor: 'rgba(0, 0, 0, 0)', pointBackgroundColor: '#8AE' },
    { data: [], label: 'Pronoms', borderColor: '#8EE', backgroundColor: 'rgba(0, 0, 0, 0)', pointBackgroundColor: '#8EE' },
    { data: [], label: 'Verbes', borderColor: '#E88', backgroundColor: 'rgba(0, 0, 0, 0)', pointBackgroundColor: '#E88' },
    { data: [], label: 'Adjectifs', borderColor: '#8E8', backgroundColor: 'rgba(0, 0, 0, 0)', pointBackgroundColor: '#8E8' },
    { data: [], label: 'Adverbes', borderColor: '#EA8', backgroundColor: 'rgba(0, 0, 0, 0)', pointBackgroundColor: '#EA8' },
    { data: [], label: 'Conjonctions', borderColor: '#E8E', backgroundColor: 'rgba(0, 0, 0, 0)', pointBackgroundColor: '#E8E' },
    { data: [], label: 'Particules', borderColor: '#EE8', backgroundColor: 'rgba(0, 0, 0, 0)', pointBackgroundColor: '#EE8' },
    { data: [], label: 'Interjections', borderColor: '#A8E', backgroundColor: 'rgba(0, 0, 0, 0)', pointBackgroundColor: '#A8E' }
  ];
  barChartLabelsNG = [];
  barChartOptionsNG = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  barChartLegendNG = true;

  // Bar Chart pour le nb de mots selon leur nature grammaticale en fonction du temps
  barChartData = [
    { data: [], label: 'Total mots', borderColor: '#d6d5d4', backgroundColor: 'rgba(240, 240, 240, 0.1)', pointBackgroundColor: '#cccbca' }
  ];
  barChartLabels = [];
  barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  barChartLegend = true;

  constructor(private socket: Socket) { }

  ngOnInit(): void {

    // Demande du dictionnaire
    this.socket.emit('fetchDict', {});

    // Récupération du dictionnaire
    this.socket.on('loadDict', (data) => {

      this.dibiDict = data.dict;

      // Récupérations des stats de la répartition des natures gr. et nb mots langue
      this.dibiDict.forEach(word => {
        switch (word.partOfSpeech) {
          case ('Noun'):
            this.nbPartsOfSpeech.find(i => i.savedAs === 'Noun').nb++;
            break;
          case ('Pronoun'):
            this.nbPartsOfSpeech.find(i => i.savedAs === 'Pronoun').nb++;
            break;
          case ('Verb'):
            this.nbPartsOfSpeech.find(i => i.savedAs === 'Verb').nb++;
            break;
          case ('Adjective'):
            this.nbPartsOfSpeech.find(i => i.savedAs === 'Adjective').nb++;
            break;
          case ('Adverb'):
            this.nbPartsOfSpeech.find(i => i.savedAs === 'Adverb').nb++;
            break;
          case ('Conjonction'):
            this.nbPartsOfSpeech.find(i => i.savedAs === 'Conjonction').nb++;
            break;
          case ('Particule'):
            this.nbPartsOfSpeech.find(i => i.savedAs === 'Particule').nb++;
            break;
          case ('Interjection'):
            this.nbPartsOfSpeech.find(i => i.savedAs === 'Interjection').nb++;
            break;
        }
      });

      // Tri par nombre (stats de répartiotion des natures gr.)
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

      // Construction du line chart du nb mots chaque jour
      let day = this.datify(new Date(this.dibiDict[0].date));
      this.barChartLabelsNG.push(day);
      this.barChartLabels.push(day);
      this.dibiDict.forEach(word => {
        this.numbersOfWords.Total++; // Incrément des mots totaux
        if (day === this.datify(new Date(word.date))) {
          this.numbersOfWords[this.frenchify(word.partOfSpeech)]++; // Incrément du nombre de mots selon le nature gr.
        } else {
          // Ajout des nouveaux mots selon la date
          this.barChartDataNG.forEach(elem => {
            elem.data.push(this.numbersOfWords[elem.label]);
          });
          this.barChartData[0].data.push(this.numbersOfWords.Total);
          // Mise à jour de la date suivante
          day = this.datify(new Date(word.date));
          this.barChartLabelsNG.push(day);
          this.barChartLabels.push(day);
          // Ajout du prochain mot (qui est passé en else car nouvelle date, mais qu'il faut compter)
          this.numbersOfWords[this.frenchify(word.partOfSpeech)]++; // Incrément du nombre de mots selon le nature gr.
        }
      });
      // Ajout des nouveaux mots selon la date
      this.barChartDataNG.forEach(elem => {
        elem.data.push(this.numbersOfWords[elem.label]);
      });
      this.barChartData[0].data.push(this.numbersOfWords.Total);

      // Tri par taille (stats de répartiotion des natures gr.)
      this.barChartDataNG.sort((a, b) => {
        if (a.data[a.data.length - 1] < b.data[b.data.length - 1]) {
          return 1;
        } else if (a.data[a.data.length - 1] > b.data[b.data.length - 1]) {
          return -1;
        } else {
          return 0;
        }
      });

    });
  }

  /**
   * Adapte une Date en format dd/mm/yyy
   */
  datify(date: Date): string {
    let dd: any = date.getDate();
    let mm: any = date.getMonth() + 1;
    let yyyy: any = date.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    return dd + '/' + mm + '/' + yyyy;
  }

  /**
   * Donne la nature grammaticale fr à partir de l'anglaise
   */
  frenchify(partOfSpeech: string): string {
    switch (partOfSpeech) {
      case ('Noun'): return 'Noms'; break;
      case ('Pronoun'): return 'Pronoms'; break;
      case ('Verb'): return 'Verbes'; break;
      case ('Adjective'): return 'Adjectifs'; break;
      case ('Adverb'): return 'Adverbes'; break;
      case ('Conjonction'): return 'Conjonctions'; break;
      case ('Particule'): return 'Particules'; break;
      case ('Interjection'): return 'Interjections'; break;
    }
  }

}
