import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable, Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { RelevanceSortService } from 'src/app/relevance-sort.service';
import { removeAccents } from 'src/app/services';
import { DibiWord } from 'src/app/types';

@Component({
  selector: 'app-dibi-dict',
  templateUrl: './dibi-dict.component.html',
  styleUrls: ['./dibi-dict.component.scss']
})
export class DibiDictComponent implements OnInit {

  // Liste des mots du dico
  @Input() dibiDict: DibiWord[]; // Dictionnaire récupéré du component principal
  filteredDibiDict: DibiWord[] = []; // Seulement ceux filtrés
  filteredAllPages: DibiWord[][] = []; // Ceux filtrés structurés par pages

  nbWordsPerPage: number; // Nombre de mots affichés dans une page (enregistré en localStorage pour préférence utilisateur)
  nbWordsPerPageDefalut = 100; // Nombre de mots affichés dans une page par défaut (car localStorage pour préférence utilisateur)
  currentPage = 0; // Index de la page courante

  @Input() adminConnected: boolean; // Si un administrateur est connecté
  @Input() pwd: string; // Pwd en localSorage pour plus rester connecté

  // Pour le filtrage des mots

  search = ''; // Input de recherche
  searchSimplified = ''; // String en minuscule et sans accents de la recherche
  searchOptions = {
    partsOfSpeech: {
      Noun: true,
      Pronoun: true,
      Verb: true,
      Adjective: true,
      Adverb: true,
      Conjonction: true,
      Interjection: true,
      FunctionParticule: true,
      TransformationParticule: true,
      SpiritWord: true
    },
    element: {
      Dibi: true,
      French: true,
      English: true,
      Author: false,
      Date: false,
      Description: false
    },
    doesNotContiain: {
      author: false,
      description: false,
      english: false,
    }
  };
  private searchObservable = new Subject<string>();
  searchResult$: Observable<DibiWord[]>;
  regexSearch: boolean = false; // Si la recherche s'effectue en regex ou de manière classique

  advancedSearch = false;

  // Pour le tri des mots

  sortBy: SortBy = 'date'; // Possibilité de trier par mot dibi, date, nature grammaticale, 
  sortOrder: SortOrder = 'cresc'; // cresc (ordre alphabétique) et decresc (ordre inverse alphabétique)

  message = { mes: '', color: '' }; // Message et sa couleur affichant le retour du serveur

  translate: Translate = 'French';

  detail = ''; // Permet d'ouvrir l'affichage détaillé des mots

  editing = ''; // Id du mot que l'on édite
  wordToEdit: DibiWord; // Mot que l'on édite
  oldWord: DibiWord; // Ancient mot, avant qu'il soit modifié

  constructor(private socket: Socket, private relevanceSort: RelevanceSortService) {

    // Pipe du traitement de la recherche
    this.searchResult$ = this.searchObservable.pipe(
      debounceTime(200), // Attente de 200 ms après que l'utilisateur ait arrêté de taper sa recherche pour lancer le filtrage
      map(mc => {
        let filtered = [];

        // Si la recherche est en expression régulière, vérification de la validité du regex saisi
        try {
          if (this.regexSearch) {
            new RegExp(this.search);
            this.setColorInputSearch('green'); // Si regex correcte, couleur de fond verte pour l'input de recherche
          } else {
            this.setColorInputSearch('grey'); // Si recherche non regex, couleur classique
          }

          // Itération sur tous les mots pour les filtrer et les placer dans filteredDibiDict (seulement les mots triés)
          this.dibiDict.forEach(word => {

            // Vérification que le mot à filtrer soit inclus dans parmi les options à gauche de la barre de recherche
            if ((this.searchOptions.doesNotContiain.author && word.author) || (this.searchOptions.doesNotContiain.description && word.description) || (this.searchOptions.doesNotContiain.english && word.english)) {

            } else {

              // Vérification que le mot à filtrer respecte l'expression saisie en barre de recherche
              if (this.searchOptions.partsOfSpeech[word.partOfSpeech]) {
                if (this.searchSimplified === '') {
                  filtered.push(word);
                } else {
                  let isThere = false;
                  if (this.searchOptions.element.Dibi) {
                    if (this.isWordMatching(word.dibi)) {
                      isThere = true;
                    }
                  }
                  if (this.searchOptions.element.French) {
                    if (this.isWordMatching(word.french)) {
                      isThere = true;
                    }
                  }
                  if (this.searchOptions.element.English) {
                    if (word.english) {
                      if (this.isWordMatching(word.english)) {
                        isThere = true;
                      }
                    }
                  }
                  if (this.searchOptions.element.Author) {
                    if (word.author) {
                      if (this.isWordMatching(word.author)) {
                        isThere = true;
                      }
                    }
                  }
                  if (this.searchOptions.element.Date) {
                    if (word.date) {
                      if (this.isWordMatching(word.date.toString())) {
                        isThere = true;
                      }
                    }
                  }
                  if (this.searchOptions.element.Description) {
                    if (word.description) {
                      if (this.isWordMatching(word.description)) {
                        isThere = true;
                      }
                    }
                  }
                  if (isThere) {
                    filtered.push(word);
                  }
                }
              }

            }
          });

          // Catch de l'erreur, le regex n'est pas valide
        } catch (e: any) {
          this.setColorInputSearch('red');
        }

        // Si on a saisi une recherche, par défaut, le tri se positionne sur "pertinence" (relevance)
        if (this.search) {
          this.sortBy = 'relevance';
          this.sortOrder = 'cresc';
        } else { // Sinon, on récupère le tri et l'ordre de tri en localStorage
          window.localStorage.getItem('sortBy') ? this.sortBy = window.localStorage.getItem('sortBy') as SortBy : {};
          window.localStorage.getItem('sortOrder') ? this.sortOrder = window.localStorage.getItem('sortOrder') as SortOrder : {};
        }

        // Tri des mots
        this.sortDictionary(filtered, this.sortBy, this.sortOrder);

        // Organisation par pages
        this.buildPages();

        return filtered;
      })
    );

    // Subscribe l'observable
    this.searchResult$.subscribe();

  }

  ngOnInit(): void {

    // Check du localStorage pour voir la préférence de la recherche simple ou avancée
    window.localStorage.getItem('advancedSearch') ? this.advancedSearch = (window.localStorage.getItem('advancedSearch') === 'true' ? true : false) : false;

    // Check du localStorage pour voir les préférences de tri (pas de filtrage)
    window.localStorage.getItem('sortBy') ? this.sortBy = window.localStorage.getItem('sortBy') as SortBy : {};
    window.localStorage.getItem('sortOrder') ? this.sortOrder = window.localStorage.getItem('sortOrder') as SortOrder : {};

    // Check du localStorage pour voir su une préférence en nombre de mots par page existe
    window.localStorage.getItem('nbWordsPerPage') ? this.nbWordsPerPage = parseInt(window.localStorage.getItem('nbWordsPerPage')) : this.nbWordsPerPage = this.nbWordsPerPageDefalut;

    // En réponse à la modification d'un mot
    this.socket.on('responseEditWord', (data) => {
      if (data.status === 0) {
        this.message = { mes: 'Succès', color: 'green' };
      } else {
        this.message = { mes: data.mes, color: 'red' };
      }
      // Clear du message au bout d'un certain délai
      setTimeout(() => { this.message = { mes: '', color: '' }; }, 10000);
    });

    // Mot bien supprimé
    this.socket.on('wordDeleted', () => {
      location.reload();
    });
  }

  /**
   * Si un changement Angular est détecté, et qu'il s'agit de @Input() dibiDict
   * Démarrage du traitement du dictionnaire (mise en minuscule des mots Dibi et lancement de l'observable de recherche)
   */
  ngOnChanges(): void {
    // Met en minuscule tous les mots Dibis (pour que les mots soit mieux lisibles dans le dico)
    if (this.dibiDict) {
      this.dibiDict.forEach(word => {
        word.dibi = word.dibi.toLowerCase();
        this.searchObservable.next();
      });
    }
  }

  /**
   * Vérifie si un élément de la recherche est présent dans certains champs d'un mot
   * Cette méthode sert pour le filtrage des mots par une recherche
   * Il est possible de rechercher un expression classique ou régulière (regex)
   */
  isWordMatching(elem: string): boolean {
    let wordMatch = false;
    if (this.regexSearch) {
      if (elem.match(this.search)) {
        wordMatch = true;
      }
    } else {
      if (removeAccents(elem.toLowerCase()).includes(this.searchSimplified)) {
        wordMatch = true;
      }
    }
    return wordMatch;
  }

  /**
   * Modifie la couleur de fond de l'input de recherche pour indiquer que le regex est juste ou faux
   */
  setColorInputSearch(color: string): void {
    let colorHex = '#555453';
    switch (color) {
      case 'red': colorHex = '#957371'; break;
      case 'green': colorHex = '#759371'; break;
      case 'blue': colorHex = '#757391'; break;
    }
    let doc = document.getElementById('expression-search');
    doc ? doc.style.backgroundColor = colorHex : {};
  }

  /**
   * Sélection ou désélectionne la recherche regex
   */
  toggleRegexSearch(): void {
    this.eachKeySearch() // Lancement d'un next dans l'observable de filtrage
    if (this.regexSearch) {
      if (this.searchOptions.element.Dibi && !this.searchOptions.element.French && !this.searchOptions.element.English) {
        this.searchOptions.element.French = true;
        this.searchOptions.element.English = true;
      }
    } else {
      if (this.searchOptions.element.Dibi && this.searchOptions.element.French && this.searchOptions.element.English) {
        this.searchOptions.element.French = false;
        this.searchOptions.element.English = false;
      }
    }
    this.regexSearch = !this.regexSearch; // Toggle de la recherche regex
  }

  /**
   * Demande au serveur de supprimer un mot
   */
  delete(word: DibiWord): void {
    if (!this.adminConnected) {
      alert('Administrateur non connecté.');
    } else {
      if (window.confirm('Confirmer la suppression')) {
        this.socket.emit('deleteWord', { word, pwd: this.pwd });
      }
    }
  }

  /**
   * Fonction déclenché quand l'utilisateur clique sur une ligne pour déployer les détails du mot
   */
  openDetail(word: DibiWord): void {
    if (this.detail === word._id) {
      this.detail = '';
    } else {
      this.detail = word._id;
    }
  }

  /**
   * Quand l'utilisateur clique sur le bouton d'édition d'un mot, préparation de l'environnement d'édition
   */
  edit(word: DibiWord): void {
    if (this.editing === word._id) {
      this.editing = '';
    } else {
      this.editing = word._id;
      this.oldWord = JSON.parse(JSON.stringify(word));
      this.wordToEdit = word;
    }
  }

  /**
   * Envoie au serveur de la demande de modification du mot édité
   */
  editWord(): void {
    if (!this.adminConnected) {
      alert('Administrateur non connecté.');
    } else {
      this.message = { mes: 'Enregistrement...', color: 'yellow' };
      this.socket.emit('editWord', { wordToEdit: this.wordToEdit, oldWord: this.oldWord, pwd: this.pwd });
    }
  }

  /**
   * À chaque touche cliqué sur l'input de recherche, envoie d'un next dans l'Observable searchObservable
   */
  eachKeySearch(): void {
    // Remove des accents de l'expression recherchée
    this.searchSimplified = removeAccents(this.search.toLowerCase());
    // Suppression des espaces avant et après
    this.searchSimplified = this.searchSimplified.trim();
    // Next sur l'observable de filtrage de tous les mots
    this.searchObservable.next(this.searchSimplified);
  }

  /**
   * Vide la barre de recherche
   */
  emptySearch(): void {
    this.search = ''
    this.searchSimplified = '';
    this.searchObservable.next(this.searchSimplified);
  }

  /**
   * Sélectionne tous ou aucun des cases à cocher pour la nature des mots
   */
  allPartsOfSpeech(b: boolean): void {
    for (let [key, value] of Object.entries(this.searchOptions.partsOfSpeech)) {
      this.searchOptions.partsOfSpeech[key] = b;
    }
  }

  /**
   * Quand l'utilisateur clique sur un label pour trier par (mot dibi, date d'ajout, nature, ordre normal, inverse)
   */
  setSort(sortBy: SortBy): void {
    if (this.sortBy === sortBy) {
      if (this.sortOrder === 'cresc') {
        this.sortOrder = 'decresc';
        window.localStorage.setItem('sortOrder', 'decresc');
      } else {
        this.sortOrder = 'cresc';
        window.localStorage.setItem('sortOrder', 'cresc');
      }
    } else {
      this.sortOrder = 'cresc';
      window.localStorage.setItem('sortOrder', 'cresc');
    }

    if (sortBy === 'relevance') { // On n'enregistre par le tri par pertinence, il n'a pas de sens sans mot recherché
      if (this.search) { // Si on est en recherche, on peut trier par pertinence, mais la préférence n'est pas en localStorage
        this.sortBy = sortBy;
      }
    } else {
      this.sortBy = sortBy;
      window.localStorage.setItem('sortBy', sortBy);
    }

    this.sortDictionary(this.filteredDibiDict, this.sortBy, this.sortOrder);
    this.buildPages();
  }

  /**
  * Tri tous les mots dans le dictionnaire selon un critère et un ordre
  * Puis lance le calcul d'affichage en fonction des options de tri
  */
  sortDictionary(list: DibiWord[], sortBy: SortBy, sortOrder: SortOrder): void {
    if (sortBy === 'date') { // Tri par date (de type Date)
      list.sort((a, b) => {
        if (!a.date && !b.date) {
          return 0;
        } else if (!a.date) {
          if (sortOrder === 'cresc') {
            return 1;
          } else {
            return -1;
          }
        } else if (!b.date) {
          if (sortOrder === 'cresc') {
            return -1;
          } else {
            return 1;
          }
        } else {
          if (a.date > b.date) {
            if (sortOrder === 'cresc') {
              return -1;
            } else {
              return 1;
            }
          } else if (a.date < b.date) {
            if (sortOrder === 'cresc') {
              return 1;
            } else {
              return -1;
            }
          } else {
            return 0;
          }
        }
      });
    } else if (sortBy === 'relevance') { // Tri par pertinence selon l'algo de Sylicium, service relevance-ort.service.ts
      let relevanceOn: string;
      // S'il n'y a qu'un seul critère de recherche, utilisation de la méthode sortByQuery de Sylicium
      if (((+this.searchOptions.element.Dibi) + (+this.searchOptions.element.French) + (+this.searchOptions.element.English)) === 1) {
        if (this.searchOptions.element.French) { // En priorité pertinence en français
          relevanceOn = 'french';
        } else if (this.searchOptions.element.Dibi) { // Ensuite pertinence en dibi (donc français décoché)
          relevanceOn = 'dibi';
        } else if (this.searchOptions.element.English) { // Ensuite pertinence en anglais (donc français et dibi décochés)
          relevanceOn = 'english';
        } else if (this.searchOptions.element.Author) { // Si aucune des trois option est cochée, on force la pertinence en Français
          relevanceOn = 'author';
        }
        if (sortOrder === 'cresc') {
          list = this.relevanceSort.sortByQuery(list, this.search, (x: any) => { return x[relevanceOn] });
        } else {
          list = this.relevanceSort.sortByQuery(list, this.search, (x: any) => { return x[relevanceOn] }).reverse();
        }
      } else { // S'il y a plusieurs critères, utilisation de la méthode sortByQueryMultipleElements de Sylicium
        if (sortOrder === 'cresc') {
          if (this.searchOptions.element.Dibi && this.searchOptions.element.French && this.searchOptions.element.English) {
            list = this.relevanceSort.sortByQueryMultipleElements(list, this.search, (x: any) => { return [x.dibi, x.french, x.english] });
          } else if (this.searchOptions.element.Dibi && this.searchOptions.element.French && !this.searchOptions.element.English) {
            list = this.relevanceSort.sortByQueryMultipleElements(list, this.search, (x: any) => { return [x.dibi, x.french] });
          } else if (this.searchOptions.element.Dibi && !this.searchOptions.element.French && this.searchOptions.element.English) {
            list = this.relevanceSort.sortByQueryMultipleElements(list, this.search, (x: any) => { return [x.dibi, x.english] });
          } else if (!this.searchOptions.element.Dibi && this.searchOptions.element.French && this.searchOptions.element.English) {
            list = this.relevanceSort.sortByQueryMultipleElements(list, this.search, (x: any) => { return [x.french, x.english] });
          }
        } else {
          if (this.searchOptions.element.Dibi && this.searchOptions.element.French && this.searchOptions.element.English) {
            list = this.relevanceSort.sortByQueryMultipleElements(list, this.search, (x: any) => { return [x.dibi, x.french, x.english] });
          } else if (this.searchOptions.element.Dibi && this.searchOptions.element.French && !this.searchOptions.element.English) {
            list = this.relevanceSort.sortByQueryMultipleElements(list, this.search, (x: any) => { return [x.dibi, x.french] }).reverse();
          } else if (this.searchOptions.element.Dibi && !this.searchOptions.element.French && this.searchOptions.element.English) {
            list = this.relevanceSort.sortByQueryMultipleElements(list, this.search, (x: any) => { return [x.dibi, x.english] }).reverse();
          } else if (!this.searchOptions.element.Dibi && this.searchOptions.element.French && this.searchOptions.element.English) {
            list = this.relevanceSort.sortByQueryMultipleElements(list, this.search, (x: any) => { return [x.french, x.english] }).reverse();
          }
        }
      }
    } else { // Tri par élément de type string
      list.sort((a, b) => {
        const aComparable = removeAccents(a[sortBy].toLowerCase());
        const bComparable = removeAccents(b[sortBy].toLowerCase());
        if (aComparable > bComparable) {
          if (sortOrder === 'cresc') {
            return 1;
          } else {
            return -1;
          }
        } else if (aComparable < bComparable) {
          if (sortOrder === 'cresc') {
            return -1;
          } else {
            return 1;
          }
        } else {
          return 0;
        }
      });
    }
    this.filteredDibiDict = list;
    // this.eachKeySearch();
  }

  /**
   * À partir de la liste des mots filtrés et triés, construit 1 à n pages pour limiter le nombre de mots affichés en même temps
   */
  buildPages(): void {
    this.currentPage = 0;
    this.filteredAllPages = []; // Vidage de la liste trié
    let i = 1; // Incrément pour compter le nombre de mots par page
    let page = 0; // Page courante pour ajouter les mots
    this.filteredAllPages[page] = [];
    this.filteredDibiDict.forEach(word => {
      this.filteredAllPages[page].push(word);
      if (i === this.nbWordsPerPage) {
        i = 1;
        page++;
        this.filteredAllPages[page] = [];
      } else {
        i++;
      }
    });
  }

  /**
  * Change de page, 4 boutons, 4 comportements
  */
  changePage(action: string): void {
    if (action === 'fullLeft') {
      this.currentPage = 0;
    } else if (action === 'left') {
      if (this.currentPage > 0) {
        this.currentPage--;
      }
    } else if (action === 'right') {
      if (this.currentPage < this.filteredAllPages.length - 1) {
        this.currentPage++;
      }
    } else if (action === 'fullRight') {
      this.currentPage = this.filteredAllPages.length - 1;
    }
  }

  /**
   * Modifie le nombre de mots affichés par page
   */
  editNbWordsPerPage(): void {
    const nb = parseInt(window.prompt('Nombre de mots affichés par page'));
    if (nb > 0) { // Pas moins d'un mot par page
      this.nbWordsPerPage = nb;
      window.localStorage.setItem('nbWordsPerPage', nb.toString());
      this.buildPages();
    }
  }

  /**
   * Ouvre ou ferme les options avancées de recherche de mots
   */
  toggleAdvancedSearch(b: boolean): void {
    window.localStorage.setItem('advancedSearch', b.toString());
    this.advancedSearch = b;
  }

}

// Types internes à cette classe

type SortBy = 'dibi' | 'french' | 'date' | 'partOfSpeech' | 'relevance'; // Tri selon un élément, relevance = algo de Sylicium
type SortOrder = 'cresc' | 'decresc'; // Ordre de tri
type Translate = 'French' | 'English' | 'Both';