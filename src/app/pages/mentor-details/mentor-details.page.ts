import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, LocalStorageService, ToastService, UserService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-mentor-details',
  templateUrl: './mentor-details.page.html',
  styleUrls: ['./mentor-details.page.scss'],
})
export class MentorDetailsPage implements OnInit {
  mentorId;
  public headerConfig: any = {
    backButton: true,
    headerColor: "primary",
    label: ""
  };

  public buttonConfig = {
    label: "SHARE_PROFILE",
    action: "share"

  }

  detailData = {
    form: [
      {
        title: 'SUBJECTS',
        key: 'subjects',
      },
      {
        title: "BOARDS",
        key: "boards"
      },
      {
        title: 'GRADES',
        key: 'grades',
      },
      {
        title: 'KEY_AREAS_OF_EXPERTISE',
        key: 'areasOfExpertise',
      },
      {
        title: "EDUCATION_QUALIFICATION",
        key: "educationQualification"
      }
    ],
    data: {
      rating: {
        average:0
      },
      sessionsHosted:10 ,
      name: "",
      isAMentee: false,
      upcomingSessionFulfillment:{},
      upcomingSessionItem:{},
      context:{}
    },
  };
  segmentValue = "about";
  upcomingSessions=[];
  constructor(
    private httpService: HttpService,
    private router: Router,
    private sessionService: SessionService,
    private userService: UserService,
    private localStorage:LocalStorageService,
    private toastService:ToastService
  ) {
    this.userService.getUserValue().then(async (result) => {
      if (result) {
        this.detailData.data = history.state.data;
        this.detailData.data.sessionsHosted = Math.floor(Math.random() * 21)
        this.detailData.data.isAMentee = false;
        this.headerConfig.label = this.detailData.data.name;
        //this.getMentor();
      } else {
        this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`], { queryParams: { mentorId: this.mentorId } })
      }
    })
  }

  ngOnInit() {
    this.getUpcomingSession();
  }
  getUpcomingSession() {
    let upcomingSessionItem = history.state.data.upcomingSessionItem;
    let upcomingSessionFulfillment = history.state.data.upcomingSessionFulfillment;
    let upComingCategories = history.state.data.upComingCategories;
    let session = {
      itemId: upcomingSessionItem.id,
      fulfillmentId: upcomingSessionFulfillment.id,
      title: upcomingSessionItem.descriptor.name,
      description: upcomingSessionItem.descriptor.long_desc,
      image: upcomingSessionItem.descriptor.images[0],
      status: upcomingSessionFulfillment.tags.status,
      startDate: upcomingSessionFulfillment.start.time.timestamp,
      endDate: upcomingSessionFulfillment.end.time.timestamp,
      isEnrolled: false,
      mentorName: upcomingSessionFulfillment.agent.name,
      recommendedFor: upcomingSessionItem.tags.recommended_for,
      categories: upComingCategories,
      medium: upcomingSessionFulfillment.language,
      providerName: upcomingSessionItem.providerName,
      bppName: upcomingSessionItem.bppName,
      context: history.state.data.context
    }
    this.upcomingSessions.push(session);
  }
  async ionViewWillEnter(){
    //this.upcomingSessions = await this.sessionService.getUpcomingSessions(this.mentorId);
  }
  // async getMentor() {
  //   let user = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
  //   // this.mentorId=user._id;
  //   const config = {
  //     url: urlConstants.API_URLS.MENTOR_PROFILE_DETAILS + this.mentorId,
  //     payload: {}
  //   };
  //   try {
  //     let data: any = await this.httpService.get(config);
  //     this.detailData.data = data.result;
  //   }
  //   catch (error) {
  //   }
  // }

  goToHome() {
    this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`], { replaceUrl: true });
  }

  async segmentChanged(ev: any) {
    this.segmentValue = ev.detail.value;
    //this.upcomingSessions = (this.segmentValue == "upcoming") ? await this.sessionService.getUpcomingSessions(this.mentorId) : [];
  }
  async onAction(event){
    console.log(event)
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}`], {state: {data: event.data}});
        break;

      case 'joinAction':
        await this.sessionService.joinSession(event.data._id);
        this.upcomingSessions = await this.sessionService.getUpcomingSessions(this.mentorId);
        break;

      // case 'enrollAction':
      //   await this.sessionService.enrollSession();
      //   this.upcomingSessions = await this.sessionService.getUpcomingSessions(this.mentorId);
      //   break;
    }
  }
}
