import { Component, OnInit } from '@angular/core';
import { ResourceService } from '../../../services/resource.service';
import { LoginSession } from '../../../services/login.session';
import { Router } from '@angular/router';
import { MapProvider } from '../../../providers/map';
import { MaxPageSize } from '../../../../config';
import { UtilService } from '../../../services/util';

@Component({
  selector: 'itsm-reportmanage',
  templateUrl: './reportmanage.component.html',
  styleUrls: ['./reportmanage.component.scss']
})
export class ReportmanageComponent implements OnInit {

  // API가져오기 ( total, data)
  data_list: any;

  state_list : any = [];                  // 처리상태(신고(0), 접수(1) 처리(2))
  cls_list : any = [];                    // 시설분류리스트(주민센터(6)~공영주차장(12))

  // 검색변수
  fdate = '';                 // 신고일자(앞)
  tdate = '';                 // 신고일자(뒤)
  search = '';                // 신고내용
  state = '';                 // 처리상태
  cls_cd = '';                // 시설분류
  place_nm = '';              // 시설명
  user_nm = '';               // 신고자

  // 페이징변수
  total: number = 0;
  totalPage:number = 0;
  page :number= 1;
  pageSize = 10;
  maxPage:number = MaxPageSize;
  collectionSize:number = 10;
  org = "";

  lv2 = [];

  
  // 분류변수
  data:Array<any> = [];


  roles = [];
  
  history_pageIndex;
  history_fdate;
  history_tdate;
  history_search;
  history_state;
  history_cls_cd;
  history_place_nm;
  history_user_nm;

  constructor(private resource: ResourceService,public session: LoginSession, private mapprovider: MapProvider, private resourceService: ResourceService,public loginSession: LoginSession, private router: Router,public util: UtilService) { 
    this.history_pageIndex = sessionStorage.getItem('pageIndex');
    this.history_fdate = sessionStorage.getItem('fdate');
    this.history_tdate = sessionStorage.getItem('tdate');
    this.history_search = sessionStorage.getItem('search');
    this.history_state = sessionStorage.getItem('state');
    this.history_cls_cd = sessionStorage.getItem('cls_cd');
    this.history_place_nm = sessionStorage.getItem('place_nm');
    this.history_user_nm = sessionStorage.getItem('user_nm');
    this.page = parseInt(sessionStorage.getItem('page'));
  }

  

  ngOnInit() {
    // 리스트
    this.getOrg();

    // 파라미터용 속성
    this.mapprovider.reportmanage.get_cls_list().subscribe((element:any) => {
      // 시설분류 리스트(주민센터(6)~공영주차장(12))
      this.cls_list = element.place_cls;
      // 처리상태(신고(0), 접수(1) 처리(2))
      this.state_list = element.state;
    });
  }

  // 페이징 부가처리
  filter() {
    this.paging(this.page ? this.page : 1);
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


    let queryString = `?pageNo=${pageIndex}&pageSize=${this.pageSize}`;
    sessionStorage.setItem('pageIndex', pageIndex.toString());
    // 조건 사용한 적 있으면 유지시킴
    // 신고일자(from)
    if(this.history_pageIndex) {
      pageIndex = parseInt(this.history_pageIndex);                   // 3페이지에서 등록후 되돌아갈때 3이란 수는 유지가되는데 리스트페이지가 0으로 초기화됨
      this.history_pageIndex = '';                           // 세션에 사용된 운영상태값은 초기화시켜야 다른값이 들어올수 있음
    }

    if(this.history_fdate) {
        this.fdate = this.history_fdate;
        this.history_fdate = '';
      }
    // 신고일자(to)
    if(this.history_tdate) {
        this.tdate = this.history_tdate;
        this.history_tdate = '';
      }
    // 신고내용
    if(this.history_search) {
        this.search = this.history_search;
        this.history_search = '';
      }
    // 처리상태
    if(this.history_state) {
        this.state = this.history_state;
        this.history_state = '';
      }
    // 시설분류
    if(this.history_cls_cd) {
      this.cls_cd = this.history_cls_cd;
      this.history_cls_cd = '';
      }
    // 시설명
    if(this.history_place_nm) {
      this.place_nm = this.history_place_nm;
      this.history_place_nm = '';
      }
    // 신고자
    if(this.history_user_nm) {
      this.user_nm = this.history_user_nm;
      this.history_user_nm = '';
      }
    // ------------------------------

    // 검색조건------------

    // 신고일자(from)
    if(this.fdate) queryString += `&fdate=${this.fdate}`;
    sessionStorage.setItem('fdate', this.fdate);

    // 신고일자(to)
    if(this.tdate) queryString += `&to_dt=${this.tdate}`;
    sessionStorage.setItem('tdate', this.tdate);

    // 장소명
    if(this.search) queryString += `&search=${this.search}`;
    sessionStorage.setItem('search', this.search);

    // 처리상태
    if(this.state) queryString += `&state=${this.state}` ;
    sessionStorage.setItem('state', this.state);

    // 시설분류
    if(this.cls_cd) queryString += `&cls_cd=${this.cls_cd}` ;    
    sessionStorage.setItem('cls_cd', this.cls_cd);
    
    // 시설명
    if(this.place_nm) queryString += `&place_nm=${this.place_nm}` ;
    sessionStorage.setItem('place_nm', this.place_nm);

    // 신고자
    if(this.user_nm) queryString += `&user_nm=${this.user_nm}` ;
    sessionStorage.setItem('user_nm', this.user_nm);

      this.mapprovider.reportmanage.getlist(queryString).subscribe((element:any) => {
        // total값
        this.total = element.total;
        this.totalPage = Math.ceil(this.total/this.pageSize);
        this.collectionSize = this.totalPage * 10;
        // 배열방식으로 되어있는 data값을 list에 다 넣어줌
        this.data_list = element.list;
      });
    }

  // // 상세(수정)내용페이지
  openDetail(report_no){
    this.router.navigate(['map/reportbroken'],{ queryParams: { report_no } });
  }
}
