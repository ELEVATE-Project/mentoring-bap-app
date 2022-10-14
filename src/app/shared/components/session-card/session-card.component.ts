import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService, ToastService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-session-card',
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],
})
export class SessionCardComponent implements OnInit {
  @Input() data: any;
  @Output() onClickEvent = new EventEmitter();
  startDate: string;
  isCreator: boolean;
  buttonConfig;
  userData: any;
  endDate: string;
  
  constructor(private router: Router, private sessionService: SessionService, private toast: ToastService, private localStorage: LocalStorageService) { }
  
  async ngOnInit() {
    if(this.data.startDate){
      this.startDate = new Date(this.data.startDate).toLocaleString();
      console.log(this.startDate)
    }
  }
 
  onCardClick(data) {
    let value = {
      data: data,
      type: 'cardSelect',
    }
    this.onClickEvent.emit(value)
  }
}
