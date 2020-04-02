import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginSession } from '../../../services/login.session';
import { MaxPageSize } from '../../../../config';
import { AttendProvider } from '../../../providers/attend';
import { NgbModal, NgbDate, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { API } from '../../../../config';
import * as FileSaver from 'file-saver';
import { MapProvider } from '../../../providers/map';
import * as moment from 'moment';

declare let daum: any;

@Component({
  selector: 'itsm-eventorgenrollment',
  templateUrl: './eventorgenrollment.component.html',
  styleUrls: ['./eventorgenrollment.component.scss']
})
export class EventorgenrollmentComponent implements OnInit {

  // (등록)넘길값
  user_no = '';                     // 로그인한 사람 번호
  district_nm: Array<any> = [];     // 행사관련 변수
  course_typ: Array<any> = [];      // 행사종류 변수
  start_dttm;                       // 행사기간(앞)
  start_dttm_parse;                 // 행사기간(앞)(HTML)
  start_dttm_hms;                   // 행사기간 시분초(앞)(HTML) (start_dttm_parse와 합쳐서 DB로 보냄)
  close_dttm;                       // 행사기간(뒤)
  close_dttm_parse;                 // 행사기간(뒤)(HTML)
  close_dttm_hms;                   // 행사기간 시분초(뒤)(HTML) (close_dttm_parse와 합쳐서 DB로 보냄)
  in_allow_tm;                      // 입장허용시간(전체)
  out_allow_tm;                     // 퇴장허용시간(전체)
  open_time_first;                  // 입장허용시간(앞)
  open_time_last;                   // 입장허용시간(뒤)  
  close_time_first;                 // 퇴장허용시간(앞)
  close_time_last;                  // 퇴장허용시간
  attendance_dvsn: Array<any> = []; // 입퇴장 변수
  beaconcheck: string = "1";        // 비콘 사용유무
  beacon_list: Array<any> = [];     // 비콘장치
  rfidcheck: string = "1";          // nfc 사용유무
  rfid_list: Array<any> = [];       // nfc(rfid)
  qrcheck: string = "1";            // qr 사용유무

  // 수정할때
  no: any = { };                    // 수정할때 받는 구분값(course_no)
  org_nm ='';                       // 기관단체명
  org_no;                           // 기관단체번호
  society_no;                       // 

  // (수정)넘길값
  eventorg : any = { };

  selectedOrgNo = 1;               // (비컨, nfc) 리스트 변수
  assign_popup_type: number = 0;   // (비컨, nfc) 리스트 변수
  tempIdx: number = 0;             // (비컨, nfc) 리스트 변수
  beacons:any = [];                // 비컨 선택할 리스트(이거 바꿔야할수도있음)
  rfid:any = [];                   // nfc 선택할 리스트

  // 회원 변수 -------------------------------------------------------------------

  attendenrollment : boolean = false;     // 출결등록버튼 활성화

  // 페이징변수
  total: number = 0;
  totalPage: number = 0;
  page = 1;
  pageSize = 10;
  maxPage: number = MaxPageSize;
  collectionSize:number = 10;
  org = '';

  userdata : Array<any> = [];   // 회원들 리스트
  search = '';                   // 회원명 검색

  // 회원 출결등록(DB)
  save_course_no = '';          // 행사등록이 되면 회원출결가능

  attend_user_nm = '';          // 회원 이름
  attend_cp_no ='';             // 회원 휴대번호
  dvsn: string = "1";           // 입장,퇴장구분값
  record_dttm ='';              // 입장,퇴장시간(년월일+시분초)
  record_dttm_parse;            // 입장,퇴장시간(년월일)
  record_dttm_hms;              // 입장,퇴장시간(시분초)

  // 지도
  search_map: string = "";
  marker: any = {};
  locationSelectItem: any = { position: {}, name: '', dongmyun: '' };
  location: any = new daum.maps.LatLng(36.0190238, 129.3433917);
  infoWindow: any = new daum.maps.InfoWindow({
    zindex: 1
  });
  mapOptions: any = {
    level: 3,
    center: new daum.maps.LatLng(36.0190238, 129.3433917)
  };
  map: any = {};
  geocoder = new daum.maps.services.Geocoder();
  ps = null;

  constructor(private router: Router, public loginSession: LoginSession, private attendprovider: AttendProvider ,
    private route: ActivatedRoute , private modalService: NgbModal, private attendProvider: AttendProvider, 
    private http: HttpClient, private ngbFormatter: NgbDateParserFormatter, private mapprovider: MapProvider) { 
      this.user_no = localStorage.getItem('user_no');
    }

  ngOnInit() {
    this.route.queryParams.subscribe(no => {
      // 게시판번호
      this.no.course_no = no.course_no;
      // DB넘겨야할 기관단체 no값
      this.org_no = no.org_no;

      // 기관단체번호
      this.society_no = no.society_no;

      // html에서 사용중
      this.org_nm = no.org_nm;

      if(no.course_no) { // 수정할때
        this.attendprovider.eventorg.get(no.course_no).subscribe((data: any) => {
          // API전체값
          this.eventorg = {...data};
          // console.log("this.eventorg=>" + JSON.stringify(this.eventorg))
          this.start_dttm = data.start_dttm;                                    // 행사기간(앞) 전체값(날짜 + 시분초)(참조값)
          this.start_dttm_parse = this.ngbFormatter.parse(this.start_dttm);     // 행사기간(앞) 날짜
          this.start_dttm_hms = (data.start_dttm + '').substring(11, 19);       // 행사기간(앞) 시분초

          this.close_dttm = data.close_dttm;                                    // 행사기간(뒤) 전체값(날짜 + 시분초)(참조값)
          this.close_dttm_parse = this.ngbFormatter.parse(this.close_dttm);     // 행사기간(뒤) 날짜
          this.close_dttm_hms = (data.close_dttm + '').substring(11, 19);       // 행사기간(뒤) 시분초

          this.in_allow_tm = data.in_allow_tm;                                  // 입장허용시간 전체
          this.open_time_first = (this.in_allow_tm).substring(0, 5);            // 입장허용시간(앞)
          this.open_time_last = (this.in_allow_tm).substring(6, 12);            // 입장허용시간(뒤)
          
          this.out_allow_tm = data.out_allow_tm;                                // 퇴장허용시간 전체
          this.close_time_first = (this.out_allow_tm).substring(0, 5);          // 퇴장허용시간(앞)
          this.close_time_last = (this.out_allow_tm).substring(6, 12);          // 퇴장허용시간(뒤)

          // 비콘장치
          this.beacon_list = data.beacon_list;
          // console.log(" this.beacon_list=>" + JSON.stringify(this.beacon_list));

          // nfc장치(rfid)
          this.rfid_list = data.rfid_list;
        });
      } else { // 등록할때
        this.eventorg = {
          society_no : this.org_no,         // 기관단체번호(필수)
          service_cls : 3,                  // 기관단체(필수)
          district_cd : 'D03',              // 지역(D03-> 구룡포면)
          course_typ : 1,                   // 행사종류(1. 행사, 2. 교육)
          beacon_list : this.beacon_list,   // 비콘리스트
          rfid_list : this.rfid_list,       // nfc리스트
          inout_chk : '1',                  // 입퇴장 체크(1. 입장, 2. 퇴장)
          use_beacon : '0',                 // 비콘 미사용
          use_nfc : '0',                    // nfc 미사용
          use_qr : '0'                      // qr미사용
        };
      }
    });
    // 행사관련 데이터
    this.attendProvider.eventorg.eventget()
      .subscribe((element: any) => {
        // 행사지역
        this.district_nm = element.district;
        // 행사종류
        this.course_typ = element.course_typ;
        // 입퇴장 체크
        this.attendance_dvsn = element.attendance_dvsn;
      });

    // 회원정보
    this.getOrg();

    // 지도 변수
    this.ps = new daum.maps.services.Places();
  }

  // 행사기간 -> 피커타입(year,month,day)에서 string타입(yyyy-mm-dd)로 바꾸는 구간 => DB에 string타입으로 바꿔줘야 들어감)
  onDateSelectionStart(date: NgbDate) {
    this.start_dttm = this.ngbFormatter.format(date);
  }

  onDateSelectionClose(date: NgbDate) {
    this.close_dttm = this.ngbFormatter.format(date);
  }

  // QR다운로드
  downloadUrl(url: string, fileName: string) {
    this.http.get(url, { responseType: 'blob' }).subscribe(val => {
      // console.log(val);
      FileSaver.saveAs(val, `${this.org_nm}_QR.png`);
    });
  }

  // 강좌 저장
  save() {
    this.attendProvider.eventorg.post({
      open_user_no : this.user_no,
      ...this.eventorg,                                                         // DB에 넘길땐 날짜, 시분초 합쳐서 넘겨야함
      start_dttm : this.start_dttm_parse.year + "-" + this.start_dttm_parse.month + "-" + this.start_dttm_parse.day + " " + this.start_dttm_hms,
      close_dttm : this.close_dttm_parse.year + "-" + this.close_dttm_parse.month + "-" + this.close_dttm_parse.day + " " + this.close_dttm_hms,
      in_allow_tm : (this.open_time_first ? this.open_time_first : '') + "~" + (this.open_time_last ? this.open_time_last : ''),     // 없을땐 빈값 넣어줘야함
      out_allow_tm : (this.close_time_first ? this.close_time_first : '') + "~" + (this.close_time_last ? this.close_time_last : ''),// 없을땐 빈값 넣어줘야함
    }).subscribe(_ => {
      alert('저장되었습니다.');
      // 등록하면 회원출결등록가능 변수
      var test = JSON.stringify(_);
      var test2 = JSON.parse(test);
      var course_no = test2.course_no;
      var org_nm = this.org_nm;
      this.router.navigate(['/attend/eventorgenrollment'],{ queryParams: { course_no, org_nm } });
    }, err => {
      alert('필수값을 넣어주세요.');
    });
  }

  // 강좌 삭제
  delete() {
    this.attendProvider.eventorg.delete({
        course_no: this.no.course_no,
    }).subscribe(
      _ => {
        alert('삭제되었습니다.');
        this.eventorgback();
      },
      err => {
        alert('삭제실패!');
      }
    );
  }
  // 돌아가기
  eventorgback() {
    this.router.navigate(['attend/eventorg']);
  }

  // 주소/위치 검색-------------------------------------------------------------------------
  openMap(content) {
    this.openModal(content, 'lg');
    this.search_map = this.locationSelectItem.name;
    var element = this;
    setTimeout(() => {
      var container = document.getElementById('map');
      this.map = new daum.maps.Map(container, this.mapOptions);
      this.marker = new daum.maps.Marker({
        position: this.location,
        map: this.map
      });

      if (this.locationSelectItem.position.latitude && this.locationSelectItem.position.longitude) {
        this.location = new daum.maps.LatLng(this.locationSelectItem.position.latitude, this.locationSelectItem.position.longitude);
        this.searchCoordinateToAddress(this.location, element);
      }
      this.map.setCenter(this.location);
      this.map.setLevel(3);
      daum.maps.event.addListener(this.map, 'click', (e) => {
        this.searchCoordinateToAddress(e.latLng, element);
      });
    }, 0);
  }

  // 주소/위치 연결메소드
  searchCoordinateToAddress(latlng, element) {
    element.searchDetailAddrFromCoords(latlng, function (result, status) {

      if (status === daum.maps.services.Status.OK) {
        var detailAddr = !!result[0].road_address ? '[도로명주소] : ' + result[0].road_address.address_name +'<br/>' : '';
        detailAddr += '[지번 주소] : ' + result[0].address.address_name;

        !!result[0].road_address ?  element.locationSelectItem.name = result[0].road_address.address_name : element.locationSelectItem.name = result[0].address.address_name;
        element.locationSelectItem.position.latitude = latlng.getLat();
        element.locationSelectItem.position.longitude = latlng.getLng();
        element.locationSelectItem.dongmyun = result[0].address.region_3depth_name;

        element.searchAddrFromCoords(latlng, function (result, status) {
          if (status === daum.maps.services.Status.OK) {
            for (var i = 0; i < result.length; i++) {
              if (result[i].region_type === 'H') {
                element.locationSelectItem.dongmyun = result[i].region_3depth_name;
                break;
              }
            }
          }
        });

        var content = '<div style="padding:5px;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;">' +
          detailAddr +
          '</div>';

        element.marker.setPosition(latlng);
        element.marker.setMap(element.map);

        element.infoWindow.setContent(content);
        element.infoWindow.open(element.map, element.marker);
        // 좌표위치 주소
        // console.log("element.locationSelectItem.name => " +element.locationSelectItem.name);
      }
    });
  }

  searchAddrFromCoords(coords, callback) {
    // 좌표로 행정동 주소 정보를 요청합니다
    this.geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);

    // 주소/위치, 위도, 경도 값 넘기기
    this.eventorg.addr = this.locationSelectItem.name;
    var abc :string = this.locationSelectItem.dongmyun;                         // 지도의 동, 읍, 면 string화
    var dong_name = abc.split(' ');                                             // 지도의 동, 읍, 면에서 첫번째 글자를 골라야함(흥해읍 학천리에서 흥해읍)
    this.mapprovider.place.get_dong(dong_name[0])                               // 좌표의 동, 읍, 면
      .subscribe((element:any) => {
        this.eventorg.district_cd = element.district_cd;
      });
  }

  searchDetailAddrFromCoords(coords, callback) {
    // 좌표로 법정동 상세 주소 정보를 요청합니다
    this.geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
  }

  // 주소/위치 모달
  searchAddressToCoordinateInput(){
    var element = this;
    this.searchAddressToCoordinate(this.search_map, element);
   }

   // 주소/위치 모달 연결메소드
   searchAddressToCoordinate(address, element) {
    element.ps.keywordSearch(address, function(result, status) {
      // 정상적으로 검색이 완료됐으면
      if (status === daum.maps.services.Status.OK) {
        var coords = new daum.maps.LatLng(result[0].y, result[0].x);
        element.map.setCenter(coords);
        element.searchCoordinateToAddress(coords,element);
      }else{
        return alert('주소를 확인해주세요.');
      }
    });
  }
 // 지도 끝--------------------------------------------------------------------------------------------

 // 비컨 추가버튼------------------------------------------------------------------------------------
   openAsgnPopup1(content, i, type) {
    this.tempIdx = i;
    this.assign_popup_type = type;
    
    this.attendprovider.eventorg.org_off_beaconlist(this.society_no).subscribe((data: any) => {
      this.beacons = data;
    });
    this.openModal(content, null, 'customModal');
  }

    // 체크박스
  userSelectChanged1(ev, item) {
    var index = this.beacon_list.findIndex(element => {
      return (element.beacon_no == item.beacon_no);
    });

      if (ev.target.checked) {
        if (index < 0) {
          this.beacon_list.push(item);
        }
      } else {
        if (index > -1) {
          this.beacon_list.splice(index, 1);
        }
      }
    }
    // nfc(비콘) 추가버튼 끝------------------------------------------------------------------------------

    // rfid 추가버튼 -------------------------------------------------------------------------------
    openAsgnPopup2(content, i, type) {
      this.tempIdx = i;
      this.assign_popup_type = type;
      // this.http.get(`${API}/attend/device?service_cls=3&check_typ=2&society_no=${this.society_no}`).subscribe((res:any)=>this.rfid=res);
      this.attendprovider.eventorg.org_off_rfidlist(this.society_no).subscribe((data: any) => {
        this.rfid = data;
      });
      this.openModal(content, null, 'customModal');
    }

      // 체크박스
    userSelectChanged2(ev, item) {
      var index = this.rfid_list.findIndex(element => {
        return element.rfid_no == item.rfid_no ;
      });
        if (ev.target.checked) {
          if (index < 0) {
            this.rfid_list.push(item);
          }
        } else {
          if (index > -1) {
            this.rfid_list.splice(index, 1);
          }
        }
      }

      // rfid 추가버튼 끝-----------------------------------------------------------------------------

   // 비콘장치 리스트 삭제
   deleteRow(i) {
    this.eventorg.beacon_list.splice(i, 1);
  }
   // nfc(rfid) 리스트 삭제
   deleteRow2(i) {
    this.eventorg.rfid_list.splice(i, 1);
  }

  // 회원정보-----------------------------------------------------------------------------
  // 출결등록
  attenrollbutton() {
    this.attendenrollment = true;
  }

  attenrollclose() {
    this.attendenrollment = false;
  }

  // 엑셀저장
  excel() {
    this.attendProvider.eventorg.excelget(this.no.course_no)
    .subscribe((_) => { // download file
      var blob = new Blob([_], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      var filename = `기관단체 회원리스트(${this.org_nm}).xlsx`; 
      FileSaver.saveAs(blob, filename);
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
    let queryString =`?pageNo=${pageIndex}&pageSize=${this.pageSize}&course_no=${this.no.course_no}`;

    if(this.search) queryString += `&search=${this.search}` ;

    this.attendProvider.eventorg.usergetlist(queryString).subscribe((data: any) => {
      this.total = data.total;
      this.totalPage = Math.ceil(this.total/this.pageSize);
      this.collectionSize = this.totalPage * 10;
      this.userdata = data.list;
    });
  }

  // 날짜 변환(위에)
  onDateSelectionin_out(date: NgbDate) {
    this.record_dttm = this.ngbFormatter.format(date);
    this.record_dttm = moment(this.record_dttm).format('YYYY-MM-DD')
  }

  // 유저 출결등록
  userpost() {
    if (!this.no.course_no) {
      alert('기관등록후 출결등록해주세요.');
      return;
    } if(this.attend_user_nm == ""){
      alert("이름을 적어주세요.")
      return;
    }
    else {
      this.attendProvider.eventorg.userpost({
        course_no: this.no.course_no,
        attendance_dvsn : this.dvsn == '1' ? 1 : 2 ,
        attend_user_nm : this.attend_user_nm,
        attend_cp_no : this.attend_cp_no,
        record_dttm : this.record_dttm + " " + this.record_dttm_hms
        // close_dttm :   this.close_dttm_parse.year + "-" +  this.close_dttm_parse.month + "-" +  this.close_dttm_parse.day + " " + this.close_dttm_hms,
      }).subscribe(_=>{
        alert('저장되었습니다.');
        // 등록후 초기화
        this.attend_user_nm = '';
        this.attend_cp_no = '';
        this.dvsn = '1';
        this.record_dttm_parse = '';
        this.record_dttm_hms ='';
        // 회원리스트 갱신
        this.getOrg();
      }, err => {
        alert('저장실패!');
      });
     }
    }

  // 유저 초기화
  userreset() {
    this.attend_user_nm = '';
    this.attend_cp_no = '';
    this.dvsn = '1';
    this.record_dttm_parse = '';
    this.record_dttm_hms ='';
  }

  // 유저 수정
  user_detail(one_data) {
    this.attend_user_nm = one_data.attend_user_nm;
    this.attend_cp_no = one_data.attend_cp_no;
    this.record_dttm_parse = '';
    this.record_dttm_hms ='';
  }

  // 유저 출결삭제
  userdelete(user) {
  this.attendProvider.eventorg.userdelete({
      course_no : this.no.course_no,
      attend_cp_no : user.attend_cp_no,
      attend_user_nm : user.attend_user_nm,
  }).subscribe(
    _ => {
      alert('삭제되었습니다.');
      this.getOrg();
      // 등록후 초기화
      this.attend_user_nm = '';
      this.attend_cp_no = '';
      this.record_dttm ='';
      this.dvsn = '1';
    },
    err => {
      alert('삭제실패!');
      }
    );
  }
   // 회원정보 끝-----------------------------------------------------------------------------

    // 모달창
    openModal(content, size = null, customClass=null){
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', size:size, windowClass:customClass }).result.then((result) => {
        // console.log(`Closed with: ${result}`);
      }, (reason) => {
       });
    }
}
