import { Injectable } from '@angular/core';
import { DibiWord } from './types';

@Injectable({
  providedIn: 'root'
})
export class RelevanceSortService {

  constructor() { }

  /**
 * compareString(query, string) => retourne un nombre entre 0 et 1 de correspondance avec la chaîne
 * @author Sylicium
 * @date 11/08/2022 - 17h13
 * @version 1.0.0
 * @copyright - Sylicium Corp.
 * @param {*} string1 - La query à comparer à la chaîne
 * @param {*} string2 - La chaîne dont la query sera comparée à
 * @returns float
 */
  compareString(string1: string, string2: string) {
    if (string1 == string2) return 1;
    if (string1 == "" || string2 == "") return 0
    let total_count = 0;
    let ok_count = 0;
    for (let longueur_test = 1; longueur_test < string1.length + 1; longueur_test++) {
      for (let multiplier = 0; multiplier < ((string1.length) / longueur_test) + 1; multiplier++) {
        let index = longueur_test * multiplier
        if (string1.length > index) {
          total_count++
          let the_string = string1.substr(index, longueur_test)
          if (string2.indexOf(the_string) != -1) {
            ok_count += 0.5
          } else if (string2.toLowerCase().indexOf(the_string) != -1) {
            ok_count += 0.45
          } else if (string2.indexOf(the_string.toLowerCase()) != -1) {
            ok_count += 0.45
          } else {
            //console.log(`No '${the_string}' in '${string2}' `)
          }
        }
        if (string2.length > index) {
          let the_string = string2.substr(index, longueur_test)
          if (string1.indexOf(the_string) != -1) {
            ok_count += 0.5
          } else if (string1.toLowerCase().indexOf(the_string) != -1) {
            ok_count += 0.45
          } else if (string1.indexOf(the_string.toLowerCase()) != -1) {
            ok_count += 0.45
          } else {
            //console.log(`No '${the_string}' in '${string1}' `)
          }
        }
      }

    }

    let a = string1.length
    let b = string2.length

    let ponderation;
    if ((b / a) == 1) {
      ponderation = 1
    } else if ((b / a) > 1) {
      ponderation = (a / b)
    } else {
      ponderation = (b / a)
    }
    let score = (ok_count / total_count) * ponderation

    return score
  }

  /**
   * compareString(query, string) => retourne un nombre entre 0 et 1 de correspondance avec la chaîne
   * @author Sylicium
   * @date 11/08/2022 - 17h13
   * @version 1.0.0
   * @copyright - Sylicium Corp.
   * @param {*} list - La liste à trier
   * @param {*} query - La query dont la liste devra être triée par
   * @param {*} depthFunction - Fonction qui renvoie l'élément par lequel comparer la chaîne dans la liste Ex: avec [ {name:"coucou"}, {name:"slt"} ], dedepthFunction = (x) => { return x.name }
   * @returns float
   */
  sortByQuery = (list: DibiWord[], query: string, depthFunction = (x) => { return x }) => {
    if (!Array.isArray(list)) throw new Error("[CompareStrings] > sortByQueryMultipleElements(): The list must be an 'array'")
    if (typeof query != "string") throw new Error("[CompareStrings] > sortByQueryMultipleElements(): The query must be type of 'string'")
    if (typeof depthFunction != "function") throw new Error("[CompareStrings] > sortByQueryMultipleElements(): The depthFunction must be type of 'function'")
    return list.sort((a, b) => {
      return (
        (this.compareString(query, depthFunction(b))) - (this.compareString(query, depthFunction(a)))
      )
    })
  }


  /**
  * compareString(query, string) => compare les ressemblance de la query avec les données en français, en anglais et avec l'auteur, récupère les 3 taux de correspondance (par la fonction compareString) et prend le plus haut des 3 pour les classer par rapport aux autres
  * @author Sylicium
  * @date 11/08/2022 - 17h57
  * @version 1.0.0
  * @copyright - Sylicium Corp.
  * @param {*} list - La liste à trier
  * @param {*} query - La query dont la liste devra être triée par
  * @param {*} depthFunction - Fonction qui renvoie la liste des elements par lesquels comparer la chaîne dans la liste Ex: avec [ {name:"coucou",firstname:"toi"}, {name:"slt",firstname:"hey"} ], dedepthFunction = (x) => { return [x.name, x.firstname] }
  * @returns float
  */
  sortByQueryMultipleElements = (list, query, depthFunction = (x) => { return [x] }) => {
    if (!Array.isArray(list)) throw new Error("[CompareStrings] > sortByQueryMultipleElements(): The list must be an 'array'")
    if (typeof query != "string") throw new Error("[CompareStrings] > sortByQueryMultipleElements(): The query must be type of 'string'")
    if (typeof depthFunction != "function") throw new Error("[CompareStrings] > sortByQueryMultipleElements(): The depthFunction must be type of 'function'")
    return list.sort((a, b) => {
      return (
        this.getBestResultOfList(this.getComparedStringListOf(query, depthFunction(b))) - this.getBestResultOfList(this.getComparedStringListOf(query, depthFunction(a)))
      )
    })
  }


  getComparedStringListOf = (query, list) => {
    if (!Array.isArray(list)) throw new Error("[CompareStrings] > getComparedStringListOf(): The list must be an 'array'")
    if (typeof query != "string") throw new Error("[CompareStrings] > sortByQueryMultipleElements(): The query must be type of 'string'")
    return list.map(x => {
      return this.compareString(query, x)
    })
  }


  getBestResultOfList = (list) => {
    if (!Array.isArray(list)) throw new Error("[CompareStrings] > getComparedStringListOf(): The list must be an 'array'")
    return list.sort((a, b) => {
      return b - a
    })[0]
  }

}
