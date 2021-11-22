import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { PageName } from '../types';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  messageServeur: string;
  navigation: PageName = 'Dibi-infos'; // Navigation entre les pages

  dibiDict: any[]; // Dictionnaire Dibi

  pixelSize: number = 2;
  displayRegions = false;

  menuDisplayed = true;
  @ViewChild('nav') nav: ElementRef;
  @ViewChild('content') content: ElementRef;

  adminConnected: boolean; // Si un administrateur est connecté
  // token: number; // Token reçu du serveur
  pwd: string; // Mot de passe en base 64 permettant le fonctionnement des requêtes serveur

  constructor(private socket: Socket) {
  }

  ngOnInit(): void {

    // Si une fenêtre de navigation est en localStorage, on l'affiche au démarrage
    if (window.localStorage.getItem('nav')) {
      this.navigation = window.localStorage.getItem('nav') as PageName;
    }

    // Si un pwd admin est en localStorage, on tente de se connecter
    if (window.localStorage.getItem('pwd')) {
      this.socket.emit('login', { pwd: window.localStorage.getItem('pwd') });
    }

    // Le serveur valide que ce client est admin
    this.socket.on('trust', data => {
      this.adminConnected = true;
      window.localStorage.setItem('pwd', data.pwd);
    });

    // Une requête envoyé au serveur à un token érroné, on affiche un alert pour l'indiquer
    this.socket.on('wrongPwd', () => {
      this.adminConnected = false;
      window.localStorage.removeItem('pwd');
      window.alert('Le mot de passe est faux.');
      location.reload();
    });
  }

  ngAfterViewInit() {
    // PROBLEME DU SETTIMEOUT ici, j'ai rien trouvé de mieux :/
    // Si la préférence utilisateur pour l'affichage de la nav à gauche est spécifiée, on adapte la fenêtre en conséquence
    if (window.localStorage.getItem('menuToggle')) {
      setTimeout(() => {
        this.setMenuDisplay(window.localStorage.getItem('menuToggle') === 'true' ? true : false);
      }, 50);
    }
  }

  /**
   * Quand on clique sur le chevron en haut à gauche, l'affichage du menu se toggle
   */
  toggleMenu(): void {
    if (this.menuDisplayed) {
      this.setMenuDisplay(false);
    } else {
      this.setMenuDisplay(true);
    }
  }

  /**
   * Affiche et enlève le menu à gauche (pour affichage petit / téléphone)
   * Fonctionne avec un localStorage pour enregistrer la pref utilisateur
   */
  setMenuDisplay(navDisplay: boolean): void {
    if (navDisplay) {
      this.menuDisplayed = true;
      this.nav.nativeElement.style.width = '200px';
      this.content.nativeElement.style.width = 'calc(100% - 200px)';
      window.localStorage.setItem('menuToggle', 'true');
    } else {
      this.menuDisplayed = false;
      this.nav.nativeElement.style.width = '0%';
      this.content.nativeElement.style.width = '100%';
      window.localStorage.setItem('menuToggle', 'false');
    }
  }

  setNav(page: PageName): void {
    this.navigation = page;
    window.localStorage.setItem('nav', page);
  }

  setSize(size: number): void {
    this.pixelSize = size;
  }

  reload() {
    const url = window.location.href;
    window.open(url, '_self');
  }

  openNewBlank() {
    const url = window.location.href;
    window.open(url, '_blank');
  }

  login() {
    this.socket.emit('login', {pwd: btoa(prompt('Entrer le mot de passe'))});
  }

  logout() {
    this.adminConnected = false;
    window.localStorage.removeItem('pwd');
    this.socket.emit('logout', {});
  }

}
