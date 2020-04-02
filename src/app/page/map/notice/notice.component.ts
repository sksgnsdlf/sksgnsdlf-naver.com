import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginSession } from '../../../services/login.session';
import { MaxPageSize } from '../../../../config';
import { MapProvider } from '../../../providers/map';

@Component({
  selector: 'itsm-notice',
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.scss']
})
export class NoticeComponent implements OnInit {

   //
   subj :string = "";     // 제목
   state = "";            // 게시상태
   // 페이징변수
   total: number = 0;
   totalPage:number = 0;
   page :number= 1;
   pageSize = 10;
   maxPage:number = MaxPageSize;
   collectionSize:number = 10;
   org = "";
   queryString = '';

   use_yn='';
   map_nm='';
   notice_list;

   history_pageIndex;
   history_state;
   history_subj;

  constructor(private router: Router,public loginSession: LoginSession, private mapprovider: MapProvider) { 
    this.history_pageIndex = sessionStorage.getItem('pageIndex');
    this.history_state = sessionStorage.getItem('state');
    this.history_subj = sessionStorage.getItem('subj');
    this.page = parseInt(sessionStorage.getItem('page'));
  }

  ngOnInit() {
    // 페이징
    this.getOrg();
  }


  // 페이징 부가처리
  filter() {
    this.paging(this.page ? this.page : 1);
  }

  // 페이징 부가처리
  getOrg() {
    this.filter();
  }

  // 테이블 페이징
  paging(page) {
    this.page = page;
    sessionStorage.setItem('page', page.toString());

    let pageIndex = page - 1;

    // 검색조건 + 페이징값  사용한 적 있으면 유지시킴
    if(this.history_pageIndex) {
      pageIndex = this.history_pageIndex;
      this.history_pageIndex = '';
    }

    // 제목
    if(this.history_subj) {
      this.subj = this.history_subj;
      this.history_subj = '';
    }

    // 사용여부
    if(this.history_state) {
      this.state = this.history_state;
      this.history_state = '';
    }

    this.queryString = `?pageNo=${pageIndex}&pageSize=${this.pageSize}`;
    sessionStorage.setItem('pageIndex', pageIndex.toString());

    // 제목
    if(this.subj) this.queryString += `&search=${this.subj}`;
    sessionStorage.setItem('subj', this.subj);

    // 사용여부
    if(this.state) this.queryString += `&state=${this.state}` ;
    sessionStorage.setItem('state', this.state);

    this.mapprovider.notice.getlist(this.queryString)
      .subscribe((element:any) => {
        // total값
        this.total = element.total;
        this.totalPage = Math.ceil(this.total/this.pageSize);
        this.collectionSize = this.totalPage * 10;
        // 배열방식으로 되어있는 data값을 list에 다 넣어줌
        this.notice_list = element.data;
        // console.log("this.notice_list => "+ JSON.stringify(this.notice_list));
      });
    }


  // 등록페이지
  goto_add_notice_page(society_no= null){
    this.router.navigate(['/map/noticeenrollment'],{ queryParams: { society_no } });
  }

  // 상세(수정)내용페이지
  openDetail(notice_no){
    this.router.navigate(['/map/noticeenrollment'],{ queryParams: { notice_no } });
  }
}
