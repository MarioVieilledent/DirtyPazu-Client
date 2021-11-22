import { Component, Input, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { MinecraftWord } from 'src/app/types';

@Component({
  selector: 'app-dibi-mc',
  templateUrl: './dibi-mc.component.html',
  styleUrls: ['./dibi-mc.component.scss']
})
export class DibiMcComponent implements OnInit {

  @Input() adminConnected: boolean; // Si un administrateur est connecté
  @Input() pwd: string; // Pwd en localSorage pour plus rester connecté

  wordList: MinecraftWord[];
  workingWordList: MinecraftWord[] = [];

  nbWordDisplayed = 1000; // Nombre de mots à afficher par page

  min = 0; // Index du premier mot de la page à afficher
  max = this.nbWordDisplayed - 1; // Index du dernier mot de la page à afficher
  nbTot = 0; // Nombre total de mots
  percentDone = 0.0; // Pourcentage de mots traduits

  constructor(private socket: Socket) { }

  ngOnInit(): void {

    // Demande de la liste des mots minercraft
    this.socket.emit('fetchMinecraft', { });

    this.socket.on('loadMinecraftWordList', data => {
      this.wordList = data.dict;
      this.nbTot = data.dict.length;
      // Construction des mots groupés
      this.createWorkingWordList();
      // Construction du pourcentage de mots traduits
      let done = 0;
      this.wordList.forEach(word => {
        word.done ? done++ : { };
      });
      this.percentDone = done * 100 / this.nbTot;
    });

    this.socket.on('loadMinecraftWordListForDl', data => {
      let json = {};
      data.dict.forEach(word => {
        json[word.english] = word.dibi;
      });
      console.log(JSON.stringify(json, null, 3));
      window.open('', 'Title', 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=800,height=500,top=0,left=0').document.body.innerHTML = JSON.stringify(json, null, 3);
    })

  }

  move(direction: string): void {
    if (direction === 'left' && this.min > 0) {
      this.min -= this.nbWordDisplayed;
      this.max -= this.nbWordDisplayed;
      this.createWorkingWordList();
    } else if (direction === 'right' && this.max <= this.nbTot) {
      this.min += this.nbWordDisplayed;
      // if ((this.max += this.nbWordDisplayed) >= this.nbWordDisplayed) {
        this.max += this.nbWordDisplayed;
      // }
      this.createWorkingWordList();
    }
  }

  moveFull(direction: string): void {
    if (direction === 'left' && this.min > 0) {
      while (this.min > 0) {
        this.min -= this.nbWordDisplayed;
        this.max -= this.nbWordDisplayed;
      }
      this.createWorkingWordList();
    } else if (direction === 'right' && this.max <= this.nbTot) {
      while (this.max <= this.nbTot) {
        this.min += this.nbWordDisplayed;
        this.max += this.nbWordDisplayed;
      }
      this.createWorkingWordList();
    }
  }

  /**
   * Construit la liste avec les nbWordDisplayed mots de la page comprise entre min et max
   */
  createWorkingWordList(): void {
    this.workingWordList = [];
    for(let i = this.min; i < this.max; i++) {
      if (i < this.nbTot) {
        this.workingWordList.push(this.wordList[i]);
      }
    }
  }

  /**
   * Modifie le mot
   */
   editWord(word: MinecraftWord, event: any): void {
     let translation = event.target.value;
     if (word.dibi !== translation) {
        word.done = true;
        this.socket.emit('editMcWord', {pwd: this.pwd, _id: word._id, english: word.english, newWord: translation, done: word.done});
     }
   }

   /**
    * Modifie le done du mot
    */
    toggleDone(word: MinecraftWord, done: boolean): void {
      word.done = done;
      this.socket.emit('editDoneMcWord', {pwd: this.pwd, _id: word._id, done});
    }

    /**
     * Télécharge les données en json
     */
     download() {
       this.socket.emit('fetchMinecraftForDl', { });
     }

}
