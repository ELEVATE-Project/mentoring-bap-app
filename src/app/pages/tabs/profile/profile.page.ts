import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';
import * as _ from 'lodash-es';
import { TranslateService } from '@ngx-translate/core';
import { HttpService, LoaderService, LocalStorageService } from 'src/app/core/services';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { Router } from '@angular/router';
import { urlConstants } from 'src/app/core/constants/urlConstants';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  formData: any = {
    form: [
      {
        title: 'SESSIONS_ATTENDED',
        key: 'sessionsAttended',
      },
      {
        title: 'ABOUT',
        key: 'about',
      },
      {
        title: 'DESIGNATION',
        key: 'designation',
      },
      {
        title: 'YEAR_OF_EXPERIENCE',
        key: 'experience',
      },
      {
        title: "KEY_AREAS_OF_EXPERTISE",
        key: "areasOfExpertise"
      },
      {
        title: "EDUCATION_QUALIFICATION",
        key: "educationQualification"
      },
      {
        title: "EMAIL_ID",
        key: "emailId"
      },
    ],
    menteeForm: ['SESSIONS_ATTENDED'],
    data: {},
  };
  public buttonConfig = {
    label: "EDIT_PROFILE",
    action: "edit"

  }
  showProfileDetails: boolean = false;
  username: boolean = true;
  data: any;
  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    label: 'PROFILE'
  };
  sessionData = {}
  user: any;
  visited: boolean;
  segment = "profile"
  isAMentee: boolean;
  enrolledSessions = [];
  constructor(private httpService: HttpService, public navCtrl: NavController, private profileService: ProfileService, private translate: TranslateService, private loaderService: LoaderService, private router: Router, private localStorage: LocalStorageService) { }

  ngOnInit() {
    this.visited = false;
    this.isAMentee = true;
  }

  async ionViewWillEnter() {
    this.getEnrolledSessions()
    this.user = await this.localStorage.getLocalData(localKeys.USER_DETAILS)
    this.fetchProfileDetails();
  }

  async getEnrolledSessions() {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.ENROLLED_SESSIONS
    };
    try {
      let data = await this.httpService.get(config);
      (!_.isEqual(data, {})) ? await this.setEnrolledSessions(data) : null;
      await this.loaderService.stopLoader();
    }
    catch (error) {
      await this.loaderService.stopLoader();
    }
  }
  async setEnrolledSessions(data) {
    this.enrolledSessions = []
    let enrolled = []
    for (const key in data) {
      data[key].forEach(item => {
        console.log(item)
        let sessionData = {
          itemId: item.item.items[0].id,
          fulfillmentId: item.fulfillment.id,
          title: item.item.items[0].descriptor.name,
          description: item.item.items[0].descriptor.long_desc,
          image: item.item.items[0].descriptor.images[0],
          status: item.fulfillment.tags.status,
          startDate: item.fulfillment.start.time.timestamp,
          endDate: item.fulfillment.end.time.timestamp,
          isEnrolled: false,
          mentorName: item.fulfillment.agent.name,
          recommendedFor: item.item.items[0].tags.recommended_for,
          categories: [item.category.descriptor.name],
          medium: item.fulfillment.language,
          providerName: item.item.descriptor.name,
          bppName: item.bpp.name,
          context: {bpp_uri:key}
        }
        enrolled = enrolled.concat(sessionData)
      });
    }
    this.enrolledSessions = enrolled;
  }

  async fetchProfileDetails() {
    var response = await this.profileService.getProfileDetailsFromAPI(this.user.isAMentor, this.user._id);
    this.formData.data = response;
    this.formData.data.emailId = response.email.address;
    if (this.formData?.data?.about) {
      this.formData.data.isAMentee = true;
      this.showProfileDetails = true;
    } else {
      (!this.visited) ? this.router.navigate([CommonRoutes.EDIT_PROFILE]) : null;
      this.visited = true;
    }
  }

  async doRefresh(event) {
    var result = await this.profileService.getProfileDetailsFromAPI(this.user.isAMentor, this.user._id);
    if (result) {
      this.formData.data = result;
      this.formData.data.emailId = result.email.address;
    }
    event.target.complete();
  }

  feedback() {
    this.navCtrl.navigateForward([CommonRoutes.FEEDBACK]);
  }

  public segmentChanged(ev: any) {
    this.segment = ev.target.value;
  }

  async onAction(event){
    console.log(event)
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}`], {state: {data: event.data}});
        break;
    }
  }
}
