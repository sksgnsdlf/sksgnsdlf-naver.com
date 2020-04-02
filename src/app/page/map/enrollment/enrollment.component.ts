import { Component, OnInit, ChangeDetectorRef, Renderer, ViewChild , ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { LoginSession } from '../../../services/login.session';
import { NgbModal, NgbModalRef , ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { MapProvider } from '../../../providers/map';
import { MaxPageSize } from '../../../../config';
import {Location} from '@angular/common';
import { ResourceService } from '../../../services/resource.service';
import { OneStopProvider } from '../../../providers/onestop';
import { UserProvider } from '../../../providers/user';
import { AttendProvider } from '../../../providers/attend';

declare let naver: any;
declare let daum: any;

@Component({
  selector: 'itsm-enrollment',
  templateUrl: './enrollment.component.html',
  styleUrls: ['./enrollment.component.scss']
})
export class EnrollmentComponent implements OnInit {
  @ViewChild("inputFile1") inputFile1: ElementRef;

  place : any = { };

  // 대분류
  // place_cls1 = -1; 

  // 대분류 값들 넣는곳
  bigdata:Array<any> = []; 

  // 대분류에 맞는 소분류값
  smallpart:any;

  // 소분류 선택, 리스트
  tempSelectedUserList1: Array<any> = [];
  selectedLinkList: Array<any> = [];

  // 소분류 모달
  tempIdx: number = 0;
  assign_popup_type: number = 0; 

  // 이미지
  picList: Array<any> = [];
  is_editable: boolean = true;
  selectedImg: string = "";

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

  // (지도)위도, 경도좌표
  // lat;
  // lon;
  // addr1;
  modal_lat;
  modal_lon;
  modal_address;
  container;
  // 지역리스트
  district_nm: Array<any> = [];         // 지역(HTML용)

  // 시간설정 라디오버튼 
  daycheck: boolean = false;

  // 소분류 삭제할 배열
  data : any = {
    cls_nm: "",
  }

  no : any = {
    place_no: ""
  }

  // // 운영시간 , 요일별설정 선택값
  // daytype: string = "1";

  // 페이징변수
  total: number = 0;
  totalPage:number = 0;
  page = 1;
  pageSize = 10;
  maxPage:number = MaxPageSize;
  collectionSize:number = 10;

  //
  
  total2: number = 0;
  totalPage2:number = 0;
  page2 = 1;
  pageSize2 = 10;
  maxPage2:number = MaxPageSize;
  collectionSize2:number = 10;

  total3: number = 0;
  totalPage3:number = 0;
  page3 = 1;
  pageSize3 = 10;
  maxPage3:number = MaxPageSize;
  collectionSize3:number = 10;

  // 리스트클릭변수 
  receipt_typ: string = "0";


  // 리뷰리스트
  reViewlist = [];

  // 오류신고리스트
  reErrorlist = [];

  // 불편신고리스트
  reInconlist = [];

  // 리스트3개클릭시 모달, 객체변수
  body: any = {};
  modal: NgbModalRef;

  // 리뷰, 오류신고, 불편신고 리스트내용 받을 값
  review_no ;
  place_no ;
  txt ;
  user_nm ;
  reg_dttm ;
  upd_dttm ;
  rate_score ;
  report_no;
  complaint_no;
  proc_state_nm;
  // org:number = 1;
  // ps = null;

  // No값해결하는 index
  index;


 
  monday: any = {
    place_time_list: [
      {
        day_cd: '1',
        day_nm : '월요일',
        open_time: '',
        close_time: '',
        day_off: '0',
      },
    ]
  };
  tuesday: any = {
    place_time_list: [
      {
        day_cd: '2',
        day_nm : '화요일',
        open_time: '',
        close_time: '',
        day_off: '0',
      },
    ]
  };
  wednesday: any = {
    place_time_list: [
      {
        day_cd: '3',
        day_nm : '수요일',
        open_time: '',
        close_time: '',
        day_off: '0',
      },
    ]
  };
  thursday: any = {
    place_time_list: [
      {
        day_cd: '4',
        day_nm : '목요일',
        open_time: '',
        close_time: '',
        day_off: '0',
      },
    ]
  };
  friday: any = {
    place_time_list: [
      {
        day_cd: '5',
        day_nm : '금요일',
        open_time: '',
        close_time: '',
        day_off: '0',
      },
    ]
  };
  saturday: any = {
    place_time_list: [
      {
        day_cd: '6',
        day_nm : '토요일',
        open_time: '',
        close_time: '',
        day_off: '1',
      },
    ]
  };
  sunday: any = {
    place_time_list: [
      {
        day_cd: '7',
        day_nm : '일요일',
        open_time: '',
        close_time: '',
        day_off: '1',
      },
    ]
  };
  holiday: any = {
    place_time_list: [
      {
        day_cd: '8',
        day_nm : '공휴일',
        open_time: '',
        close_time: '',
        day_off: '1',
      },
    ]
  };

  
  //조직도 관련
  orgs: any = [];
  org:number = 1;

  selectedPopupTab: number = 0; // 0:인명, 업무검색, 1:협력업체, 2:지정담당자, 3:조직도, 4:부서별
  reportData: any = {};
  cateUserList: Array<any> = [];
  selectedOrgId: number = 1;
  partner_nm: string = "";
  q;
  partnerUserList: Array<any> = [];
  orgUserList: Array<any> = [];
  orgDesignatedList: Array<any> = [];
  tempSelectedUserList3: Array<any> = [];
  orgList: Array<any> = [];

  // ---------------------------------------------------
  constructor(private mapprovider: MapProvider, private route: ActivatedRoute, private router: Router, public ref: ChangeDetectorRef,
    public loginSession: LoginSession,public renderer: Renderer, private modalService: NgbModal, private _location: Location, 
    private resourceService: ResourceService, private oneStop: OneStopProvider, private userProvider: UserProvider, private attendProvider: AttendProvider) { }

  ngOnInit() {
    // place에서 리스트 클릭시 번호체크 + 해당 데이터를 가져옴
    this.route.queryParams.subscribe(no=>{
      console.log("no=>"+ JSON.stringify(no));
    this.router.navigated = false;                      // ?
      // place_no이 없으면 장소등록창, 잇으면 장소수정창
      this.no.place_no = no.place_no;
      // ---------------------------------------------------------------------수정창 내용
      if(no.place_no){
        this.mapprovider.place.get(no.place_no)
        .subscribe((data:any)=>{
          // API전체값
          this.place = {...data};
          // DB의 대분류와 view에서 대분류 select비교용
          this.data = {...data};

          // 주소/위치 모달값 넘기기용(1회성)
          this.modal_address = this.place.addr1;
          this.modal_lat = this.place.lat;
          this.modal_lon = this.place.lon;

          // 이미지값 넘기기
          if(data.img_url){
          this.picList = [data.img_url];
          }

          // (수정할 때) 각 요일에 값이 없을때는 임의의값으로 덮어버림
          if(data.place_time_list[0] == undefined ){
            this.place.place_time_list[0] = this.monday.place_time_list[0];
          }
          if(data.place_time_list[1] == undefined ){
            this.place.place_time_list[1] = this.tuesday.place_time_list[0];
          }
          if(data.place_time_list[2] == undefined ){
            this.place.place_time_list[2] = this.wednesday.place_time_list[0];
          }
          if(data.place_time_list[3] == undefined ){
            this.place.place_time_list[3] = this.thursday.place_time_list[0];
          }
          if(data.place_time_list[4] == undefined ){
            this.place.place_time_list[4] = this.friday.place_time_list[0];
          }
          if(data.place_time_list[5] == undefined ){
            this.place.place_time_list[5] = this.saturday.place_time_list[0];
          }
          if(data.place_time_list[6] == undefined ){
            this.place.place_time_list[6] = this.sunday.place_time_list[0];
          }
          if(data.place_time_list[7] == undefined ){
            this.place.place_time_list[7] = this.holiday.place_time_list[0];
          }

          // 리뷰
          this.reView();

          // // 불편신고
          // this.reIncon();
          // // 오류신고
          // this.reError();
        });
      }
      // --------------------------------------------------------------------- 등록창 내용
      else
        {
          this.place = {
           place_cls : 1,                                                       // 대분류(1 -> 생활)
           theme_cls : 1,                                                       // 장소등록할땐 1 (테마-> 마커,선,면 은 2 )
           oper_state : '1',                                                    // 운영상태(1 -> 운영중)
           use_yn : '1',                                                        // 사용유무(1 -> 사용)
           place_cls_list : [],                                                 // 등록할때 소분류리스트를 초기화시켜야 선택이 가능함
           duty_user_list : [],                                                 // 등록할때 사용자리스트를 초기화시켜야 선택이 가능함
           place_time_list : [
             {
                day_cd: '1',
                day_nm : '월요일',
                open_time: '',
                close_time: '',
                day_off: '0',
              },
              {
                day_cd: '2',
                day_nm : '화요일',
                open_time: '',
                close_time: '',
                day_off: '0'
              },
              {
                day_cd: '3',
                day_nm : '수요일',
                open_time: '',
                close_time: '',
                day_off: '0',
              },
              {
                day_cd: '4',
                day_nm : '목요일',
                open_time: '',
                close_time: '',
                day_off: '0',
              },
              {
                day_cd: '5',
                day_nm : '금요일',
                open_time: '',
                close_time: '',
                day_off: '0',
              },
              {
                day_cd: '6',
                day_nm : '토요일',
                open_time: '',
                close_time: '',
                day_off: '1',
              },
              {
                day_cd: '7',
                day_nm : '일요일',
                open_time: '',
                close_time: '',
                day_off: '1',
              },
              {
                day_cd: '8',
                day_nm : '공휴일',
                open_time: '',
                close_time: '',
                day_off: '1',
              }
           ]
        };
      }
    });


    // 대분류
    this.bigPart();

    // 지도 변수
    this.ps = new daum.maps.services.Places();

    // 지역 데이터
    this.attendProvider.eventorg.eventget()
    .subscribe((element: any) => {
      // 행사지역
      this.district_nm = element.district;
    });
  }

  // place 삭제
  delete(){
    this.mapprovider.place.placedelete(this.no.place_no)
    .subscribe( _ => {
      // response값이 없음
    }, err => {
      var result = confirm("정말 삭제하시겠습니까?");
      if(result) { 
        alert('삭제가 되었습니다!');
        this.goback();
       }else {
          // 페이지 유지
        }
      }
    );
  }
  // 돌아기기(저장후 돌아가기)
  goback() {
    this.router.navigate(['map/place']); //,{ queryParams: {oper_state }}
    // history.back();
  }

  // place 저장
  save(){
    if (confirm(this.no.place_no ? "수정하시겠습니까?" : "추가하시겠습니까?")) {
      // form방식으로함
      let formData: FormData = new FormData();

      // 이미지 
      let img_urls: FileList = this.inputFile1.nativeElement.files;

      let postData = {
            ...this.place,
           };
           for(let key in postData){
            if(postData[key])
            {
              if(postData[key] instanceof Array)
              {
                formData.append(key,JSON.stringify(postData[key]));
              }
              else
                formData.append(key,postData[key]);
            }
          }

          // 이미지도 API에 삽입하는듯?
          if (img_urls.length > 0){
            // console.log('img');
            let img_url: File = img_urls[0];

            formData.append('file', img_url, img_url.name);
          }

          if((this.place.place_cls_list).length < 1 ){                      // 소분류가 1개이상일때만 저장가능
            alert("소분류 최소 1개를 선택해주세요.");
            return;
          }

          this.mapprovider.place.post(formData).subscribe(_ => {
              alert('저장되었습니다.');
              this.goback();
          }, err => {
            alert('저장실패!');
          });
        }
      }

  // 대분류 select
  bigPart() {
    this.bigdata = [];
    this.mapprovider.cls.getSearch(1)
    .subscribe((level1: any) => {
      this.mapprovider.cls.getSearch(2) 
      .subscribe((level2: any) => {
           let customlv1 = []; // api에있는 데이터를 담을 배열 93p에서 push하여 사용할예정
          level2.forEach(element => {
            customlv1.push({
              ...element,                                    // ...-> 객체 주소복사 / 그러니까 http://itsmpohang.hssa.me:9001/map/place_cls/all/2 에서
                                                            // 있는걸 전부다 가져옴 cls_cd, cls_nm, use_yn까지..)
              lvl: 2,                                        // 레벨2 즉, 두번째 서브메뉴
              sub: []
            });
            if (element.upper_cd = "1") {
            }
          });


          level1.forEach(element => {
            let item = {
               ...element,
              lvl: 1,
              sub:[],
              lv2:  customlv1.filter(lv2 => {
                return lv2.upper_cd == element.cls_cd;
              })
            }
            this.bigdata.push(item);
          });
         });
    });
  }

    // 대분류선택시 소분류를 비우거나 기존 대분류 DB값이 일치할때는 유지
    bigCate() {
      if(this.place.place_cls != this.data.place_cls){
        this.place.place_cls_list= [];
      } else if (this.place.place_cls == this.data.place_cls) {
        this.place.place_cls_list = this.data.place_cls_list;
      }
    }

  // 소분류 모달창
    openAsgnPopup2(content, i, type) {
      this.tempIdx = i;
      this.assign_popup_type = type;

      this.mapprovider.cls.getSearch(2, this.place.place_cls).subscribe(lv2 => {
        this.smallpart = lv2;
        this.openModal(content, null, 'customModal');
      });
    }


  // 소분류 모달창 + 지도 모달창
    openModal(content, size = null, customClass=null){
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', size:size, windowClass:customClass }).result.then((result) => {
      }, (reason) => { });
    }

  // 체크박스
  userSelectChanged(ev, item) {

    var index = this.tempSelectedUserList1.findIndex(element => {
      return (element.cls_cd == item.cls_cd && element.cls_nm == item.cls_nm);
    });

    if(ev.target.checked) {
      if(index < 0) {
        this.tempSelectedUserList1.push(item);
      }
    }
    else {
      if(index > -1) {
        this.tempSelectedUserList1.splice(index, 1);
      }
    }
  }

  //  선택
  selectTempUsers() {
    if(this.tempSelectedUserList1.length == 0) {
      alert('선택된 담당자가 없습니다.');
      return ;
      }

      this.tempSelectedUserList1.forEach(element => {
        this.addRow(element);
      });

      this.tempSelectedUserList1 = [];
      this.modalService.dismissAll();
  }

  // 소분류 - 선택된 내용들
  addRow(user) {
    var item = {
      ...user
  };

  // 소분류 - 중복값 확인여부
  var index = this.place.place_cls_list.findIndex(element => {
    return (element.cls_nm == user.cls_nm && element.cls_cd == user.cls_cd);
  });

  if(index > -1 ){
    alert(user.cls_nm + ' 은(는) 이미 추가된 항목입니다.');
    return;
  }
  this.place.place_cls_list.unshift(item);
  }

  // 소분류 삭제
  deleteRow(i, item) {
    this.place.place_cls_list.splice(i, 1);

    // 서버에서 삭제
    let small: any = {
      place_no: this.no.place_no,               // 해당 게시글번호
      cls_cd: item.cls_cd,                   // 삭제한 소분류번호
    };

    this.mapprovider.place.small_delete(small).subscribe((data: any) => {
      // 삭제완료
    });
  }

  // 담당자 모달
  opendutyPopup(content, i, type) {
    this.tempIdx = i;
    this.assign_popup_type = type;
    this.resourceService.getOrg(4)
      .then((_: any) => this.orgs = _);
    this.org = this.loginSession.checkAdminAndGetOrg() == -1 ? 1 : this.loginSession.checkAdminAndGetOrg();
    // this.setOrg(this.org);
    this.openModal2(content, null, 'dutyModal');
    this.changePopupTab(0);
  }

  openModal2(content, size = null, customClass=null){
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', size:size, windowClass:customClass }).result.then((result) => {
    }, (reason) => { });
  }


  changePopupTab(idx) {
    this.selectedPopupTab = idx;
  }

  getCateUser() {
    this.oneStop.category.getUser(this.reportData.cls_no)
    .subscribe(
      (data: any) => {
        this.cateUserList = data;
      }
    );
  }

  getOrgUser(selectedPopupTab = this.selectedPopupTab) {
    if (selectedPopupTab == 0) {
      if (this.selectedOrgId == -1) {
        alert('기관을 선택해주세요.');
        return;
      }
    }
    this.userProvider.getAll(selectedPopupTab, this.selectedOrgId, this.q, null, this.partner_nm)
    .subscribe(
      (data: any) => {
        if (selectedPopupTab == 0) {                               // 인명,업무검색
          this.orgUserList = data;
        } else if (selectedPopupTab == 1) {                        // 협력업체
          this.partnerUserList = data;
        }
      }
    );
  }

  selectduty() {
    if(this.tempSelectedUserList3.length == 0) {
      alert('선택된 담당자가 없습니다.');
      return ;
    }
    this.tempSelectedUserList3.forEach(element => {
      this.dutyaddRow(element);
    });

    this.tempSelectedUserList3 = [];
    this.modalService.dismissAll();
  }

  dutySelectChanged(ev, item) {
    var index = this.tempSelectedUserList3.findIndex(element => {
      // console.log( element);
      // console.log( item);
      return (element.user_typ == item.user_typ && element.user_no == item.user_no) || (element.user_nm == item.user_nm && element.cp_no == item.cp_no);
    });

    if(ev.target.checked) {
      if(index < 0) {
        this.tempSelectedUserList3.push(item);
      }
    }
    else {
      if(index > -1) {
        this.tempSelectedUserList3.splice(index, 1);
      }
    }
  }

  // 담당자리스트 실질적으로 추가
  dutyaddRow(user) {
    var item = {
      user_role: user.user_typ == 3 ? 3 : 2,                         // 3은 인명,업무검색(공무원), 2는 협력업체 
      duty_user_no: user.staff_no ? user.staff_no : user.user_no,    // 협력업체(staff_no)가 아니면 user_no를 사용
      user_nm: user.user_nm,
      cp_no: user.cp_no,
      dept : user.full_dept_nm ? user.full_dept_nm : user.dept_nm
    };

    var index = this.place.duty_user_list.findIndex(element => {
      return (element.user_nm == user.user_nm && element.cp_no == user.cp_no);
    });

    if(index > -1 ){
      alert(user.user_nm + '님은 이미 추가된 사람입니다.');
      return;
    }
    this.place.duty_user_list.unshift(item);
  }

  // 담당자리스트 삭제
  dutydeleteRow(i, item) {
    // HTML에서 삭제
    this.place.duty_user_list.splice(i, 1);

    // 서버에서 삭제
    let user: any = {
      place_no: this.no.place_no,               // 해당 게시글번호
      user_role: item.user_role,                // 삭제한 담당자분류(공무원,협력업체)
      duty_user_no: item.duty_user_no,          // 삭제한 담당자번호
    };

    this.mapprovider.place.duty_delete(user).subscribe((data: any) => { 
      // 삭제완료
    });
  }
  // 이미지 추가
  openFile() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var trident = ua.indexOf('Trident/');
    if (msie > 0 || trident > 0) {
        this.inputFile1.nativeElement.click();
    }
    else {
      let event = new MouseEvent('click', { bubbles: true });
      this.renderer.invokeElementMethod(this.inputFile1.nativeElement, 'dispatchEvent', [event]);
    }
  }

  // 이미지 삭제
  deleteFile(index){
    this.picList.splice(index, 1);
    this.place.img_url = '';          // 이렇게해야 DB에 이미지랑 썸네일이 안넘어감
    this.place.thumb_url = '';
  }

  // 이미지
  checkFileType($event) {
    let files: FileList = $event.target.files;
    if (files.length > 0) {
      let file: File = files[0];
      if (!file.type.includes('image/')) {
        alert('이미지만 업로드 가능합니다.');
        $event.target.value = '';
      }
      else {
        var fr = new FileReader();
        fr.onload = () => {
          if(this.picList.length < 1)
            this.picList.push(fr.result);
        }
        fr.readAsDataURL(files[0]);
      }
    }
  }

  // 주소/위치 검색
  openMap(content) {
    this.openModal(content, 'lg');
    this.search_map = this.locationSelectItem.name;
    var element = this;
    if(this.place.lat){                                                        // 기존에 좌표가 있으면 그 좌표로 세팅함
      var location: any = new daum.maps.LatLng(this.place.lat, this.place.lon);
  
      setTimeout(() => {
        this.container = document.getElementById('map');
        this.map = new daum.maps.Map(this.container, this.mapOptions);
        this.marker = new daum.maps.Marker({
          position: location,
          map: this.map
        });
  
        if (this.locationSelectItem.position.latitude && this.locationSelectItem.position.longitude) {
          this.location = new daum.maps.LatLng(this.locationSelectItem.position.latitude, this.locationSelectItem.position.longitude);
          this.searchCoordinateToAddress(this.location, element);
        }
        this.map.setCenter(location);       // 여기서 해당 위치로 이동시킴
        this.map.setLevel(3);
        daum.maps.event.addListener(this.map, 'click', (e) => {
          this.searchCoordinateToAddress(e.latLng, element);      
        });
      }, 0);
  } else {                                                                    // 기존좌표가 없으면 포항시청으로 세팅         
      setTimeout(() => {
      this.container = document.getElementById('map');
      this.map = new daum.maps.Map(this.container, this.mapOptions);
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
}

  // 주소/위치 연결메소드
  searchCoordinateToAddress(latlng, element) {
    element.searchDetailAddrFromCoords(latlng, function (result, status) {
      console.log("latlng=>" + latlng)

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
    })
  }

  searchAddrFromCoords(coords, callback) {
    // 좌표로 행정동 주소 정보를 요청합니다
    this.geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);

    // 주소/위치, 위도, 경도 값 넘기기
    this.modal_lat = coords.getLat();
    this.modal_lon = coords.getLng(); 
    this.modal_address = this.locationSelectItem.name;
    // this.place.lat = coords.getLat();                                           // 위도
    // this.place.lon = coords.getLng();                                           // 경도
    // this.place.addr1 = this.locationSelectItem.name;                            // 지도의 주소

    var abc :string = this.locationSelectItem.dongmyun;                         // 지도의 동, 읍, 면 string화
    var dong_name = abc.split(' ');                                             // 지도의 동, 읍, 면에서 첫번째 글자를 골라야함(흥해읍 학천리에서 흥해읍)
    this.mapprovider.place.get_dong(dong_name[0])                               // 좌표의 동, 읍, 면
      .subscribe((element:any) => {
        this.place.district_cd = element.district_cd;
      });
  }

  searchDetailAddrFromCoords(coords, callback) {
    // 좌표로 법정동 상세 주소 정보를 요청합니다
    this.geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
  }

  // 주소/위치 모달
  searchAddressToCoordinateInput(){
    var element = this;
    this.searchAddressToCoordinate(this.modal_address, element);
   }

   // 주소/위치 모달 연결메소드
   searchAddressToCoordinate(address, element) {
    //element.geocoder.addressSearch(address, function(result, status) {
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

  lat_lon_change_map_move(){
    // 위/경도 수정시 주소값 수정시키기
    var element = this;
    var e = new daum.maps.LatLng(this.modal_lat, this.modal_lon);
    this.searchCoordinateToAddress(e, element);      
    this.marker.setMap(null); // 기존에 있던 마커는지도에서 제거한다

    // 위/경도 수정시 마커,지도 위치 이동
    var location: any = new daum.maps.LatLng(this.modal_lat, this.modal_lon);
      this.marker = new daum.maps.Marker({
        position: location,
        map: this.map
      });
    // 위/경도 수정한 좌표를 기점으로 화면위치이동
    this.map.panTo(location);
  }

  choose() {
        // 주소/위치, 위도, 경도 값 넘기기
        this.place.lat = this.modal_lat;                                           // 위도
        this.place.lon = this.modal_lon;                                           // 경도
        this.place.addr1 = this.modal_address;                                     // 지도의 주소
  }
  // 리뷰,신고, 데이터 등----------------------------------------------------------------------

  // 리뷰 페이징
  reView() {
    this.paging(1);
  }

  // 페이징 부가처리
  getOrg() {
    this.reView();
  }

  paging(page) {
    let pageIndex = page - 1;

    // pageNo(pageIndex) -> 현재 페이지값 / pageSize(this.pageSize) -> 전체페이지값(10)
    let queryString = `${this.place.place_no}?pageNo=${pageIndex}&pageSize=${this.pageSize}`;   
    // queryString +=  this.role ?  `&oper_state=${this.role}`: '&oper_state=1';

      this.mapprovider.place.getReViewlist(queryString)
      .subscribe((element:any) => {
        // total값
        this.total = element.total;
        this.totalPage = Math.ceil(this.total/this.pageSize);
        this.collectionSize = this.totalPage * 10;

        // 배열방식으로 되어있는 data값을 list에 다 넣어줌
        this.reViewlist = element.data;

        // 리뷰사용시 - 오류신고 기본값으로 초기화
        this.total2 = 0;
        this.totalPage2 = 0;
        this.page2 = 1;
        this.pageSize2 = 10;
        this.maxPage2 = MaxPageSize;
        this.collectionSize2 = 10;

        // 리뷰사용시 - 불편신고 기본값으로 초기화
        this.total3 = 0;
        this.totalPage3 = 0;
        this.page3 = 1;
        this.pageSize3 = 10;
        this.maxPage3 = MaxPageSize;
        this.collectionSize3 = 10;


        // (공통으로 사용되는) No값초기화(안하면 No값이 역으로 뒤집힌다.)
        this.reErrorlist = [];
        this.reInconlist= [];
      });
    }

    // 오류신고 페이징
  reError() {
    this.paging2(1);
  }

  paging2(page2) {
    let pageIndex2 = page2 - 1;

    // pageNo(pageIndex) -> 현재 페이지값 / pageSize(this.pageSize) -> 전체페이지값(10)
    let queryString2 = `${this.place.place_no}?pageNo=${pageIndex2}&pageSize=${this.pageSize2}`;   
    // queryString +=  this.role ?  `&oper_state=${this.role}`: '&oper_state=1';

      this.mapprovider.place.geterrorlist(queryString2)
      .subscribe((element:any) => {
        // total값
        this.total2 = element.total;
        this.totalPage2 = Math.ceil(this.total2/this.pageSize2);
        this.collectionSize2 = this.totalPage2 * 10;

        // 배열방식으로 되어있는 data값을 list에 다 넣어줌
        this.reErrorlist = element.data;

        // 오류신고사용시 - 리뷰 기본값으로 초기화
        this.total = 0;
        this.totalPage = 0;
        this.page = 1;
        this.pageSize = 10;
        this.maxPage = MaxPageSize;
        this.collectionSize = 10;

        // 오류신고사용시 - 불편신고 기본값으로 초기화
        this.total3 = 0;
        this.totalPage3 = 0;
        this.page3 = 1;
        this.pageSize3 = 10;
        this.maxPage3 = MaxPageSize;
        this.collectionSize3 = 10;
        
        // (공통으로 사용되는) No값초기화(안하면 No값이 역으로 뒤집힌다.)
        this.reViewlist = [];
        this.reInconlist = [];
      });
    }

  // 오류신고 페이징
  reIncon() {
    this.paging3(1);
  }

  paging3(page3) {
    let pageIndex = page3 - 1;

    // pageNo(pageIndex) -> 현재 페이지값 / pageSize(this.pageSize) -> 전체페이지값(10)
    let queryString = `${this.place.place_no}?pageNo=${pageIndex}&pageSize=${this.pageSize3}`;   
    // queryString +=  this.role ?  `&oper_state=${this.role}`: '&oper_state=1';

      this.mapprovider.place.getinconlist(queryString)
      .subscribe((element:any) => {
        // total값
        this.total3 = element.total;
        this.totalPage3 = Math.ceil(this.total3/this.pageSize3);
        this.collectionSize3 = this.totalPage3 * 10;

        // 배열방식으로 되어있는 data값을 list에 다 넣어줌
        this.reInconlist = element.data;

        // 불편신고사용시 - 리뷰 기본값으로 초기화
        this.total = 0;
        this.totalPage = 0;
        this.page = 1;
        this.pageSize = 10;
        this.maxPage = MaxPageSize;
        this.collectionSize = 10;

        // 불편신고사용시 - 오류신고 기본값으로 초기화
        this.total2 = 0;
        this.totalPage2 = 0;
        this.page2 = 1;
        this.pageSize2 = 10;
        this.maxPage2 = MaxPageSize;
        this.collectionSize2 = 10;

        // (공통으로 사용되는) No값초기화(안하면 No값이 역으로 뒤집힌다.)
        this.reViewlist = [];
        this.reErrorlist = [];
      });
    }


  // 리뷰, 오류신고, 불편신고 클릭시 상세정보
    select(item) {
      // 리뷰번호
      this.review_no = item.review_no;
      // 게시글번호
      this.place_no = item.place_no;
      // 내용
      this.txt = item.txt;
      // 작성자
      this.user_nm = item.user_nm;
      // 평점
      this.rate_score = item.rate_score;
      // 등록일자
      this.reg_dttm = item.reg_dttm;
      // 수정일자
      this.upd_dttm = item.upd_dttm;
      // 오류신고번호
      this.report_no = item.report_no;
      // 불편신고번호
      this.complaint_no = item.complaint_no;
      // 모르는데 일단 가져옴(불편신고값)
      this.proc_state_nm = item.proc_state_nm;

      // console.log("item = > " + JSON.stringify(item))
    }

    open(content , index) {
      // 페이지 No번호 맞추는 index값(html에서 index값 가져옴)
      this.index = index ;
      this.modal = this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', size: 'lg'});
    }

// -------------------------------------------------------------------------------------------------

}


