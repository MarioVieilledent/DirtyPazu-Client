import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { SocialAuthService, SocialUser } from "angularx-social-login";
import { FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";
import { AccountSettings } from 'src/app/types';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-connect-center',
  templateUrl: './connect-center.component.html',
  styleUrls: ['./connect-center.component.scss']
})
export class ConnectCenterComponent implements OnInit {

  // Emitters vers le component main
  @Output() adminConnectionEmitter = new EventEmitter<boolean>(); // Approuve la connexion admin
  @Output() closeBoxEmitter = new EventEmitter<boolean>(); // Ferme la fenêtre popup
  @Output() userEmitter = new EventEmitter<SocialUser>(); // Approuve la connexion avec compte Google

  @Input() adminConnected = false; // Si un administrateur est connecté
  @Input() pwd: string; // Pwd en localSorage pour plus rester connecté
  password: string; // Mot de passe administrateur entré par l'utilisateur
  errorMessage: string; // Message en cas de mot de passe faux

  // Utilisateur Google et informations profil
  @Input() user: SocialUser;
  @Input() accountSettings: AccountSettings;

  constructor(private http: HttpClient, private socket: Socket, private authService: SocialAuthService) {
    // Si click à l'extérieur de la fenêtre, fermeture de la fenêtre
    window.onclick = (event: MouseEvent) => {
      if (event.target === document.getElementById('zone-click-exit')) {
        this.closeBoxEmitter.emit(false);
      }
    };
    // Si touche esc, fermeture de la fenêtre
    window.addEventListener('keyup', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.closeBoxEmitter.emit(false);
      }
    });
  }

  ngOnInit(): void {

    // Si mot de passe incorrect, un message rouge s'affiche
    this.socket.on('wrongPwd', () => {
      this.setAdminConnected(false);
      window.localStorage.removeItem('pwd');
      this.errorMessage = 'Mot de passe incorrect.';
      setTimeout(() => {
        this.errorMessage = undefined;
      }, 5000);
    });

  }

  ngAfterViewInit(): void {
    // Si aucune information du profil n'est chargé, elle sont initialisées à vide
    setTimeout(() => {
      if (!this.accountSettings) {
        if (this.user) {
          this.accountSettings = { email: this.user.email, user: this.user, discordPseudo: '', discordTag: '' };
        }
      }
    }, 250);
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  // signInWithFB(): void {
  //   this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  // }

  signOut(): void {
    this.authService.signOut();
    this.accountSettings = { email: '', user: undefined, discordPseudo: '', discordTag: '' };
  }

  /**
   * Vérifie que le mot de passe administrateur soit correct
   */
  connectAdmin(): void {
    this.socket.emit('login', { pwd: btoa(this.password) });
  }

  /**
   * Déconnecte la session admin
   */
  logoutAdmin() {
    this.setAdminConnected(false);
    window.localStorage.removeItem('pwd');
    this.socket.emit('logout', {});
  }

  /**
   * Set la variable adminConnected (pour ce component, et pour le component parent (main))
   */
  setAdminConnected(value: boolean): void {
    this.adminConnected = value;
    this.adminConnectionEmitter.emit(value); // Envoie de la donnée au component main
  }

  /**
   * Enregistre en bdd les options du compte
   */
  saveAccountSettings(): void {
    if (this.accountSettings.discordPseudo && this.accountSettings.discordTag) {
      if (this.user) {
        try {
          this.accountSettings.user.response = undefined;
        } catch (error: any) {
          location.reload();
        }
        this.accountSettings.email = this.accountSettings.user.email;
        this.socket.emit('setProfile', this.accountSettings);
      } else {
        window.alert('Compte Google non connecté');
      }
    } else {
    }
  }

}
