import { Component, Input, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-new-rule',
  templateUrl: './new-rule.component.html',
  styleUrls: ['./new-rule.component.scss']
})
export class NewRuleComponent implements OnInit {

  @Input() adminConnected: boolean; // Si un administrateur est connecté
  @Input() pwd: string; // Pwd en localSorage pour plus rester connecté

  constructor(private socket: Socket) { }

  ngOnInit(): void {
  }

}
