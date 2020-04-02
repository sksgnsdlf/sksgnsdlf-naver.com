import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginSession } from '../../../services/login.session';
import { MaxPageSize } from '../../../../config';
import { MapProvider } from '../../../providers/map';

@Component({
  selector: 'itsm-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

   // 검색변수
   subj :string = "";     // 제목
   state = "";            // 게시상태
   // 페이징변수
   total: number = 0;
   totalPage:number = 0;
   page = 1;
   pageSize = 10;
   maxPage:number = MaxPageSize;
   collectionSize:number = 10;
   org = "";
   
   use_yn='';
   map_nm='';
   faq_list;
   
   history_state;
   history_subj;

  constructor(private router: Router,public loginSession: LoginSession, private mapprovider: MapProvider) { 
    this.history_state = sessionStorage.getItem('state');
    this.history_subj = sessionStorage.getItem('subj');
  }

  ngOnInit() {
    // 페이징
    this.getOrg();
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

    // 제목
    if(this.subj) queryString += `&search=${this.subj}`;
    sessionStorage.setItem('subj', this.subj);

    // 사용여부
    if(this.state) queryString += `&state=${this.state}` ;
    sessionStorage.setItem('state', this.state);
    
    this.mapprovider.faq.getlist(queryString)
      .subscribe((element:any) => {
        // total값
        this.total = element.total;
        this.totalPage = Math.ceil(this.total/this.pageSize);
        this.collectionSize = this.totalPage * 10;
        // 배열방식으로 되어있는 data값을 list에 다 넣어줌
        this.faq_list = element.data;
        // console.log("this.notice_list => "+ JSON.stringify(this.notice_list));
      });
    }


  // 등록페이지
  goto_add_faq_page(society_no= null){
    this.router.navigate(['/map/faqenrollment'],{ queryParams: { society_no } });
  }

  // 상세(수정)내용페이지
  openDetail(faq_no){
    this.router.navigate(['/map/faqenrollment'],{ queryParams: { faq_no } });
  }
}