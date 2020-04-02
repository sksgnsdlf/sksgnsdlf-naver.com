import { Component, OnInit,ApplicationRef,NgZone } from '@angular/core';
import { ResourceService } from '../../../services/resource.service';
import { LoginSession } from '../../../services/login.session';
import { MapProvider } from '../../../providers/map';
import { MaxPageSize } from '../../../../config';
import { UtilService } from '../../../services/util';
import { ActivatedRoute, Router } from '@angular/router';
import { AttendProvider } from '../../../providers/attend';

@Component({
  selector: 'itsm-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.scss']
})
export class PlaceComponent implements OnInit {
  
  // 지역리스트
  district_no_nm: Array<any> = [];         // 지역(HTML용)

  // API가져오기 ( total, data)
  list: any;
  // list = [];

  // 페이징변수
  total: number = 0;
  totalPage:number = 0;
  page :number= 1;
  pageSize = 10;
  maxPage:number = MaxPageSize;
  collectionSize:number = 10;
  org = "";

  lv2 = [];
  // 검색변수 ( 타입 지정안하면 안될수있음)
  oper_state="";   // 운영상태
  place_cls1 = -1; // 대분류
  select_theme=0;
  place_cls2 : any = [];     // 소분류
  place_nm :string = "";     // 장소명
  district_cd = '';  // 지역명(번호)
  from_dt = '';      // 등록일자 from
  to_dt = '';        // 등록일자 to
  use_yn = "";   // 사용유무
  loc_yn = "";    // 경도있는지에 대한 유무
  queryString = '';
  
  // 분류변수
  data:Array<any> = [];
  orgList: Array<any> = [];

  history_pageIndex;
  history_oper_state;
  history_use_yn;
  history_loc_yn;
  history_place_cls1;
  history_place_cls2;
  history_district_cd; 
  history_place_nm;
  history_from_dt;
  history_to_dt;

  // isfirst = true;
  constructor(public session: LoginSession, public mapprovider: MapProvider, public loginSession: LoginSession, private router: Router,public util: UtilService, private attendProvider: AttendProvider) {
      this.history_pageIndex = sessionStorage.getItem('pageIndex');
      this.history_oper_state = sessionStorage.getItem('oper_state');
      this.history_use_yn = sessionStorage.getItem('use_yn');
      this.history_loc_yn = sessionStorage.getItem('loc_yn');
      this.history_place_cls1 = sessionStorage.getItem('place_cls1');
      this.history_place_cls2 = sessionStorage.getItem('place_cls2');
      this.history_district_cd = sessionStorage.getItem('district_cd');
      this.history_place_nm = sessionStorage.getItem('place_nm');
      this.history_from_dt = sessionStorage.getItem('from_dt');
      this.history_to_dt = sessionStorage.getItem('to_dt');
      this.page = parseInt(sessionStorage.getItem('page'));
    }

  ngOnInit() {
      // 분류
      this.getCode().then(_=>{
        // 페이징 관련
        this.getOrg();
      });

      // 지역 데이터
      this.attendProvider.eventorg.eventget()
      .subscribe((element: any) => {
        // 행사지역
        this.district_no_nm = element.district;
      });
  }

  // 등록페이지
  goto_add_group_page(society_no = null) {
    this.router.navigate(['/map/enrollment'],{ queryParams: { society_no } });
  }

  // 검색조건에서 lv2를 선택후 lv1을 재선택할시 lv2 값을 전체(-1)로 초기화시킴
  place_lv2_reset() {
    this.place_cls2='-1';
  }

  // 페이징 부가처리
  filter() {
      this.paging(this.page ? this.page : 1); // parseInt(this.history_page ? this.history_page : 
  }

  // 페이징 부가처리
  getOrg() {
    this.filter();
  }

  // 리스트 값 + 페이징
  paging(page) {
    this.page = page;
    sessionStorage.setItem('page', page.toString());

    let pageIndex = page - 1;

    // 만약에 검색조건 건들고 등록이나 수정페이지 갔을때 세션을 통해 값을 가져와서 조건에 값넣고 페이지갱신
    // 페이지인덱스 값
    if(this.history_pageIndex) {
      pageIndex = this.history_pageIndex;                   // 3페이지에서 등록후 되돌아갈때 3이란 수는 유지가되는데 리스트페이지가 0으로 초기화됨
      this.history_pageIndex = '';                           // 세션에 사용된 운영상태값은 초기화시켜야 다른값이 들어올수 있음
    }

    // 운영상태
    if(this.history_oper_state) {
      this.oper_state = this.history_oper_state;              // 세션에 넣어둔 운영상태값을 넘김
      this.history_oper_state = '';                           // 세션에 사용된 운영상태값은 초기화시켜야 다른값이 들어올수 있음
    }
    // 사용여부
    if(this.history_use_yn) {
      this.use_yn = this.history_use_yn;
      this.history_use_yn = '';
    }
    // 위/경도
    if(this.history_loc_yn) {
      this.loc_yn = this.history_loc_yn;
      this.history_loc_yn = '';
    }
    // 대분류
    if(this.history_place_cls1) {
      this.place_cls1 = this.history_place_cls1;
      this.history_place_cls1 = '';
    }
    // 소분류
    if(this.history_place_cls2) {
      this.place_cls2 = this.history_place_cls2;
      this.history_place_cls2 = '';
    }
    // 지역명
    if(this.history_district_cd) {
      this.district_cd = this.history_district_cd
      this.history_district_cd = '';
    }
    // 장소명
    if(this.history_place_nm) {
      this.place_nm = this.history_place_nm
      this.history_place_nm = '';
    }
    // 등록일자(from)
    if(this.history_from_dt) {
      this.from_dt = this.history_from_dt
      this.history_from_dt = '';
    }
    // 등록일자(to)
    if(this.history_to_dt) {
      this.to_dt = this.history_to_dt
      this.history_to_dt = '';
    }
    // 검색조건------------

    this.queryString = `?pageNo=${pageIndex}&pageSize=${this.pageSize}`;   
    sessionStorage.setItem('pageIndex', pageIndex.toString());

    if(this.oper_state) this.queryString += `&oper_state=${this.oper_state}` ;
    sessionStorage.setItem('oper_state', this.oper_state);

    // 사용여부
    if(this.use_yn) this.queryString += `&use_yn=${this.use_yn}`;
    sessionStorage.setItem('use_yn', this.use_yn);
    
    // 위/경도
    if(this.loc_yn) this.queryString += `&loc_yn=${this.loc_yn}`;
    sessionStorage.setItem('loc_yn', this.loc_yn);

    // 대분류
    if(this.place_cls1 > -1) 
    {                                 // index값 0~4까지를 대입시켜주는것이다.(아닌거같은데)
      this.queryString += `&place_cls1=${this.data[this.place_cls1].cls_cd}`;
    }
    else if(this.place_cls1 = -1){                                             // 대,소분류했을때 대분류를 전체로 바꾸면 소분류는 초기화해야 다시 전체값이 나옴
      this.place_cls2 = '';                                                    // 소분류 초기화
    }
    sessionStorage.setItem('place_cls1', this.place_cls1.toString());

    // 소분류
    if(this.place_cls2 > -1) this.queryString += `&place_cls2=${this.place_cls2}`;
    sessionStorage.setItem('place_cls2', this.place_cls2);

    // 지역명
    if(this.district_cd) this.queryString += `&district_cd=${this.district_cd}`;
    sessionStorage.setItem('district_cd', this.district_cd);

    // 장소명
    if(this.place_nm) this.queryString += `&place_nm=${this.place_nm}`;
    sessionStorage.setItem('place_nm', this.place_nm);

    // 등록일자(from)
    if(this.from_dt) this.queryString += `&from_dt=${this.from_dt}`;
    sessionStorage.setItem('from_dt', this.from_dt);

    // 등록일자(to)
    if(this.to_dt) this.queryString += `&to_dt=${this.to_dt}`;
    sessionStorage.setItem('to_dt', this.to_dt);

      this.mapprovider.place.getlist(this.queryString)
      .subscribe((element:any) => {
        // total값
        this.total = element.total;
        this.totalPage = Math.ceil(this.total/this.pageSize);
        this.collectionSize = this.totalPage * 10;
        // 배열방식으로 되어있는 data값을 list에 다 넣어줌
        this.list = element.data;
        // if(this.isfirst)
        // {
        //   this.page = this.history_page;
        //   this.isfirst =false;
        // }
      });        
    }

  // 대분류, 소분류 select(option)
  getCode(lev1Index = -1) {
    this.data = [];
    var self = this;
     return new Promise( function (resolve, reject) {
      self.mapprovider.cls.getSearch(1)
      .subscribe((level1:any)=>{
        self.mapprovider.cls.getSearch(2)
        .subscribe((level2:any)=>{

             let customlv1 = [];

            level2.forEach(element => {
              customlv1.push({
                ...element,
                lvl: 2,
                name: `${element.cls_nm} (${element.cls_cd})`,
                expanded: false,
                sub: []
              });
            });

            level1.forEach(element => {
              let item = {
                 ...element,
                lvl: 1,
                name: `${element.cls_nm} (${element.cls_cd})`,
                expanded: false,
                sub:[],
                lv2:  customlv1.filter(lv2=>{
                  return lv2.upper_cd == element.cls_cd;
                })
              }
              self.data.push(item);
            resolve();
            });
           },err=>{
             reject(err);
           });
      },err=>{
        reject(err);
      });
    });
    }

    // 페이지당 표시수
    onChange(pageSize:any){
      let pageIndex = this.page - 1;
      let queryString = `?pageNo=${pageIndex}&pageSize=${pageSize}`;
      this.mapprovider.place.getlist(queryString)
      .subscribe((element:any) => {
      this.total = element.total;
      this.totalPage = Math.ceil(this.total/this.pageSize);
      this.collectionSize = this.totalPage * 10;
      this.list = element.data;
    });
  }

  // 상세(수정)내용페이지
  openDetail(place_no){
    this.router.navigate(['map/enrollment'],{ queryParams: { place_no } }); //
  }
}
