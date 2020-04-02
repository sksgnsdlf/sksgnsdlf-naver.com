import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginSession } from '../../../services/login.session';
import { MaxPageSize } from '../../../../config';
import { AttendProvider } from '../../../providers/attend';
import { SocietyProvider } from '../../../providers/society';

@Component({
  selector: 'itsm-eventoffi',
  templateUrl: './eventoffi.component.html',
  styleUrls: ['./eventoffi.component.scss']
})
export class EventoffiComponent implements OnInit {

  // 검색조건
  // 1차
  society_no = null; // 단체선택 No값
  
  // 2차
  course_nm=""; // 행사명
  from_dt ='';  // 시작일자
  to_dt ='';    // 종료일자

  // 단체선택에 대한 데이터
  info_nm : any = {};
  org_no : any = {};

  // 페이징변수
  total: number = 0;
  totalPage:number = 0;
  page = 1;
  pageSize = 10;
  maxPage:number = MaxPageSize;
  collectionSize:number = 10;
  org = "";

  eventorg_list='';

  history_course_nm;
  history_from_dt;
  history_to_dt;
  
  constructor(private router: Router,public loginSession: LoginSession, private attendProvider: AttendProvider, 
    private society : SocietyProvider) { 
      this.history_course_nm = sessionStorage.getItem('course_nm');
      this.history_from_dt = sessionStorage.getItem('from_dt');
      this.history_to_dt = sessionStorage.getItem('to_dt');
    }


  ngOnInit() {
    this.getOrg()
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

    let queryString = `?pageNo=${pageIndex}&pageSize=${this.pageSize}&service_cls=2`;

    // 제목
    if(this.history_course_nm) {
      this.course_nm = this.history_course_nm;
      this.history_course_nm = '';
    }
    
    // 사용여부
    if(this.history_from_dt) {
      this.from_dt = this.history_from_dt;
      this.history_from_dt = '';
    }

    // 사용여부
    if(this.history_to_dt) {
      this.to_dt = this.history_to_dt;
      this.history_to_dt = '';
    }

    // 행사명
    if(this.course_nm) queryString += `&search=${this.course_nm}` ;
    sessionStorage.setItem('course_nm', this.course_nm);

    // 등록일자(from)
    if(this.from_dt) queryString += `&start_dttm=${this.from_dt}`;
    sessionStorage.setItem('from_dt', this.from_dt);

    // 등록일자(to)
    if(this.to_dt) queryString += `&close_dttm=${this.to_dt}`;
    sessionStorage.setItem('to_dt', this.to_dt);
    
    this.attendProvider.eventorg.getlist(queryString)
      .subscribe((element:any) => {
        // total값
        this.total = element.total;
        this.totalPage = Math.ceil(this.total/this.pageSize);
        this.collectionSize = this.totalPage * 10;
        this.eventorg_list = element.list;
      });
    }

  
  // 등록페이지
  goto_add_eventorg_page() { // org_no,org_nm
     this.router.navigate(['/attend/eventoffienrollment']);
  }

    // 상세(수정)내용페이지
    openDetail(course_no, org_nm){
      this.router.navigate(['/attend/eventoffienrollment'],{ queryParams: { course_no, org_nm } , });
    }
}
