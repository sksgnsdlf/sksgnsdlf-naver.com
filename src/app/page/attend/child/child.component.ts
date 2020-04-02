import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginSession } from '../../../services/login.session';
import { MaxPageSize } from '../../../../config';
import { AttendProvider } from '../../../providers/attend';
import { SocietyProvider } from '../../../providers/society';

@Component({
  selector: 'itsm-child',
  templateUrl: './child.component.html',
  styleUrls: ['./child.component.scss']
})
export class ChildComponent implements OnInit {


  // 검색조건
  childname = "";            // 어린이집명
  oper_state : string = '';  // 어린이집 운영상태

  // 단체선택에 대한 데이터
  info_nm : any = {};
  info_no : any = {};

  // 페이징변수
  total: number = 0;
  totalPage:number = 0;
  page = 1;
  pageSize = 10;
  maxPage:number = MaxPageSize;
  collectionSize:number = 10;
  org = "";

  eventorg_list='';

  info : any = {};                                                  // 로그인했는 사람 유저번호
  ceo_childhome_list = '';                                          // 로그인했는 사람에 대한 어린이집 리스트

  history_childname;
  history_oper_state;
  constructor(private router: Router,public loginSession: LoginSession, private attendProvider: AttendProvider) { 
      this.history_childname = sessionStorage.getItem('childname');
      this.history_oper_state = sessionStorage.getItem('oper_state');
    }
  ngOnInit() {
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

    let queryString = `pageNo=${pageIndex}&pageSize=${this.pageSize}`;

    // 제목
    if(this.history_childname) {
      this.childname = this.history_childname;
      this.history_childname = '';
    }
    
    // 사용여부
    if(this.history_oper_state) {
      this.oper_state = this.history_oper_state;
      this.history_oper_state = '';
    }

    // 어린이집 명
    if(this.childname) queryString += `&search=${this.childname}` ;
    sessionStorage.setItem('childname', this.childname);

    // 운영상태(0,1,9)
    if(this.oper_state) queryString += `&oper_state=${this.oper_state}`;
    sessionStorage.setItem('oper_state', this.oper_state);

    this.attendProvider.child.childlist(queryString)
      .subscribe((element:any) => {
        this.info.user_no = localStorage.getItem('user_no');            // 로그인한 사람 유저번호

        if(this.info.user_no == '1'){                                   // 관리자는 전부다 볼 수 있음
        // total값
        this.total = element.total;
        this.totalPage = Math.ceil(this.total/this.pageSize);
        this.collectionSize = this.totalPage * 10;
        this.eventorg_list = element.list;
        } else if(this.info.user_no != '1') {                           // 관리자가 아니면 원장이 소속된 게시글만 나옴
        this.ceo_childhome_list = element.list.filter(element => {
          return element.ceo_user_no == this.info.user_no;
        });
      }});
    }

  // 등록페이지
  goto_add_childattend_page(){
     this.router.navigate(['/attend/childenrollment']);
  }

  // 상세(수정)내용페이지
  openDetail(daycare_no){
    this.router.navigate(['/attend/childenrollment'],{ queryParams: { daycare_no } , });
  }
}
