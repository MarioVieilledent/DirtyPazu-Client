import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Log } from 'src/app/types';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {

  logs: Log[];

  constructor(private socket: Socket) { }

  ngOnInit(): void {
    
    // Demande des logs
    this.socket.emit('fetchLogs', { });

    this.socket.on('responseLogs', data => {
      this.logs = data.logs.reverse();
    });

  }

}
