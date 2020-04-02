import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginSession } from '../../../services/login.session';
import { MaxPageSize } from '../../../../config';
import { AttendProvider } from '../../../providers/attend';
import { NgbModal,  ModalDismissReasons , NgbDate, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import { SocietyProvider } from '../../../providers/society';
import { HttpClient } from '@angular/common/http';
import { DAUM_MAP_API_KEY, API } from '../../../../config';
import { ChangeDetectorRef } from '@angular/core';
import { MapProvider } from '../../../providers/map';

declare let daum: any;

@Component({
  selector: 'itsm-childenrollment',
  templateUrl: './childenrollment.component.html',
  styleUrls: ['./childenrollment.component.scss']
})
export class ChildenrollmentComponent implements OnInit {

  // 수정할때 daycare_no값 받기용
  no: any = { };

  // 어린이집 등록
  childhome : any = { };

  // 어린이집 추가/수정
  daycare_no = '';              // 어린이집 번호
  daycare_nm = '';              // 어린이집 명
  oper_state = '0';             // 운영상태
  tel = '';                     // 대표전화
  post = '';                    // 우편번호
  addr ='';                     // 주소
  addr2 = '';                   // 상세주소
  district_cd ="D03";           // 지역(기본값-구룡포읍)

  district_nm: Array<any> = []; // 지역(HTML용)

  // 모달 검색창 리스트(원장, 교사)
  search_List = [];             // 검색창 리스트
  closeResult: string;
  search ='';                   // (모달) 검색정보

  // ---------------------------------------------------------------------------------
  // 어린이집 등록후
  response_daycare_no : any ;   // 최초 저장시 response받는 daycare_no값(HTML용) => 어린이집 등록후 no값이 있을때 반, 교사, nfc 영역이 열림(HTML용)

  // 반 등록창
  class: boolean = false;       // 반 등록창
  cls_list : Array<any> = [];   // 반 등록
  cls_nm = '';                  // 반 이름
  cls_no = '';                  // 반 번호 (DB기본키)

  // 교사 등록창
  teacher: boolean = false;     // 교사 등록창
  staff_list : Array<any> = [];
  staff_search_list :any = {};  // 교사 검색정보
  staff_no = '';                // 교사 번호 (DB기본키)

  // nfc 등록창
  nfc: boolean = false;         // nfc 등록창
  rfid_list : Array<any> = [];  // NFC카드 등록
  rfid_no ='';                  // NFC 번호 (DB기본키)
  rfid = '';                    // NFC

  // ----------------------------------------------------------------------------------
  // 어린이 리스트 검색
  classchoose = '';             // 반 선택(검색용) -- 나중에 써야함
  child_nm = '';                // (어린이집에 해당하는) 어린이 이름 검색
  childdata : Array<any> = [];  // 어린이 리스트

  // 어린이 리스트 페이징변수
  total: number = 0;
  totalPage:number = 0;
  page = 1;
  pageSize = 10;
  maxPage:number = MaxPageSize;
  collectionSize:number = 10;
  org = "";
  class_cls_no ='';

  // 어린이 등록창
  child: boolean = false;                // 어린이 등록창

  // 어린이 등록
  child_parent_data = { 
    child_no : undefined,                // 어린이 번호 (DB기본키)
    child_nm : undefined,                // 어린이 이름
    birth : undefined,                   // (필수) 어린이 생년월일(규격필수 ex.2015-11-11)
    birthDate : null,               // (필수) 어린이 생년월일(규격필수 ex.2015-11-11)
    cls_no : '',                         // (필수) 반 번호
    rfid_no : undefined,                 // 어린이 rfid
    rfid : undefined,                    // 태그ID(HTML용)
    // -- 부모정보
    parent_nm : undefined,               // (필수) 부모 이름
    parent_cp_no : undefined,            // (필수) 부모 휴대번호
    parent_user_no : undefined,          // 부모 (고유)번호
    use_yn : '1',                        // 재원여부
    parent_login_accnt : undefined,      // 보호자 아이디(HTML용)
    // noti_typ : undefined,
    // reg_user_no : undefined
  };

  // -------------------------------------------------------------------------------
  // 지도
  search_map: string = "";
  marker: any = {};
  locationSelectItem: any = { position: {}, name: '', dongmyun: '' };
  location: any = new daum.maps.LatLng(36.0190238, 129.3433917);
  infoWindow: any = new daum.maps.InfoWindow({
    zindex:1
  });
  mapOptions: any = {
    level: 3,
    center: new daum.maps.LatLng(36.0190238, 129.3433917)
  };
  map: any = {};
  geocoder = new daum.maps.services.Geocoder();
  ps = null;

  // -------------------------------------------------------------------------------
  constructor(private router: Router,public loginSession: LoginSession, private attendprovider: AttendProvider ,
    private route: ActivatedRoute , private modalService: NgbModal, private attendProvider: AttendProvider,
    private society : SocietyProvider, private ngbFormatter : NgbDateParserFormatter, private http:HttpClient,
    private ref: ChangeDetectorRef, private mapprovider: MapProvider) { }

  ngOnInit() {
    this.route.queryParams.subscribe(no => {
      // 게시판번호
      this.no.daycare_no = no.daycare_no;

      if(no.daycare_no){ // 수정할때
        this.attendprovider.childenroll.get(no.daycare_no).subscribe((data: any) => {

          // API전체값
          this.childhome ={...data};

          // 반 정보
          this.cls_list = data.cls_list;

          // 교사 정보
          this.staff_list = data.staff_list;

          // nfc 정보
          this.rfid_list = data.rfid_list;
        });
      }
      else { // 등록할때 초기값
        this.childhome = {
          district_cd : "D03",                // D03 -> 구룡포면
          oper_state : "0"                    // 0 -> 신청
        };
      }
    });

    // 지역 데이터
    this.attendProvider.eventorg.eventget()
      .subscribe((element: any) => {
        // 행사지역
        this.district_nm = element.district;
      });

    // 어린이 리스트
    this.getOrg();
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
          // console.log(data);
          this.childhome.post = data.zonecode;                                        // 5자리 우편번호 사용
          this.childhome.addr = data.jibunAddress;                                    // 주소
          this.mapprovider.place.get_dong(data.bname)                                 // 좌표의 동, 읍, 면
            .subscribe((element:any) => {
              this.childhome.district_cd = element.district_cd;
          });
          this.ref.detectChanges();
      }
    }).open();
  }

  // 어린이집 저장
  save() {
    this.attendProvider.childenroll.post({
      daycare_no : this.daycare_no ? this.daycare_no : undefined,                 // 어린이집 번호가 있으면 어린이집 수정 / 없으면 어린이집 추가
      ...this.childhome
    }).subscribe(_ => {
      alert('저장되었습니다.');

      // 최초 저장뒤 daycare_no가 있어야 반, 교사, nfc등록후 정상등록 및 페이지유지가능
      var test = JSON.stringify(_)
      var test2 = JSON.parse(test);
      var daycare_no = test2.daycare_no;
      this.router.navigate(['/attend/childenrollment'],{ queryParams: { daycare_no } });
      }, err => {
      alert('저장실패!');
    });
  }

  // 강좌 삭제
  delete() {
    this.attendProvider.childenroll.delete({
      daycare_no: this.no.daycare_no,
    }).subscribe(
      _ => {
        alert('삭제되었습니다.');
        this.childback();
      },
      err => {
        alert('삭제실패!');
      }
    );
  }
  // 돌아가기
  childback() {
    this.router.navigate(['attend/child']);
  }

 // 어린이집 등록후 추가할 반, 교사, NFC 리스트 -----------------------------------------------------------------------------

  // 반 등록창
  classopen() {
    this.class = true;                                          // 반 등록창 열기
  }
  classclose() {
    this.class = false;                                         // 반 등록창 닫기
  }

  // 교사 등록창
  teacheropen() {
    this.teacher = true;                                        // 교사 등록창 열기
  }
  teacherclose() {
    this.teacher = false;                                       // 교사 등록창 닫기
  }

  // nfc 등록창
  nfcopen() {
    this.nfc = true;                                            // NFC 등록창 열기
  }
  nfcclose() {
    this.nfc = false;                                           // NFC 등록창 닫기
  }

  // 어린이등록
  childopen() {
    this.child = true;                                          // 어린이 등록창 열기
  }

  childclose() {
    this.child = false;                                         // 어린이 등록창 닫기
    // 어린이 등록창 닫을때 초기화
    this.child_parent_data = {
      child_no : '',                                            // 어린이 번호 (DB기본키)
      child_nm : '',                                            // (필수) 어린이 이름
      birth : '',                                               // (필수) 어린이 생년월일(규격필수 ex.2015-11-11)
      birthDate: null,                                          // 어린이 생년월일(피커타입)
      cls_no : '',                                              // (필수) 반 번호
      rfid_no : '',                                             // 어린이 rfid
      parent_nm : '',                                           // (필수) 부모 이름
      parent_cp_no : '',                                        // (필수) 부모 휴대번호
      parent_user_no : '',                                      // 부모 (고유)번호
      use_yn : '1',                                             // 재원여부
      parent_login_accnt : '',                                  // 보호자 아이디(HTML용)
      rfid : ''                                                 // 태그RFID(HTML용)
    }
  }

  // 반 등록
  classpost() {
    this.attendProvider.childenroll.classpost({
    daycare_no : this.no.daycare_no,                            // (필수) 어린이집 번호
    cls_no : this.cls_no ? this.cls_no : undefined,             // (필수) 반 번호(있으면 update / 없으면 insert))
    cls_nm : this.cls_nm                                        // (필수) 반이름
    }).subscribe(_ => {
      alert('저장되었습니다.');
      this.ngOnInit();                                          // 회원리스트 갱신
      this.cls_nm = '';                                         // 반이름 초기화
    }, err => {
      alert('저장실패!');
    });
  }

  // 반 리스트에서 삭제
  classdelete(classdata) {
    this.attendProvider.childenroll.classdelete({
       cls_no : classdata.cls_no,
    }).subscribe(
      _ => {
        alert('삭제되었습니다.');
        this.ngOnInit();                                        // 회원리스트 갱신
      },
      err => {
        alert('삭제실패!');
      }
    );
  }

  // 교사 등록
  staffpost() {
    this.attendProvider.childenroll.staffpost({
    daycare_no : this.no.daycare_no,                           // (필수) 어린이집 번호
    staff_no: this.staff_no ? this.staff_no : undefined,       // (필수) 직원번호(staff_no 있으면 update, 없으면 insert)
    staff_user_no: this.staff_search_list.staff_user_no,       // 고유직원번호
    cls_no: this.class_cls_no,                                 // 반 번호
    }).subscribe(_ => {
      alert('저장되었습니다.');
      this.ngOnInit();                                         // 회원리스트 갱신
      this.staff_search_list.staff_user_nm = '';               // 교사이름초기화
      this.staff_search_list.staff_user_no = '';               // 교사번호초기화
      this.staff_search_list.staff_login_accnt = '';           // 교사아이디초기화
      this.staff_search_list.staff_cp_no = '';                 // 교사 핸드폰번호초기화
      this.class_cls_no = '';                                  // 교사 담당반초기화
    }, err => {
      alert('저장실패!');
    });
  }

  // 교사 리스트에서 삭제
  staffdelete(staffdata) {
    this.attendProvider.childenroll.staffdelete({
      staff_no : staffdata.staff_no,
    }).subscribe(
      _ => {
        alert('삭제되었습니다.');
        this.ngOnInit();                                       // 회원리스트 갱신
      },
      err => {
        alert('삭제실패!');
      }
    );
  }

  // NFC 등록
  rfidpost() {
    this.attendProvider.childenroll.rfidpost({
    daycare_no : this.no.daycare_no,                          // (필수) 어린이집 번호
    rfid_no : this.rfid_no ? this.rfid_no : undefined,        // (필수) 반 번호(있으면 update / 없으면 insert))
    rfid : this.rfid                                          // rfid
    }).subscribe(_ =>{
      alert('저장되었습니다.');
      this.ngOnInit();                                        // 회원리스트 갱신
      this.rfid = '';                                         // rfid(태그 ID) 초기화
    }, err=> {
      alert('저장실패!');
    });
  }

  // NFC 리스트에서 삭제
  nfcdelete(nfcdata) {
    this.attendProvider.childenroll.rfiddelete({
      rfid_no : nfcdata.rfid_no,
    }).subscribe(
      _ => {
        alert('삭제되었습니다.');
        this.ngOnInit();                                       // 회원리스트 갱신
      },
      err => {
        alert('삭제실패!');
      }
    );
  }

  // 어린이 리스트 페이징 부가처리
  getOrg() {
    this.filter();
  }


  // 어린이 리스트 페이징 부가처리
  filter() {
    this.paging(1);
  }

  // 어린이 리스트 페이징
  paging(page) {
    let pageIndex = page - 1;
    let queryString =`?daycare_no=${this.no.daycare_no}&pageNo=${pageIndex}&pageSize=${this.pageSize}`;

    // 반 이름검색
    if (this.class_cls_no) queryString += `&cls_no=${this.class_cls_no}` ;

    // 어린이 검색
    if (this.child_nm) queryString += `&search=${this.child_nm}` ;
    this.attendProvider.childenroll.chlidlistget(queryString).subscribe((data: any) => {
      this.total = data.total;
      this.totalPage = Math.ceil(this.total / this.pageSize);
      this.collectionSize = this.totalPage * 10;
      this.childdata = data.list;
      // this.childdata.birth = moment(this.childdata.birth).format('YYYY-MM-DD HH:mm:ss')
    });
  }

    // 어린이 등록
    childpost() {
      this.attendProvider.childenroll.childpost({
      daycare_no : this.no.daycare_no,                          // (필수)어린이집 번호
      ...this.child_parent_data
      }).subscribe(_ => {
        alert('저장되었습니다.');
        // 회원리스트 갱신
        this.ngOnInit();
        this.child_parent_data = {
          child_no : '',                                         // 어린이 번호 (DB기본키)
          child_nm : '',                                         // (필수) 어린이 이름
          birth : '', 
          birthDate: null,                                           // (필수) 어린이 생년월일(규격필수 ex.2015-11-11)
          cls_no : '',                                           // (필수) 반 번호
          rfid_no : '',                                          // 어린이 rfid
          parent_nm : '',                                        // (필수) 부모 이름
          parent_cp_no : '',                                     // (필수) 부모 휴대번호
          parent_user_no : '',                                   // 부모 (고유)번호
          use_yn : '1',                                          // 재원여부
          parent_login_accnt : '',                               // 보호자 아이디(HTML용)
          rfid : '',                                             // 태그RFID(HTML용)
        };
      }, err => {
        alert('저장실패!');
      });
    }

    // 어린이 등록 초기화
    childreset(){
      this.child_parent_data = {
        child_no : '',                                         // 어린이 번호 (DB기본키)
        child_nm : '',                                         // (필수) 어린이 이름
        birth : '',
        birthDate: null,                                             // (필수) 어린이 생년월일(규격필수 ex.2015-11-11)
        cls_no : '',                                           // (필수) 반 번호
        rfid_no : '',                                          // 어린이 rfid
        parent_nm : '',                                        // (필수) 부모 이름
        parent_cp_no : '',                                     // (필수) 부모 휴대번호
        parent_user_no : '',                                   // 부모 (고유)번호
        use_yn : '1',                                          // 재원여부
        parent_login_accnt : '',                               // 보호자 아이디(HTML용)
        rfid : ''                                             // 태그RFID(HTML용)
      }
    }

    // 어린이 리스트에서 삭제
    childdelete(childdata: any) {
      this.attendProvider.childenroll.childdelete({
        child_no : childdata.child_no,
      }).subscribe(
        _ => {
          alert('삭제되었습니다.');
          // 회원리스트 갱신
          this.ngOnInit();
          this.child_parent_data = {
            child_no : '',                                       // 어린이 번호 (DB기본키)
            child_nm : '',                                       // (필수) 어린이 이름
            birth : '',
            birthDate: null,                                           // (필수) 어린이 생년월일(규격필수 ex.2015-11-11)
            cls_no : '',                                         // (필수) 반 번호
            rfid_no : '',                                        // 어린이 rfid
            parent_nm : '',                                      // (필수) 부모 이름
            parent_cp_no : '',                                   // (필수) 부모 휴대번호
            parent_user_no : '',                                 // 부모 (고유)번호
            use_yn : '1',                                        // 재원여부
            parent_login_accnt : '',                             // 보호자 아이디(HTML용)
            rfid : '',                                           // 태그RFID(HTML용)
          };
        },
        err => {
          alert('삭제실패!');
        }
      );
    }

    // 어린이 수정
    child_parent_detail(one_data){
      this.child_parent_data.child_no = one_data.child_no;                                      // 어린이 번호 (DB기본키)
      this.child_parent_data.child_nm = one_data.child_nm;                                      // (필수) 어린이 이름
      this.child_parent_data.birth = one_data.birth;                                            // (필수) 생년월일
      this.child_parent_data.cls_no = one_data.cls_no;                                          // (필수) 반 번호
      this.child_parent_data.rfid_no = one_data.rfid_no,                                        // 어린이 rfid번호(구분용)
      this.child_parent_data.rfid = one_data.rfid,                                              // 어린이 태그ID(HTML용)
      this.child_parent_data.parent_nm = one_data.parent_nm;                                    // (필수) 부모 이름
      this.child_parent_data.parent_cp_no  = one_data.parent_cp_no;                             // (필수) 부모 휴대번호
      this.child_parent_data.parent_user_no = one_data.parent_user_no;                          // 부모 (고유)번호(구분용)
      this.child_parent_data.use_yn = one_data.use_yn;                                          // 재원여부
      this.child_parent_data.parent_login_accnt = one_data.parent_login_accnt;                  // 보호자 아이디(HTML용)
      this.child_parent_data.birthDate = this.ngbFormatter.parse(this.child_parent_data.birth); 
      // string타입(yyyy-mm-dd)에서 피커타입(year,month,day)로 바꾸는 구간 => 피커타입인데 string을 넣으면 매칭이안되서 HTML에서 출력이 안됨)
    }

    // 피커타입(year,month,day)에서 string타입(yyyy-mm-dd)로 바꾸는 구간 => DB에 string타입으로 바꿔줘야 들어감)
    onDateSelectionFrom(date: NgbDate) {
      this.child_parent_data.birth = this.ngbFormatter.format(date);
    }
   // 회원정보 끝-----------------------------------------------------------------------------

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
                // 행정동의 region_type 값은 'H' 이므로
                if (result[i].region_type === 'H') {
                  //$("#mapDong").val(result[i].region_3depth_name);
                  element.locationSelectItem.dongmyun = result[i].region_3depth_name;
                  break;
                }
              }
            }
          })

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
      this.childhome.addr = this.locationSelectItem.name;
    }

    // ...
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
      // console.log(element);
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

    // 모달창
    openModal(content, size = null, customClass= null) {
     this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', size: size, windowClass: customClass }).result.then((result) => {
        // console.log(`Closed with: ${result}`);
      }, (reason) => { });
    }
    // 지도 끝--------------------------------------------------------------------------
  // 검색 모달(공용 - 원장, 교사, 보호자)
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
  // 검색 모달(공용)
  findUser() {
    this.society.findUser({nmOrTel: this.search})
    .subscribe((list: any) => {
      this.search_List = list;
    });
  }

  // 운영자(원장) 찾기 모달
  ceo_search(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  //  운영자(원장) 데이터 넘기기
  ceo_search_data(item) {
    // console.log(item);
    this.childhome.ceo_nm = item.user_nm;                             // 원장 이름
    this.childhome.ceo_user_no = item.user_no;                        // 원장 (DB)번호
    this.childhome.ceo_cp_no = item.cp_no;                            // 원장 핸드폰번호
  }

  // 교사 찾기 모달
  staff_search(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  // 교사 데이터 넘기기
  staff_search_data(item) {
    this.staff_search_list.staff_user_nm = item.user_nm;              // 교사 이름
    this.staff_search_list.staff_user_no = item.user_no;              // 교사 (DB)번호
    this.staff_search_list.staff_login_accnt = item.login_accnt;      // 교사 아이디
    this.staff_search_list.staff_cp_no = item.cp_no;                  // 교사 핸드폰번호
  }

  // RFID 찾기 모달
  rfid_search(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  // RFID 검색창의 리스트
  rfid_search_data(item) {
    this.child_parent_data.rfid = item.rfid;
    this.child_parent_data.rfid_no = item.rfid_no;
  }

  // 보호자 찾기 모달
  parent_search(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  // 보호자 데이터 넘기기
  parent_search_data(item) {
    this.child_parent_data.parent_nm = item.user_nm;                   // 보호자 이름
    this.child_parent_data.parent_user_no = item.user_no;              // 보호자 (DB)번호
    this.child_parent_data.parent_login_accnt = item.login_accnt;      // 보호자 아이디
    this.child_parent_data.parent_cp_no = item.cp_no;                  // 보호자 핸드폰번호
  }
}
