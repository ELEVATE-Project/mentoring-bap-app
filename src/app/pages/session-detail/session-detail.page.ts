import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService, LoaderService, LocalStorageService, ToastService, UserService, UtilService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';
import *  as moment from 'moment';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { Location } from '@angular/common';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import * as _ from 'lodash';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-session-detail',
  templateUrl: './session-detail.page.html',
  styleUrls: ['./session-detail.page.scss'],
})
export class SessionDetailPage implements OnInit {
  id: any;
  showEditButton: any;
  isCreator: boolean = false;
  userDetails: any;
  isEnabled: boolean;
  startDate: any;
  endDate: any;
  sessionDetails: any;
  isEnrolled: any;

  constructor(private localStorage: LocalStorageService, private router: Router, private httpService: HttpService, private sessionService: SessionService,
    private loaderService: LoaderService, private utilService: UtilService, private toast: ToastService,
    private _location: Location, private alertController: AlertController, private user: UserService) {
    this.detailData.data = history.state.data;
    console.log(this.detailData.data)
    this.startDate = new Date(this.detailData.data.startDate).toLocaleString();
  }
  public headerConfig: any = {
    backButton: true,
    label: "",
    share: false
  };
  ngOnInit() {
    this.headerConfig.label = this.detailData.data.title;
   }

  async ionViewWillEnter() {
    await this.sessionStatus(this.detailData.data);
    await this.user.getUserValue();
    this.userDetails = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    // this.fetchSessionDetails();
  }
  async sessionStatus(sessionData) {
    let body = {
      bppUri: sessionData.context.bpp_uri,
      itemId: sessionData.itemId
    }
    let result = await this.sessionService.getEnrollStatus(body);
    this.isEnrolled = result.isEnrolled
  }

  
  detailData = {
    form: [
      {
        title: 'HOSTED_BY',
        key: 'mentorName',
      },
      {
        title: 'RECOMMENDED_FOR',
        key: 'recommendedFor',
      },
      {
        title: "CATEGORIES",
        key: "categories"
      },
      {
        title: 'MEDIUM',
        key: 'medium',
      }
    ],
    data: {
      recommendedFor: [
        {
          "value": "Teachers",
          "label": "Teachers"
        },
        {
          "value": "Block Officers",
          "label": "Block Officers"
        },
      ],
      medium: [
        {
          "value": "English",
          "label": "English"
        },
        {
          "value": "Hindi",
          "label": "Hindi"
        },
      ],
      categories: [
        {
          "value": "Educational Leadership",
          "label": "Educational Leadership"
        },
        {
          "value": "School Process",
          "label": "School Process"
        },
        {
          "value": "Communication",
          "label": "Communication"
        },
        {
          "value": "SQAA",
          "label": "SQAA"
        },
        {
          "value": "Professional Development",
          "label": "Professional Development"
        },
      ],
      mentorName: null,
      status: null,
      isEnrolled: null,
      title: "",
      startDate: ""
    },
  };

  // async fetchSessionDetails() {
  //   var response = await this.sessionService.getSessionDetailsAPI(this.id);
  //   if (response && this.userDetails) {
  //     this.setPageHeader(response);
  //     let readableStartDate = moment.unix(response.startDate).toLocaleString();
  //     let currentTimeInSeconds=Math.floor(Date.now()/1000);
  //     this.isEnabled = (response.startDate-currentTimeInSeconds<300)?true:false;
  //     this.detailData.data = Object.assign({}, response);
  //     this.detailData.data.startDate = readableStartDate;
  //     this.startDate = (response.startDate>0)?moment.unix(response.startDate).toLocaleString():this.startDate;
  //     this.endDate = (response.endDate>0)?moment.unix(response.endDate).toLocaleString():this.endDate;
  //   }
  // }

  setPageHeader(response) {
    this.headerConfig.share = response.status == "completed" ? false : true;
    this.id = response._id;
    this.isCreator = this.userDetails._id == response.userId ? true : false;
    this.headerConfig.edit = (this.isCreator && response.status == "published") ? true : null;
    this.headerConfig.delete = (this.isCreator) ? true : null;
  }

  action(event) {
    switch (event) {
      case 'share':
        this.share();
        break;
      case 'edit':
        this.editSession()
        break;
      case 'delete':
        this.deleteSession()
        break;
    }
  }

  async share() {
    if (this.userDetails) {
      let sharableLink = await this.sessionService.getShareSessionId(this.id);
      if (sharableLink.shareLink) {
        let url = `/${CommonRoutes.SESSIONS}/${CommonRoutes.SESSIONS_DETAILS}/${sharableLink.shareLink}`;
        let link = await this.utilService.getDeepLink(url);
        this.detailData.data.mentorName = this.detailData.data.mentorName.trim();
        this.detailData.data.title = this.detailData.data.title.trim();
        let params = { link: link, subject: this.detailData.data.title, text: "Join an expert session on " + `${this.detailData.data.title} ` + "hosted by " + `${this.detailData.data.mentorName}` + " using the link" }
        this.utilService.shareLink(params);
      } else {
        this.toast.showToast("No link generated!!!", "danger");
      }
    } else {
      this.router.navigate([`${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`], { queryParams: { sessionId: this.id, isMentor: false } });
    }
  }

  editSession() {
    this.router.navigate([CommonRoutes.CREATE_SESSION], { queryParams: { id: this.id } });
  }

  deleteSession() {
    let msg = {
      header: 'DELETE_SESSION',
      message: 'DELETE_CONFIRM_MSG',
      cancel: "Don't delete",
      submit: 'Yes delete'
    }
    this.utilService.alertPopup(msg).then(async data => {
      if (data) {
        let result = await this.sessionService.deleteSession(this.id);
        if (result.responseCode == "OK") {
          this.toast.showToast(result.message, "success");
          this._location.back();
        }
      }
    }).catch(error => { })
  }

  async onJoin() {
    await this.sessionService.joinSession(this.id);
  }

  async checkAvailability(sessionData) {
    await this.loaderService.startLoader("Checking seats...");
    const payload = {
      transaction_id: sessionData.context.transaction_id,
      bppUri: sessionData.context.bpp_uri,
      itemId: sessionData.itemId,
      fulfillmentId: sessionData.fulfillmentId
    }
    const config = {
      url: urlConstants.API_URLS.CHECK_AVAILABILITY,
      payload: payload
    };
    try {
      let data: any = await this.httpService.post(config);
      if (_.has(data, 'data.message.order.id')) {
        await this.showEnrollPopUp(sessionData);
      } else {
        throw Error();
      }
      await this.loaderService.stopLoader();
    }
    catch (error) {
      await this.loaderService.stopLoader();
    }
  }

  async showEnrollPopUp(sessionData) {
    const alert = await this.alertController.create({
      header: 'Seats are available! Would you like to enroll?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Enroll',
          role: 'confirm',
          handler: () => {
            this.onEnroll(sessionData);
          },
        },
      ],

    });

    await alert.present();
  }
  async onEnroll(sessionData) {
    let body = {
      transaction_id: sessionData.context.transaction_id,
      bppUri: sessionData.context.bpp_uri,
      itemId: sessionData.itemId,
      fulfillmentId: sessionData.fulfillmentId
    }
    let result = await this.sessionService.enrollSession(body);
    if (result.data.message.order.fulfillments[0].id) {
      await this.sessionStatus(sessionData);
      this.toast.showToast("Enrolled successfully. Please check your registered email for more info.", "success");
    }
  }

  async onStart(data) {
    let result = await this.sessionService.startSession(data._id);
    result ? this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]) : null;
  }

  async onCancel(sessionData) {
    let msg = {
      header: 'CANCEL_SESSION',
      message: 'CANCEL_CONFIRM_MESSAGE',
      cancel: 'CLOSE',
      submit: 'UN_ENROLL'
    }
    this.utilService.alertPopup(msg).then(async data => {
      if (data) {
        let body = {
          transaction_id: sessionData.context.transaction_id,
          bppUri: sessionData.context.bpp_uri,
          itemId: sessionData.itemId,
          fulfillmentId: sessionData.fulfillmentId
        }
        let result = await this.sessionService.unEnrollSession(body);
        if (result.data.message.order) {
          await this.sessionStatus(sessionData);
          this.toast.showToast("Un-enrolled succesfully.", "success")
        }
      }
    }).catch(error => { })
  }
}
