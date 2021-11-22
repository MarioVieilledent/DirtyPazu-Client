import { Component, Input, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { GrammarRule } from 'src/app/types';

@Component({
  selector: 'app-dibi-grammar-rules',
  templateUrl: './dibi-grammar-rules.component.html',
  styleUrls: ['./dibi-grammar-rules.component.scss']
})
export class DibiGrammarRulesComponent implements OnInit {

  @Input() adminConnected: boolean; // Si un administrateur est connecté
  @Input() pwd: string; // Pwd en localSorage pour plus rester connecté

  message = {mes: '', color: ''}; // Message et sa couleur affichant le retour du serveur

  allGrammarRules: GrammarRule[] = [];

  newRule: GrammarRule;

  selectedRule: GrammarRule; // règle sélectionné dans la nav pour être éffichée
  editing: GrammarRule; // Règle que l'on édite

  constructor(private socket: Socket) { }

  ngOnInit(): void {

    // Demande du dictionnaire
    this.socket.emit('fetchGrammarRules', { });

    // Récupération du dictionnaire
    this.socket.on('loadRules', (data) => {
      this.allGrammarRules = data.rules;
    });

    // En réponse à la modification d'un mot
    this.socket.on('responseEditWord', (data) => {
      if (data.status === 0) {
        this.message = {mes: 'Succès', color: 'green'};
      } else {
        this.message = {mes: data.mes, color: 'red'};
      }
      // Clear du message au bout d'un certain délai
      setTimeout(() => { this.message = {mes: '', color: ''}; }, 10000);
    });

    // Par défaut, ouvre la première règle
    this.selectedRule = this.allGrammarRules[0];
  }

  /**
   * Quand l'utilisateur clique sur une règle dans la barre de navigation, elle s'affiche en détails
   */
  openRule(rule: GrammarRule):void {
    if (this.editing) {
     if (window.confirm('Une modification de règle est en cours.')) {
       this.editing = undefined;
      this.selectedRule = rule;
     }
    } else {
      this.selectedRule = rule;
    }
  }

  /**
   * Quand l'utilisateur clique sur une "nouvelle règle" dans la barre de navigation, édition d'une nouvelle règle
   */
  openNewRule(): void {
    this.editing = undefined;
    this.selectedRule = undefined
    this.newRule = {title: '', sections: []}
  }

  /**
   * Création d'une nouvelle règle
   */
  addRule(): void {

  }

  /**
   * Envoie de la reqûete de modification de règle
   */
  editRule(): void {
    if (!this.adminConnected) {
      alert('Administrateur non connecté.');
    } else {
      this.message = {mes: 'Enregistrement...', color: 'yellow'};
      this.socket.emit('editRule', { rule: this.editing, pwd: this.pwd });
    }
  }

  /**
   * Modification de règle
   */
  edit(rule: GrammarRule): void {
    if (this.editing === rule) {
      this.editing = undefined;
    } else {
      this.editing = JSON.parse(JSON.stringify(rule));
    }
  }

  /**
   * Suppression d'un règle
   */
  delete(rule: GrammarRule): void {

  }

}
