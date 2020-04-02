import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginSession } from '../../../services/login.session';
import { MaxPageSize } from '../../../../config';
import { AttendProvider } from '../../../providers/attend';
import { SocietyProvider } from '../../../providers/society';
import * as moment from 'moment';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'itsm-childattend',
  templateUrl: './childattend.component.html',
  styleUrls: ['./childattend.component.scss']
})
export class ChildattendComponent implements OnInit {

  // 검색조건
  // 1차(어린이집 리스트 select화 -> 해당 어린이집 daycare_no값 받는용)
  daycare_no = ''; //

  child_date : Array<any> = [];

  // 2차
  cls_list : Array<any> = [];   // 반 select
  class_cls_no = '';            // 담당반(파라미터)
  fdate ='';                    // 등원일자
  tdate ='';                    // 하원일자
  child_nm="";                  // 어린이 이름

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

  eventorg_list= [];                                                 // 관리자일땐 전체리스트
  info : any = {};                                                  // 로그인했는 사람 유저번호
  ceo_childhome_list = [];                                          // 로그인했는 사람에 대한 어린이집 리스트
  first_dayacare_no;                                                // 첫번째 값이 있어야 select에 적혀나옴(변수)

  constructor(private router: Router,public loginSession: LoginSession, private attendProvider: AttendProvider) {   }


  ngOnInit() {
    // 어린이집 list를 select에 사용
    this.attendProvider.child_attend.child_Select().subscribe((element:any) => {
      this.info.user_no = localStorage.getItem('user_no');            // 로그인한 사람 유저번호

      if(this.info.user_no == '1'){                                   // 관리자는 전부다 볼 수 있음
        // total값
        this.total = element.total;
        this.totalPage = Math.ceil(this.total/this.pageSize);
        this.collectionSize = this.totalPage * 10;
        this.eventorg_list = element.list;
      } 
      // else 시작
      else if(this.info.user_no != '1') {                             // 관리자가 아니면 원장이 소속된 어린이집만 나옴
        this.ceo_childhome_list = element.list.filter(element => {
          return element.ceo_user_no == this.info.user_no;
        });
        this.daycare_no =this.ceo_childhome_list[0].daycare_no;       // 첫번째 값이 있어야 select에 적혀나옴(변수) 안할시 select 첫번째값이 빈값이됨(매칭이안되서?)        
        this.getOrg(this.daycare_no);                                 // 페이지 실행시 첫번째값 기준으로 페이징설정(관리자로 할때는 시작과동시에 페이징 안시켰음)
        }// else 끝
      });
    }

  // select에서 daycare_no값을 받은뒤 해당 어린이들을 리스트 출력
  getOrg(daycare_no) {
    this.filter(daycare_no);
      // daycare_no값이 없을때 생각해야함
      this.attendProvider.childenroll.get(daycare_no).subscribe((data: any) => {

        // 반 정보
        this.cls_list = data.cls_list;
      });
  }

  // 조회
  filter(daycare_no) {
    this.paging(1, daycare_no);
  }
  // daycare_no가 있어야 2,3페이지넘어갈때도 daycare_no값이 유지가됨
  paging(page, daycare_no) {
    let pageIndex = page - 1;
    let queryString =`?pageNo=${pageIndex}&pageSize=${this.pageSize}`;

    // 어린이집 번호
    if (daycare_no) queryString += `&daycare_no=${daycare_no}` ;

    // 반 번호
    if (this.class_cls_no) queryString += `&cls_no=${this.class_cls_no}` ;

    // 출결시작날짜
    if (this.fdate) queryString += `&fdate=${this.fdate}` ;

    // 출결종료날짜
    if (this.tdate) queryString += `&tdate=${this.tdate}` ;

    // 어린이 이름
    if (this.child_nm) queryString += `&child_nm=${this.child_nm}` ;

    this.attendProvider.child_attend.child_List(queryString).subscribe((data: any) => {
      this.total = data.total;
      this.totalPage = Math.ceil(this.total / this.pageSize);
      this.collectionSize = this.totalPage * 10;
      this.child_date = data.list;
    });
  }

  // 엑셀저장
  excel() {
      var datetime = moment(new Date()).format('YYMMDD');
      this.attendProvider.child_attend.excel(this.class_cls_no, this.child_nm, this.fdate, this.tdate, this.page, this.totalPage)
        .subscribe((_) => { // download file
          var blob = new Blob([_], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          var filename = `출결일자(${this.child_nm}).xlsx`; 
          FileSaver.saveAs(blob, filename);
        });
  }
}
