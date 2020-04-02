import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginSession } from '../../../services/login.session';
import { MapProvider } from '../../../providers/map';
import { MaxPageSize } from '../../../../config';

@Component({
  selector: 'itsm-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss']
})
export class ThemeComponent implements OnInit {

  // 테마코드
  themecode :Array<any> = [];
  // api 담을 값
  list = [];

  // 페이징변수
  total: number = 0;
  totalPage:number = 0;
  page = 1;
  pageSize = 10;
  maxPage:number = MaxPageSize;
  collectionSize:number = 10;
  org = "";

  // 검색변수 ( 타입 지정안하면 안될수있음)
  cls_cd : number = -1 ;                  // 테마구분
  map_nm :string = "";                    // 테마지도명
  use_yn : number = -1;                   // 사용유무
  from_dt ='';                            // 등록일자 from
  to_dt = '';                             // 등록일자 to

  history_map_nm;
  history_use_yn;
  history_from_dt;
  history_to_dt;

  constructor(private router: Router,public loginSession: LoginSession, private mapprovider: MapProvider) {
    
    this.history_map_nm = sessionStorage.getItem('map_nm');
    this.history_use_yn = sessionStorage.getItem('use_yn');
    this.history_from_dt = sessionStorage.getItem('from_dt');
    this.history_to_dt = sessionStorage.getItem('to_dt');
   }

  ngOnInit() {
    // 페이징
    this.getOrg();

    // 테마구분
    this.mapprovider.theme.getcode()
    .subscribe((code:any) => {
      this.themecode = code;
    });
  }

  // 페이징 부가처리
  getOrg() {
    this.filter();
  }

  // 페이징 부가처리
  filter() {
    this.paging(1);
  }

  // 테이블 페이징
  paging(page) {
    let pageIndex = page - 1;

    // pageNo(pageIndex) -> 현재 페이지값 / pageSize(this.pageSize) -> 전체페이지값(10)
    let queryString = `?pageNo=${pageIndex}&pageSize=${this.pageSize}`;

    // 조건 사용한 적 있으면 유지시킴
    // 테마지도명
    if(this.history_map_nm) {
      this.map_nm = this.history_map_nm;
      this.history_map_nm = '';
    }
    // 사용여부
    if(this.history_use_yn) {
      this.use_yn = this.history_use_yn;
      this.history_use_yn = '';
    }
    // 등록일자(from)
    if(this.history_from_dt) {
      this.from_dt = this.history_from_dt;
      this.history_from_dt = '';
    }
    // 등록일자(to)
    if(this.history_to_dt) {
      this.to_dt = this.history_to_dt;
      this.history_to_dt = '';
    }
    // ---------------------------

  // 검색조건(파라미터) -------------------------------------

    // 테마구분
    if(this.cls_cd > -1){
      queryString += `&cls_cd=${this.themecode[this.cls_cd].id}` ;
    }

    // 테마지도명
     if(this.map_nm) queryString += `&map_nm=${this.map_nm}`;
     sessionStorage.setItem('map_nm', this.map_nm);

    // 사용여부
     if(this.use_yn > -1){
      queryString += `&use_yn=${this.use_yn}`;
     } 
     sessionStorage.setItem('use_yn', this.use_yn.toString());

    // 등록일자(from)
     if(this.from_dt) queryString += `&from_dt=${this.from_dt}`;
     sessionStorage.setItem('from_dt', this.from_dt);

    // 등록일자(to)
     if(this.to_dt) queryString += `&to_dt=${this.to_dt}`;
     sessionStorage.setItem('to_dt', this.to_dt);

      this.mapprovider.theme.getlist(queryString)
      .subscribe((element:any) => {
        // total값
        this.total = element.total;
        this.totalPage = Math.ceil(this.total/this.pageSize);
        this.collectionSize = this.totalPage * 10;
        // 배열방식으로 되어있는 data값을 list에 다 넣어줌
        this.list = element.data;
        // console.log("this.list => "+ JSON.stringify(this.list));
      });
    }

    // 상세(수정)내용페이지
    openDetail(map_no){
      this.router.navigate(['map/themeenrollment'],{ queryParams: { map_no } }); //
      //console.log("map_no=>" +map_no);
  }

  // 등록페이지
  goto_add_group_page(map_no = null){
    this.router.navigate(['/map/themeenrollment'],{ queryParams: { map_no } });
  }
}
