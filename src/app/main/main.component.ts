import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { GoogleLoginProvider } from "angularx-social-login";
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
  pwd: string; // Mot de passe en base 64 permettant le fonctionnement des requêtes serveur

  user: SocialUser; // Utilisateur Google

  userMenu = false; // À true, ouvre la page de connexion et manage de comptes

  constructor(private socket: Socket, private authService: SocialAuthService) {
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
      this.setAdminConnected(true);
      window.localStorage.setItem('pwd', data.pwd);
    });

    // Prépare la réception de la connexion
    this.authService.authState.subscribe((user) => {
      this.user = user;
      console.log(user);
    });

    // Tente de se connecter avec le compte Google
    setTimeout(() => {
      try {
        this.authService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
      } catch (e) {
        console.error(e.message);
      }
    }, 1000);

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

  /**
   * Change de page
   */
  setNav(page: PageName): void {
    this.navigation = page;
    window.localStorage.setItem('nav', page);
  }

  /**
   * Pour le flag
   */
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

  /**
   * Ouvre la fenêtre de connexion
   */
  openUserMenu() {
    this.userMenu = true;
  }

  /**
   * Setter de la connexion admin (fonction déclenchée par un eventEmitter du component main/conncet-center)
   */
  setAdminConnected(event: boolean) {
    this.adminConnected = event;
  }

  /**
   * Setter de l'affichage de la page admin (fonction déclenchée par un eventEmitter du component main/conncet-center)
   */
  setUserMenu(event: boolean) {
    this.userMenu = event;
  }

  /**
   * Set l'utilisateur qui s'est connecté via Google
   */
  setUser(event: SocialUser): void {
    this.user = event;
  }

}
