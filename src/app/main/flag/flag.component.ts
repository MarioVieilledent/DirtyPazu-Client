import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Pixel, Region } from 'src/app/types';
import { concat, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Component({
  selector: 'app-flag',
  templateUrl: './flag.component.html',
  styleUrls: ['./flag.component.scss']
})
export class FlagComponent implements OnInit {

  url = 'https://api-flag.fouloscopie.com/flag';
  jsonFlag = './assets/flag.json';
  jsonRegions = './assets/regions.json';

  stateFechFlag: number = 0; // Etat de la requête flag à Fouloscopie
  flag: Pixel[]; // Drapeau récupéré de Fouloscopie
  regions: Region[]; // Régions

  nb: number; // Nombre exact de pixels
  i: number; // Nombre de lignes (calculé en fonction de nb)
  j: number; // Nombre de colonnes (calculé en fonction de i)

  @Input() pixelSize: number; // Taille d'un pixel, récupéré du component main, sélectionnable par l'utilisateur
  @Input() displayRegions: boolean; // Affichage des départements

  constructor(private http: HttpClient) { }

  ngOnInit(): void {

    concat(
      this.fetchRegions(),
      this.fetchFlag()
      ).subscribe(
        data => { },
        err => { console.error(err.message); },
        () => { 
          this.buildFlag();
        }
      )
  }

  ngOnChanges(change: SimpleChanges) {
    this.display();
  }

  fetchRegions(): Observable<any> {
    return this.http.get<Region[]>(this.jsonRegions).pipe(tap(
      data => {
        this.regions = data;
      }
    ));
  }

  fetchFlag(): Observable<any> {
    this.stateFechFlag = 1;
    const httpOptions = {
      headers: new HttpHeaders({ 
        'Access-Control-Allow-Origin': '*',
        'Authorization': 'authkey',
        'userid': '1'
      })
    };
    return this.http.get<Pixel[]>(this.url, httpOptions).pipe(tap(
      data => {
        this.stateFechFlag = 2;
        this.flag = data;
      }
    ));
  }

  buildFlag(): void {
    this.nb = this.flag.length; // Nombre exact de pixels
    this.i = Math.ceil(Math.sqrt(this.nb / 2)); // Nombre de lignes (calculé en fonction de nb)
    this.j = this.i * 2; // Nombre de colonnes (calculé en fonction de i)

    let n = 0; // L'index du pixel qu'on traite actuellement
    let iter = 1; // L'itération qui se termine par le mouvement vers la droite

    while(n <= this.nb) {
      for (let x = 1; x <= iter; x++) {
        if (n < this.nb) {
          this.flag[n].coord = { i: x, j: (iter * 2 - 1)};
        }
        n++;
      }
      for (let x = 1; x <= iter; x++) {
        if (n < this.nb) {
          this.flag[n].coord = { i: x, j: (iter * 2)};
        }
        n++;
      }
      for (let x = 1; x <= iter * 2; x++) {
        if (n < this.nb) {
          this.flag[n].coord = { i: (iter + 1), j: x};
        }
        n++;
      }
      iter++;
    }

    this.display();
  }

  display(): void {
    let canvas: any = document.getElementById('flag-canvas');
    canvas.style.width = (this.j * this.pixelSize) + 'px';
    canvas.style.height = (this.i * this.pixelSize) + 'px';
    let ctx = canvas.getContext('2d');
    ctx.canvas.width = (this.j * this.pixelSize);
    ctx.canvas.height = (this.i * this.pixelSize);
    ctx.beginPath();

    // Affichage des pixels
    for (let x = 0; x < this.nb; x++) {
      const p = this.flag[x];
      ctx.fillStyle = p.hexColor;
      ctx.fillRect(((p.coord.j - 1) * this.pixelSize), ((p.coord.i - 1) * this.pixelSize), this.pixelSize, this.pixelSize);
    }

    // Affichage des régions
    if (this.displayRegions) {
      this.regions.forEach(region => {
        ctx.fillStyle = 'rgba(' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ', ' + Math.floor(Math.random() * 256) + ', 0.4)';
        ctx.fillRect(((region.lowerJ - 1) * this.pixelSize), ((region.lowerI - 1) * this.pixelSize), (((region.upperJ - region.lowerJ) + 1) * this.pixelSize), (((region.upperI - region.lowerI) + 1) * this.pixelSize));
        ctx.fillStyle = '#000000';
        ctx.strokeRect(((region.lowerJ - 1) * this.pixelSize), ((region.lowerI - 1) * this.pixelSize), (((region.upperJ - region.lowerJ) + 1) * this.pixelSize), (((region.upperI - region.lowerI) + 1) * this.pixelSize));
      });
      ctx.closePath();
    }
  }

}
