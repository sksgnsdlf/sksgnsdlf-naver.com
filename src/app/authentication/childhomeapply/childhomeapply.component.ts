import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { AttendProvider } from '../../providers/attend';
import { Router } from '@angular/router';
import { LoginSession } from '../../services/login.session';
import { MapProvider } from '../../providers/map';

declare let daum: any;

@Component({
  selector: 'itsm-childhomeapply',
  templateUrl: './childhomeapply.component.html',
  styleUrls: ['./childhomeapply.component.scss']
})
export class ChildhomeapplyComponent implements OnInit {

  
  district_nm: Array<any> = [];         // 지역(HTML용)

  user_nm: string = '';                  // 로그인한 사람이름
  cp_no: string = '';                            // 로그인한 전화번호

  // 어린이집 등록
  childhome : any = { };
  constructor(private ref: ChangeDetectorRef, private attendProvider: AttendProvider, private router: Router, private auth: LoginSession, private mapprovider: MapProvider) {
    this.user_nm = localStorage.getItem('user_name');
    this.cp_no = localStorage.getItem('user_cp_no');
  }
  ngOnInit() {
    // 신청할때 초기값
    this.childhome = {
      district_cd : "D03",                // D03 -> 구룡포면
      oper_state : "0"                    // 0 -> 신청
     };

    // 지역 데이터
    this.attendProvider.eventorg.eventget().subscribe((element: any) => {
      // 행사지역
      this.district_nm = element.district;
    });

  }

  // 우편번호
  getPost(){
    new daum.Postcode({
      oncomplete: (data) => {
          // 팝업에서 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

          // 도로명 주소의 노출 규칙에 따라 주소를 조합한다.
          // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
          var fullRoadAddr = data.roadAddress; // 도로명 주소 변수
          var extraRoadAddr = ''; // 도로명 조합형 주소 변수

          // 법정동명이 있을 경우 추가한다. (법정리는 제외)
          // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
          if(data.bname !== '' && /[동|로|가]$/g.test(data.bname)){
              extraRoadAddr += data.bname;
          }
          // 건물명이 있고, 공동주택일 경우 추가한다.
          if(data.buildingName !== '' && data.apartment === 'Y'){
             extraRoadAddr += (extraRoadAddr !== '' ? ', ' + data.buildingName : data.buildingName);
          }
          // 도로명, 지번 조합형 주소가 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
          if(extraRoadAddr !== ''){
              extraRoadAddr = ' (' + extraRoadAddr + ')';
          }
          // 도로명, 지번 주소의 유무에 따라 해당 조합형 주소를 추가한다.
          if(fullRoadAddr !== ''){
              fullRoadAddr += extraRoadAddr;
          }

          // 우편번호와 주소 정보를 해당 필드에 넣는다.
          console.log(data);
          this.childhome.post = data.zonecode;      // 5자리 우편번호 사용
          this.childhome.addr = data.jibunAddress;  // 주소
          this.mapprovider.place.get_dong(data.bname)                                 // 좌표의 동, 읍, 면
          .subscribe((element:any) => {
            this.childhome.district_cd = element.district_cd;
        });
          this.ref.detectChanges();
      }
    }).open();
  }

  save() {
    this.attendProvider.childenroll.post({
      ceo_nm : this.user_nm,                      // 신청자(원장)이름
      ceo_cp_no : this.cp_no,                     // 신청자(원장)번호
      ...this.childhome,                          // 나머지 넘길 정보
    }).subscribe(_ => {
      alert('신청이 완료되었습니다.');
      // this.router.navigate(['/authentication/login']);
      this.auth.logout();                               // 신청하기 누른후 로그아웃시킴
      }, err => {
      alert('어린이집 이름은 필수입니다.');
    });
  }
}
