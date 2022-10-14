import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import {
  HttpService,
  LoaderService,
  ToastService
} from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';
interface mentorData {
  name: string;
  image: string;
  boards: Array<string>;
  grades: Array<string>;
  subjects: Array<string>;
  rating: number;
  areasOfExpertise: Array<string>;
  educationQualification: string;
  providerName: string;
  bppName: string;
  context: object;
  upcomingSessionItem: object;
  upcomingSessionFulfillment: object;
  upComingCategories:Array<string>;
}

@Component({
  selector: 'app-mentor-directory',
  templateUrl: './mentor-directory.page.html',
  styleUrls: ['./mentor-directory.page.scss'],
})
export class MentorDirectoryPage implements OnInit {
  page = 1; //todo: Enable pagenation
  limit = 100;
  searchText: string = '';
  public headerConfig: any = {
    menu: true,
    label: 'MENTORS_DIRECTORY',
    headerColor: 'primary',
    notification: false,
  };

  mentors;
  mentorsCount;
  fulfillments: any[];
  providers: any;
  categories: any;
  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private httpService: HttpService,
    private toast: ToastService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    // this.page = 1;
    // this.mentors = [];
    // this.searchText = '';
    // this.getMentors();
  }

  // async getMentors() {
  //   await this.loaderService.startLoader();
  //   const config = {
  //     url: urlConstants.API_URLS.MENTORS_DIRECTORY + this.page + '&limit=' + this.limit + '&search=' + this.searchText,
  //     payload: {}
  //   };
  //   try {
  //     let data: any = await this.httpService.get(config);
  //     this.loaderService.stopLoader();
  //     console.log(data.result, "data.result");
  //     this.mentors = this.mentors.concat(data.result.data);
  //     this.mentorsCount = data.result.count;
  //   }
  //   catch (error) {
  //     this.loaderService.stopLoader();
  //   }
  // }
  eventAction(event) {
    console.log(event, "event");
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([`/${CommonRoutes.MENTOR_DETAILS}`], { state: { data: event.data } });
        break;
    }
  }
  loadMore() {
    // this.page = this.page + 1;
    // this.getMentors();
  }
  async onSearch() {
    if (this.searchText != "") {
      (this.searchText.length >= 3) ? await this.getMentorsFromBAPServer() : this.toast.showToast("Provided text for search should have minimum 3 characters", "danger");
    } else {
      this.toast.showToast("Please provide a text for search", "danger")
    }
  }
  async getMentorsFromBAPServer() {
    await this.loaderService.startLoader();
    this.providers = this.fulfillments = [];
    const config = {
      url: urlConstants.API_URLS.SEARCH_SESSION + this.searchText
    };
    try {
      let data: any = await this.httpService.get(config);
      if (Array.isArray(data.data)) {
        this.arrangeMentorDetails(data.data);
      }
      await this.loaderService.stopLoader();
    }
    catch (error) {
      await this.loaderService.stopLoader();
    }
  }

  arrangeMentorDetails(dataArray: any) {
    dataArray.forEach(bppData => {
      bppData.message.catalog['bpp/providers'].forEach(provider=>{
        provider.context = bppData.context;
        provider.providerName = provider.descriptor.name;
        provider.bppName = bppData.message.catalog['bpp/descriptor'].name;
        this.providers = this.providers.concat(provider);
      })
      this.fulfillments = this.fulfillments.concat(bppData.message.catalog['fulfillments']);
      this.categories = bppData.message.catalog["bpp/categories"];
    });
    this.mapMentorDetails().then((mentors) => {
      this.mentors = mentors;
    })
  }

  mapMentorDetails(): Promise<Array<object>> {
    return new Promise((resolve, reject) => {
      let mentors = [];
      this.providers.forEach(provider => {
        provider.items.forEach(item=>{
          let categories = [];
          let fulfillment = this.fulfillments.find(element => element.id === item.fulfillment_id)
          categories = categories.concat(this.categories.find(element => element.id === item.category_id).descriptor.name)
          let mentorData: mentorData = {
            name: fulfillment.agent.name,
            image: fulfillment.agent.image,
            boards: fulfillment.agent.tags.boards,
            grades: fulfillment.agent.tags.grades,
            subjects: fulfillment.agent.tags.subjects,
            rating: fulfillment.agent.tags.rating,
            areasOfExpertise: ["Education leadership", "School process"],
            educationQualification: "MCA",
            providerName: provider.providerName,
            bppName: provider.bppName,
            context: provider.context,
            upcomingSessionItem: item,
            upcomingSessionFulfillment: fulfillment,
            upComingCategories: categories
           }
          mentors = mentors.concat(mentorData);
        })
      })
      resolve(mentors);
    })
  }
}
