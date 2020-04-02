import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MapProvider } from '../../../providers/map';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


declare let daum: any;

@Component({
  selector: 'itsm-reportbroken',
  templateUrl: './reportbroken.component.html',
  styleUrls: ['./reportbroken.component.scss']
})
export class ReportbrokenComponent implements OnInit {

 
  report_no = '';                      // 수정할때 보여줄 값

  report_data = {                      // 오류신고 데이터
    proc_txt : undefined
  };
  reg_dttm = '';
  user_nm = '';
  cp_no = '';
  login_accnt = '';
  txt = '';
  place_nm = '';
  addr = '';
  place_cls_nm = '';
  lat = '';
  lon = '';

  report_data_lat = '';                // 오류신고 데이터 위도
  report_data_lon = '';                // 오류신고 데이터 경도
  report_data_proc_txt = '';           // 오류신고 처리내용
  report_data_proc_user_no = '';       // 오류신고 담당자 번호
  // 지도
  mapOptions: any = {
    level: 3,
    center: new daum.maps.LatLng(36.0190238, 129.3433917)
  };
  marker: any = {};
  search_map: string = "";
  locationSelectItem: any = { position: {}, name: '', dongmyun: '' };
  location: any = new daum.maps.LatLng(36.0190238, 129.3433917);
  infoWindow: any = new daum.maps.InfoWindow({
    zindex:1
  });
  map: any = {};
  geocoder = new daum.maps.services.Geocoder();
  ps = null;

  constructor(private route: ActivatedRoute, private mapprovider: MapProvider, private modalService: NgbModal, private router: Router) { }

  ngOnInit() {
    this.route.queryParams.subscribe(no => {
    this.report_no = no.report_no;
    // 수정 할때
    if(no.report_no) {
    this.mapprovider.reportbroken.getdetaillist(no.report_no)
    .subscribe((data:any)=>{
      this.report_data = data;
      this.report_data_lat = data.lat;
      this.report_data_lon = data.lon;
      this.report_data_proc_user_no = data.proc_user_no;
      this.reg_dttm = data.reg_dttm;
      this.user_nm = data.user_nm
      this.cp_no = data.cp_no
      this.login_accnt = data.login_accnt
      this.txt = data.txt
      this.place_nm = data.place_nm
      this.addr = data.addr
      this.place_cls_nm = data.place_cls_nm,
      this.lat = data.lat
      this.lon = data.lon
    });

    } else {
    // 등록 할때
      }});
  }

  // 돌아기기
  goback() {
    this.router.navigate(['map/reportmanage'])
  }

  save() {
    this.mapprovider.reportbroken.post({
      report_no : this.report_no,                  // 신고번호
      state : '2',                                 // 현재 오류신고 처리상태
      proc_txt: this.report_data.proc_txt,         // 처리내용
      proc_user_no: this.report_data_proc_user_no, // 작업자 user_no, (default 로그인 사용자 user_no
    }).subscribe(
      _ => {
        // response 없음
      },
      err => {
        alert('저장되었습니다.');
        this.saveback();
      }
    );
  }

  // 저장후 관리페이지로 이동
  saveback() {
    this.router.navigate(['map/reportmanage']);
  }

  // 모달창
  openModal(content, size = null, customClass=null){
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', size:size, windowClass:customClass }).result.then((result) => {
      // console.log(`Closed with: ${result}`);
    }, (reason) => {
      // pass
    });
  }

  // 주소/위치 검색
  openMap(content) {
    this.openModal(content, 'lg');
    this.search_map = this.locationSelectItem.name;
    var element = this;
    
    // 관련 주소의 위치로 세팅해줌
    var location: any = new daum.maps.LatLng(this.lat, this.lon);

    setTimeout(() => {
      var container = document.getElementById('map');
      this.map = new daum.maps.Map(container, this.mapOptions);
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
    })
  }

  searchAddrFromCoords(coords, callback) {
    // 좌표로 행정동 주소 정보를 요청합니다
    this.geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);

    // 주소/위치, 위도, 경도 값 넘기기
    // this.place.addr1 = this.locationSelectItem.name;
    // console.log("this.place.addr1 =>" +this.place.addr1)
    // console.log("this.place.lat =>" +this.place.lat)
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
}

