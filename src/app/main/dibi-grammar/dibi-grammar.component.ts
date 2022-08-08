import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-dibi-grammar',
  templateUrl: './dibi-grammar.component.html',
  styleUrls: ['./dibi-grammar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DibiGrammarComponent implements OnInit {

  @ViewChild('body') body: ElementRef;
  @Input() adminConnected: boolean; // Si un administrateur est connecté

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    fetch('assets/HTML/grammar.html')
      .then(r => r.text())
      .then(data => {
        this.body.nativeElement.innerHTML = data;
      });
  }

}
