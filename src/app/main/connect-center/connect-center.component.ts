import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { User, UserColor } from 'src/app/types';

@Component({
  selector: 'app-connect-center',
  templateUrl: './connect-center.component.html',
  styleUrls: ['./connect-center.component.scss']
})
export class ConnectCenterComponent implements OnInit {

  // Emitters vers le component main
  @Output() adminConnectionEmitter = new EventEmitter<boolean>();
  @Output() closeBoxEmitter = new EventEmitter<boolean>();

  @Input() adminConnected = false; // Si un administrateur est connecté
  @Input() pwd: string; // Pwd en localSorage pour plus rester connecté
  password: string; // Mot de passe administrateur entré par l'utilisateur
  errorMessage: string; // Message en cas de mot de passe faux

  // Création d'un nouvel utilisateur
  users: User[]; // Liste de tous les utilisateurs
  creatingNewUser = false; // True = création d'un nouvel utilisateur
  newUser: User; // Nouvel utilisateur en création
  colors = [
    { name: 'white', hex: '#ddd' },
    { name: 'yellow', hex: '#dd9' },
    { name: 'green', hex: '#9d9' },
    { name: 'cyan', hex: '#9dd' },
    { name: 'blue', hex: '#99d' },
    { name: 'magenta', hex: '#d9d' },
    { name: 'red', hex: '#d99' }
  ];

  constructor(private socket: Socket) {
    window.onclick = (event: any) => {
      if (event.target === document.getElementById('zone-click-exit')) {
        this.closeBoxEmitter.emit(false);
      }
    };
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

    // Chargement de la liste des utilisateurs
    this.socket.on('usersLoaded', (users: User[]) => {
      this.users = users;
      this.creatingNewUser = false;
    });

    // Succès de création de l'utilisateur
    this.socket.on('addUserSuccess', (data: any) => {
      this.socket.emit('loadUsers', {});
    });

    // Erreur de création de l'utilisateur
    this.socket.on('addUserError', (data: any) => {
      window.alert(data.mes);
    });

    // Demande de tous les utilisateurs
    this.socket.emit('loadUsers', {});

  }

  /**
   * Vérifie que le mot de passe administrateur soit correct
   */
  connectAdmin(): void {
    this.socket.emit('login', { pwd: btoa(this.password) });
  }

  /**
   * Déconnecte la session
   */
  logout() {
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
   * Ouvre la div pour créer un nouvel utilisateur
   */
  initNewUser(): void {
    this.creatingNewUser = true;
    this.newUser ? {} : this.newUser = { pseudo: '', discordTagName: '', color: JSON.parse(JSON.stringify(this.colors[0])) };
  }

  /**
   * Sélectionne une couleur pour le nouvel utilisateur
   */
   setColorNewUser(color: UserColor) {
    this.newUser.color = color;
   }

  /**
   * Ajoute un nouvel utilisateur à la bdd
   */
  addNewUser(): void {
    if (this.newUser.pseudo && this.newUser.discordTagName && this.newUser.color) {
      this.socket.emit('newUser', {pwd: this.password, user: this.newUser });
    } else {
      window.alert('Impossible de créer l\'utilisateur.');
    }
  }

}
