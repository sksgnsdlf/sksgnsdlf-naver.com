import { Component, ElementRef, OnInit, ViewChild, TemplateRef, Renderer } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MapProvider } from '../../../providers/map';
import { NgbModal, NgbModalRef , ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
declare let kakao: any;

@Component({
  selector: 'itsm-theme-edit',
  templateUrl: './theme-edit.component.html',
  styleUrls: ['./theme-edit.component.scss']
})
export class ThemeEditComponent implements OnInit {
  // 테마이미지
  @ViewChild('inputFile1') inputFile1: ElementRef;
  @ViewChild('inputFile2') inputFile2: ElementRef;

  // 마커이미지
  @ViewChild("inputFile3") inputFile3: ElementRef;
  @ViewChild("inputFile4") inputFile4: ElementRef;
  @ViewChild('menu_marker_line_gon_gpx_image') menu_marker_line_gon_gpx_image: ElementRef;

  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  // theme에서 no값 넘기기용
  map_no;

  // API 전체 데이터값
  theme: any = {};

  // theme_list(테마내용들) 데이터값
  place_list: any = [
    {
      lat: '',
      lon: '',
      place_disp: ''
    }
  ];

  // 테마코드
  themecode: Array<any> = [];
  // 테마구분
  cls_cd = -1;

  // 이미지
  picList: Array<any> = [];
  picList2: Array<any> = [];
  is_editable = true;
  // 이미지 확대용
  selectedImg = '';

  // No값 구하는 변수
  total = 0;
  totalPage = 0;
  page = 1;
  pageSize = 10;
  collectionSize = 10;

  mapopen: boolean = true;      // 테마등록후 장소편집 open
  mapclose: boolean = false;    // 테마등록후 장소편집 open


  // ----------------------------------------------지도 관련 변수
  bounds = new kakao.maps.LatLngBounds();
  // (공통-> 추가+수정)
  map;                                            // (공통) 지도 변수
  ps;                                             // (공통) 검색값받기위한 변수
  markers: any = [];                              // (공통) 점(마커)배열 변수
  manager;                                        // (공통) toolbox박스 생성
  overlayMaps = new Map<string, any>();           // (공통) 점,선,면 좌표(오버레이삭제용))
  titleoverlayMaps = new Map<string, any>();           // (공통) 점,선,면 좌표(오버레이삭제용))
  postData;                                       // (공통) DB에 넣은 객체
  markerindex = 0;                                // (공통) 마커인덱스(아이디)
  lineindex = 0;                                  // (공통) 선인덱스(아이디)
  gonindex = 0;                                   // (공통) 다각형인덱스(아이디)
  gpxindex = 0;                                   // (공통) gpx인덱스(아이디)
  drawlist = new Map<string, any>();              // (공통)좌표 ...
  geocoder = new kakao.maps.services.Geocoder();  // (공통)좌표에 대한 실제주소값(DB)

  mapdata;                                        // (추가?) place_no 변수

  searchdata = [];                                // (지도-검색기능) 변수
  search_check: boolean = false;
  places_List: boolean = true;
  sort_List: boolean = false;
  // toolbox에서 사용할 인덱스값

  past_itemid;   // 저장후 오버레이 숨김용 변수
  add_itemid
  id;

  imageSrc = '';                        // 마커이미지
  datascribe; // (추가)테마지도 scribe용 변수
  datascribe2; // (기존)테마지도 scribe용 변수
  place_nm = ''; // 장소명
  Ga = ''; // 경도
  txt = ''; // 내용
  Ha = ''; // 위도
  tooltype; // toolbox에서 type체크 변수
  selectMarker; // 점(마커) ~ gpx 재클릭시 담을 변수


  tilteOverlay

  // test 중
  menu_open: boolean = false;                    // 마커,선,면,gpx 메뉴닫기

  new_item: PlaceInfo;
  edit_item: PlaceInfo;
  place;                                          // 수정할때 해당 ID에 관한 데이터를 담음
  marker_line_gon_gpx_place;
  points = [];

  map_color;

  
  image3: string | ArrayBuffer = '';
  image4: string | ArrayBuffer = '';

  nowThemeindex;

  // 리스트 사용여부(1-> 사용중 / 0->미사용중)
  list_use_yn = 1;

  // 모달 변수
  tempIdx: number = 0;
  assign_popup_type: number = 0;
  constructor(private route: ActivatedRoute, private router: Router, private mapprovider: MapProvider, private modalService: NgbModal,
    public renderer: Renderer, ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(no => {
      this.map_no = no.map_no;
      this.getPlaceList();
    });
  }

  getPlaceList() {


    // use_yn이 1일땐 사용중인거만 / 0일땐 미사용중인거만 사용하는 변수
    // theme페이지에서 리스트 클릭시 해당 번호를 가져옴
    this.mapprovider.theme.getdetaillist(this.map_no + '?use_yn=' + this.list_use_yn).subscribe((data: any) => {
      // 리스트가 없을땐
      if (this.drawlist) {
        for (const placeinfo of Array.from(this.drawlist.values())) {
          // 마커삭제
          placeinfo.map_item.setMap(null);
        }
        for (var over of Array.from(this.overlayMaps.values())){
          // 오버레이 삭제
          over.setMap(null);
        }
      }

      // API전체값
      this.theme = { ...data };

      this.place_list = [];
      data.place_list.forEach(element => {
        const placeinfo = new PlaceInfo();
        placeinfo.place_disp = element.place_disp ? element.place_disp : element.place_nm;
        placeinfo.txt = element.txt;
        placeinfo.figure_color = element.type =='marker' ? null : element.figure_color ? element.figure_color : "#3399FF";
        placeinfo.img_url = element.img_url;
        placeinfo.thumb_url = element.thumb_url;
        placeinfo.lat = element.lat;
        placeinfo.lon = element.lon;
        placeinfo.points = element.points;
        placeinfo.address = element.addr1;
        placeinfo.type = placeinfo.placeTypeToString(element.place_figure);
        placeinfo.place_no = element.place_no;
        placeinfo.gpx = element.gpx;
        placeinfo.use_yn = element.use_yn;
        placeinfo.marker_img3 = element.marker_img3;
        placeinfo.marker_img4 = element.marker_img4;
        this.place_list.push(placeinfo);
      });

      // (테마리스트) DB안에 있는 이미지값 넘겨서 picList에 넘겨줌(html에서 [src]부분)
      if (data.img_url) {
        this.picList = [data.img_url];
      }
      this.openMap();
    });
  }

  // 뒤로 돌아가기
  back_themeeenrollment(map_no) {
    this.router.navigate(['map/themeenrollment'], { queryParams: { map_no } });
  }

  // HTML-----------------------------------------------------------------------------------------------------------------
  // (HTML) 마커, 선, 면 추가하기
  selectOverlay(type) {
    // 마커,선,다각형 사용중일때 gpx버튼 클릭하면 마커,선,다각형 사용을 취소합니다.
    this.manager.cancel();

    this.manager.select(kakao.maps.drawing.OverlayType[type]);
  }

  // (HTML)(지도) 검색후 리스트 클릭시 좌표이동
  mapMove(item) {
    // console.log(JSON.stringify(item));
    if (item.lat) {
      this.map.panTo(new kakao.maps.LatLng(item.lat, item.lon));
    } else {
      this.map.panTo(new kakao.maps.LatLng(item.y, item.x));
    }
  }

  // (HTML)(지도)검색기능
  searchPlaces() {
    var keyword = (<HTMLInputElement>document.getElementById('keyword')).value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
      alert('키워드를 입력해주세요!');
      return false;
    }

    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    var self = this;
    this.ps.keywordSearch(keyword, function (data, status) {
      if (status === kakao.maps.services.Status.OK) {
        // 정상적으로 검색이 완료됐으면 검색 목록과 마커를 표출합니다
        self.searchdata = data;
        self.search_check = true;
        self.places_List = false;
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
        return;
      } else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.');
        return;
      }
    });
  }

  // (HTML) 검색리스트 클릭시 리스트전환 + 검색어 초기화
  search_place_chance() {
    this.search_check = false;
    this.places_List = true;
    (<HTMLInputElement>document.getElementById('keyword')).value = '';
  }

  // (HTML) 테마 리스트 클릭시 좌표이동
  mapMove_overlay(item) {
    // 좌표이동
    if (item.lat) {
      this.map.panTo(new kakao.maps.LatLng(item.lat, item.lon));
    } else {
      this.map.panTo(new kakao.maps.LatLng(item.y, item.x));
    }
    var self = this;
    this.createsimpleView(item, self);
  }

  // (HTML) 디테일모달
  themeDetailOpen(content) {
    this.openModal(content, null, 'select_Modal');
  }

  // (HTML) 디테일모달
  openModal(content, size = null, customClass = null) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: size, windowClass: customClass }).result.then(
      result => {
        // console.log(`Closed with: ${result}`);
      },
      reason => {
      }
    );
  }

  // (HTML) 지도 기능
  openMap() {
    if (this.drawlist)
      this.drawlist.clear();

    var self = this;

    // 검색값받기위한 변수
    this.ps = new kakao.maps.services.Places();

    var mapOptions: any = {
      center: new kakao.maps.LatLng(36.0190238, 129.3433917),
      // 리스트 클릭(리스트에 좌표가있음)이 없을땐 포항시청        //좌표가 있을땐 해당 좌표
      // center: selectmap == undefined ? new kakao.maps.LatLng(36.0190238, 129.3433917) : new kakao.maps.LatLng(selectmap.lat, selectmap.lon),
      level: 5
    };

    var container = document.getElementById('theme_map');
    if (!this.map)
      this.map = new kakao.maps.Map(container, mapOptions);

    // 마커가 1개이상 있을때는 마커에 맞게 지도비율조정
    if (this.place_list.length > 0) {
      var points = [];
      for (var i = 0; i < (this.place_list).length; i++) {
        points.push(new kakao.maps.LatLng(this.place_list[i].lat, this.place_list[i].lon));
        this.bounds.extend(points[i]);
      }
      this.map.setBounds(this.bounds);
    } else { }

    // 기존에 데이터가있으면 마커, 선, 면, gpx를 지도에 띄워줌  => exist_Marker 함수
    for (let i = 0; i < this.place_list.length; i++) {
      if (this.place_list[i].type.includes("marker")) {
        // 점(1) 출력         //DB에 있는 좌표값          // 게시글전체데이터
        self.exist_Marker(self, this.place_list[i]);
      }
      else if (this.place_list[i].type.includes("polyline")) {
        // 선(2)
        self.exist_line(self, this.place_list[i]);
      } else if (this.place_list[i].type.includes("polygon")) {
        // 면(3)
        self.exist_Gon(self, this.place_list[i]);
      } // gpx(4)
      else if (this.place_list[i].type.includes("gpx")) {
        self.exist_gpx(self, this.place_list[i]);
      }
    }

    // 도형 스타일을 변수로 설정합니다 (Toolbox)
    var strokeColor = "#3399FF",
      fillColor = '#cce6ff',
      fillOpacity = 0.5,
      hintStrokeStyle = 'dash';

    var options = {
      // Drawing Manager를 생성할 때 사용할 옵션입니다
      map: this.map, // Drawing Manager로 그리기 요소를 그릴 map 객체입니다
      drawingMode: [kakao.maps.Drawing.OverlayType.MARKER, kakao.maps.Drawing.OverlayType.POLYLINE, kakao.maps.Drawing.OverlayType.POLYGON], //
      // 사용자에게 제공할 그리기 가이드 툴팁입니다
      // 사용자에게 도형을 그릴때, 드래그할때, 수정할때 가이드 툴팁을 표시하도록 설정합니다
      guideTooltip: ['draw', 'drag', 'edit'],
      markerOptions: {
        draggable: false,
        removable: false,
        editable: true,
      },
      polylineOptions: {
        draggable: false,
        removable: false,
        strokeColor: strokeColor,
        hintStrokeStyle: hintStrokeStyle
      },
      polygonOptions: {
        draggable: false,
        removable: false,
        strokeColor: strokeColor,
        fillColor: fillColor,
        fillOpacity: fillOpacity
      }
    };

    // 위에 작성한 옵션으로 Drawing Manager를 생성합니다
    if (!this.manager)
    {
      this.manager = new kakao.maps.Drawing.DrawingManager(options);
      // (추가) toolbox에서 사용하는것
      this.manager.addListener('drawend', function(data) {
        // // click 이벤트를 등록합니다
        if (self.new_item) self.new_item.clear();
        else self.new_item = new PlaceInfo();

        self.new_item.type = data.overlayType;
        self.new_item.map_item = data.target;

        let latlon;
        if (data.target.k == undefined) {
          console.log(JSON.stringify(data.target.getPath()));
          
          for (var i = 0; i < data.target.getPath().length; i++) {
            self.new_item.points.push(data.target.getPath()[i].toLatLng()); // 찍었는 좌표 갯수만큼 배열에 담음
          }
          latlon = data.target.getPath()[0].toLatLng();
        } else {
          latlon = data.target.k.toLatLng();
        }
        self.new_item.lat = latlon.Ha;
        self.new_item.lon = latlon.Ga;
        self.edit_item = self.new_item;
        self.themeDetailOpen(self.modalContent);
      });
    }
  }

  // Script ----------------------------------------------------------------------------------------------------
  // 기존 마커데이터
  exist_Marker(self, place) {
    // 기존마커있으면 지도에 생성
    var normalImage,clickImage;
    
    if(place.marker_img3)
      normalImage = self.createMarkerImage( place.marker_img3, 45 ,45);
    else
      normalImage = self.createMarkerImage('assets/images/comm.png');
    
    if(place.marker_img4)
      clickImage = self.createMarkerImage( place.marker_img4, 45 ,45);
    else
      clickImage = self.createMarkerImage('assets/images/foucs.png');


    var exist_marker = new kakao.maps.Marker({
      map: self.map,                                          // 마커를 표시할 지도
      position: new kakao.maps.LatLng(place.lat, place.lon), // 마커를 표시할 위치
      image : normalImage,
      clickable: true
    });

    exist_marker.normalImage = normalImage;
    exist_marker.clickImage = clickImage;
    place.map_item = exist_marker;
    exist_marker.place_no = place.place_no;
    self.drawlist.set(place.place_no, place);

    // 기존마커 클릭시 위치이동 + 오버레이를 띄움(+ 디테일모달 )
    kakao.maps.event.addListener(exist_marker, 'click', function () {
      // 위치이동
      self.map.panTo(new kakao.maps.LatLng(exist_marker.k.toLatLng().Ha, exist_marker.k.toLatLng().Ga));
      // 오버레이 뛰움
      self.createsimpleView(exist_marker, self);
    });
  }

  // 기존 선,면, gpx들을 (좌표여러개를) path에 담아서 사용
  pointsToPath(points) {
    var len = points.length,
      path = [],
      i = 0;

    for (; i < len; i++) {
      var latlng = new kakao.maps.LatLng(points[i].Ha, points[i].Ga);
      path.push(latlng);
    }

    return path;
  }

  // 기존 선 데이터
  exist_line(self, lineItem) {
    var path = self.pointsToPath(JSON.parse(lineItem.points));      // DB안에 있는 선 데이터를 지도의 좌표에 맞게 변환후 path안에 넣음
    var polyline = new kakao.maps.Polyline({
      map: self.map,
      path: path,
      strokeWeight: 10,
      strokeColor: lineItem.figure_color,
    });

    var normalImage = self.createMarkerImage('assets/images/comm.png'),
    clickImage = self.createMarkerImage('assets/images/foucs.png');

    var line_marker = new kakao.maps.Marker({
      map: self.map,                                          // 마커를 표시할 지도
      position: new kakao.maps.LatLng(lineItem.lat, lineItem.lon), // 마커를 표시할 위치
      image : normalImage,
      clickable: true
    });

    line_marker.normalImage = normalImage;
    line_marker.clickImage = clickImage;
    polyline.marker = line_marker;
    lineItem.map_item = polyline;
    polyline.place_no = lineItem.place_no;
    self.drawlist.set(lineItem.place_no, lineItem);

    kakao.maps.event.addListener(line_marker, 'click', function () {
      // 오버레이 뛰움
      self.createsimpleView(polyline, self);
    });

    // 기존선 클릭시 오버레이를 띄움(+ 디테일모달 )
    kakao.maps.event.addListener(polyline, 'click', function () {
      // 위치이동
      self.map.panTo(new kakao.maps.LatLng(polyline.getPath()[0].Ha, polyline.getPath()[0].Ga));
      // 오버레이 뛰움
      self.createsimpleView(polyline, self);
    });
  }

  // 기존 면 데이터
  exist_Gon(self, polygonItem) {
    var path = self.pointsToPath(JSON.parse(polygonItem.points));   // DB안에 있는 면 데이터를 지도의 좌표에 맞게 변환후 path안에 넣음
    var polygon = new kakao.maps.Polygon({
      map: self.map,
      path: path,
      strokeWeight: 10,
      strokeColor: polygonItem.figure_color,
      fillColor: '#00eeee',
      fillOpacity: 0.5
    });


    var normalImage = self.createMarkerImage('assets/images/comm.png'),
    clickImage = self.createMarkerImage('assets/images/foucs.png');

    var polygon_marker = new kakao.maps.Marker({
      map: self.map,                                          // 마커를 표시할 지도
      position: new kakao.maps.LatLng(polygonItem.lat, polygonItem.lon), // 마커를 표시할 위치
      image : normalImage,
      clickable: true
    });

    polygon_marker.normalImage = normalImage;
    polygon_marker.clickImage = clickImage;
    polygon.marker = polygon_marker;
    polygonItem.map_item = polygon;
    polygon.place_no = polygonItem.place_no;
    self.drawlist.set(polygonItem.place_no, polygonItem);

    kakao.maps.event.addListener(polygon_marker, 'click', function () {
      // 오버레이 뛰움
      self.createsimpleView(polygon, self);
    });

    // 기존 면 클릭시 오버레이를 띄움(+ 디테일모달 )
    kakao.maps.event.addListener(polygon, 'click', function () {
      // 오버레이 뛰움
      self.createsimpleView(polygon, self);
    });
  }

  // 기존 gpx 데이터
  exist_gpx(self, gpxItem) {
    if (!gpxItem) return;
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(gpxItem.gpx, "text/xml");
    let gpxpath = this.get_gpx_data(xmlDoc.documentElement, []);
    // var path = self.pointsToPath(JSON.parse(gpxItem.points));      // DB안에 있는 선 데이터를 지도의 좌표에 맞게 변환후 path안에 넣음
    var gpxline = new kakao.maps.Polyline({
      map: self.map,
      path: gpxpath,
      strokeWeight: 10,
      strokeColor: gpxItem.figure_color,

      // 기존 gpx 클릭시 오버레이를 띄움(+ 디테일모달 )
      // 만들어야할듯?
    });

    var normalImage = self.createMarkerImage('assets/images/comm.png'),
    clickImage = self.createMarkerImage('assets/images/foucs.png');

    var gpxline_marker = new kakao.maps.Marker({
      map: self.map,                                          // 마커를 표시할 지도
      position: new kakao.maps.LatLng(gpxItem.lat, gpxItem.lon), // 마커를 표시할 위치
      image : normalImage,
      clickable: true
    });

    gpxline_marker.normalImage = normalImage;
    gpxline_marker.clickImage = clickImage;

    gpxline.marker = gpxline_marker;
    gpxItem.map_item = gpxline;
    gpxline.place_no = gpxItem.place_no;
    self.drawlist.set(gpxItem.place_no, gpxItem);
    // 기존 면 클릭시 오버레이를 띄움(+ 디테일모달 )
    kakao.maps.event.addListener(gpxline_marker, 'click', function () {
      // 오버레이 뛰움
      self.createsimpleView(gpxline, self);
    });

    kakao.maps.event.addListener(gpxline, 'click', function () {
      // 오버레이 뛰움
      self.createsimpleView(gpxline, self);
    });
  }

  // 기존 데이터 오버레이
  createsimpleView(exist_Item, self) {
    let place_info = self.drawlist.get(exist_Item.place_no);

    // 점(마커) ~ gpx 재클릭시 오버레이제거 부분
    if (self.selectMarker) {
      var over = self.overlayMaps.get(self.selectMarker.place_no);
      if(place_info.type != "marker")
        self.selectMarker.map_item.marker.setImage(self.selectMarker.map_item.marker.normalImage);
      else
        self.selectMarker.map_item.setImage(self.selectMarker.map_item.normalImage);

      over.setMap(null);
      if (self.selectMarker.place_no == place_info.place_no) {
        self.selectMarker = null;
        return;
      }
      self.selectMarker = null;
    }
    self.selectMarker = place_info;

    if(place_info.type != "marker")
    {
      place_info.map_item.marker.setImage(place_info.map_item.marker.clickImage);
      var itemBounds = new kakao.maps.LatLngBounds();
      place_info.map_item.getPath().forEach(element => {
        itemBounds.extend(element);
      });
      self.map.setBounds(itemBounds);
    }
    else
      place_info.map_item.setImage(place_info.map_item.clickImage);

    var iwContent = `
    <div class="infoWindow" style="display: block;">
      <div class="simple">
        <div class="head">
         <button type="button" class="go_detail" id="godetail_${place_info.place_no}">수정하기</button>
         <button type="button" class="go_close" id="goclose_${place_info.place_no}">X</button>
      </div>
      <a class="list_one">
        <div class="_txt">
          <p class="plc_name">${place_info.place_disp}</p>
          <p class="plc_info">
             <span class="addr">${place_info.address ? place_info.address : ""}</span>
            <span class="addr"></span>
          </p>
        </div>
        <div class="_img">
          <img src=${place_info.thumb_url} alt="" class="srch_result_thumb" style="visibility: visible;">
        </div>
      </a>
    </div>
  </div>`;

    // 커스텀 오버레이를 생성합니다
    var customOverlay = new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(place_info.lat, place_info.lon),
      content: iwContent
    });
    // Array.
    // id와 오버레이를 map에 담음
    self.overlayMaps.set(place_info.place_no, customOverlay);

    // 지도에 오버레이 출력 ( 확인필요 )
    customOverlay.setMap(self.map);
    // 오버레이에서 수정하기 클릭시 발생시킬 함수( 디테일모달 띄우는것 )
    document.getElementById(`godetail_${place_info.place_no}`).addEventListener('click',
      self.exist_detail.bind(this, place_info.place_no, self));
    // 오버레이에서 X 클릭시 오버레이를 닫는 함수
    document.getElementById(`goclose_${place_info.place_no}`).addEventListener('click',
      self.exist_close.bind(this, place_info.place_no, self));
  }

  // 디테일 모달( 기존데이터값을 받아서 넘김(기준점은 (id) place_no 값) )
  exist_detail(id, self, address) {
    self.edit_item = Object.assign({}, self.drawlist.get(id));
    self.themeDetailOpen(self.modalContent);
  }

  // 해당 id값 오버레이닫음
  exist_close(id, self) {
    var over = self.overlayMaps.get(id);

    // 오버레이삭제
    over.setMap(null);
  }



  // 테마 저장
  mapsave() {
    var self = this;

    self.searchDetailAddrFromCoords(new kakao.maps.LatLng(this.edit_item.lat, this.edit_item.lon), function (result, status) {
      // 좌표값받아서 실제주소값 확인
      if (status === kakao.maps.services.Status.OK) {
        self.edit_item.address = result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name;

        self.save();
      }
    });
  }

  save() {
    var self = this;
    let formData: FormData = new FormData();
    let files3: FileList = this.inputFile3.nativeElement.files;
    let files4: FileList = this.inputFile4.nativeElement.files;

    this.postData = {
      place_no: this.edit_item.place_no ? this.edit_item.place_no : null,
      theme_cls: 2,                           // 테마구분 고정값2
      place_nm: this.edit_item.place_disp,    // 장소명(필수값)
      txt: this.edit_item.txt,                // 내용
      lat: this.edit_item.lat,                // 위도
      lon: this.edit_item.lon,                // 경도
      addr1: self.edit_item.address,          // 위도,경도를 통한 주소값 필요
      place_figure: 1,                        // 마커번호(기본값1)
      points: null,
      figure_color: "",
      img_url: this.edit_item.img_url,
      thumb_url:this.edit_item.thumb_url,
      use_yn : this.edit_item.use_yn,
      marker_img3 : this.edit_item.marker_img3,
      marker_img4 : this.edit_item.marker_img4
    };

    if (this.postData.place_nm == undefined) {
      alert("제목은 필수값입니다.");
      return;
    }

    // 마커가 아닌 선, 면, gpx일땐 해당 번호를 넣음
    if (!this.edit_item.type.includes('marker')) {
      this.postData.points = this.edit_item.points;
      this.postData.figure_color = this.edit_item.figure_color;
      if (this.edit_item.type.includes('polyline')) {
        this.postData.place_figure = 2;
      } else if (this.edit_item.type.includes('polygon')) {
        this.postData.place_figure = 3;
      } else if (this.edit_item.type.includes('gpx')) {
        this.postData.place_figure = 4;
      }
    }

    for (let key in this.postData) {
      if (this.postData[key]) {
        if (this.postData[key] instanceof Array) {
          formData.append(key, JSON.stringify(this.postData[key]));
        } else formData.append(key, this.postData[key]);
      }
    }

    let img_urls: FileList = this.menu_marker_line_gon_gpx_image.nativeElement.files;

    // 이미지도 API에 추가
    if (img_urls.length > 0) {
      let img_url: File = img_urls[0];

      formData.append('file', img_url, img_url.name);
      this.postData.img_url = null;
      this.postData.thumb_url = null;
    }

    if (files3.length > 0) {
      let file: File = files3[0];
      formData.append('marker_img3', file, file.name);
    }

    if (files4.length > 0) {
      let file: File = files4[0];
      formData.append('marker_img4', file, file.name);
    }

    // gpx는 gpx자체를 DB에 넣음(저장후 지도에 뿌릴려면 파싱을 해야하는데 파싱할 데이터가 gpx에 있음)
    var item: any = this.edit_item.map_item;
    if (item.gpxfile) {
      formData.append('gpx', item.gpxfile, item.gpxfile.name);
    }

    this.mapprovider.place.post(formData).subscribe(
      (data: any) => {
        // 수정할때
        if (this.edit_item.place_no) {
              alert('저장되었습니다.');
              this.edit_item.map_item.setMap(null);         // edit_item(넣었던 값)들 다 초기화(정확지않음)
              this.modalService.dismissAll();               // 디테일 모달닫기
              this.getPlaceList();                          // 새로고침
              this.clearimg3();                          // 이미지3 삭제
              this.clearimg4();                          // 이미지4 삭제
              self.selectMarker = null;                  // 저장한 마커를 재클릭시 초기화해야함
              // 수정할때 오버레이띄운거 삭제
              if(this.edit_item.place_no){
                var over = self.overlayMaps.get(this.edit_item.place_no);

                // 오버레이삭제
                over.setMap(null);
              }
        }
        // 신규추가할때
        else {
          this.mapprovider.theme.placePost({
            map_no: this.map_no, // 해당 페이지(게시글) map_no값
            place_no: data.place_no // 신규추가일땐 response받은걸로 넣어야함
          }).subscribe(
            _ => {
              alert('저장되었습니다.');
              this.edit_item.map_item.setMap(null);         // edit_item(넣었던 값)들 다 초기화(정확지않음)
              this.modalService.dismissAll();               // 디테일 모달닫기
              this.getPlaceList();                          // 새로고침
              this.clearimg3();                          // 이미지3 삭제
              this.clearimg4();                          // 이미지4 삭제
              self.selectMarker = null;                  // 저장한 마커를 재클릭시 초기화해야함
            },
            err => {
              alert('저장실패!');
            }
          );
        }
      },
      err => { // 장소명이 없을때 예외처리되는데 장소명은 필수값이다.
        alert("err=>" + JSON.stringify(err));
      }
    );
  }

  // GPX 추가하기(1번)
  gpxstart(type) {
    // -- 파일부르기
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE');
    var trident = ua.indexOf('Trident/');
    if (msie > 0 || trident > 0) {
      this.inputFile2.nativeElement.click();
    } else {
      let event = new MouseEvent('click', { bubbles: true });
      this.renderer.invokeElementMethod(this.inputFile2.nativeElement, 'dispatchEvent', [event]); // ?
    }
    // 마커,선,다각형 사용중일때 gpx버튼 클릭하면 마커,선,다각형 사용을 취소합니다.
    this.manager.cancel();

    //  this.manager.select(kakao.maps.drawing.OverlayType[type]);
  }

  // 좌표를 통한 실제 주소(DB)
  searchDetailAddrFromCoords(coords, callback) {
    // 좌표로 법정동 상세 주소 정보를 요청합니다
    this.geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
  }

  // gpx 추가할때 gpx타입인지 확인(2-1) + 데이터(좌표)를 파싱(2-2) + 디테일모달을 띄움(2-3) (2번)
  checkGpxFile($event) {
    var self = this;
    let files: FileList = $event.target.files;
    if (files.length > 0) {
      let file: File = files[0];
      // gpx인지 확인(2-1)
      if (!file.name.includes('.gpx')) {
        alert('GPX만 업로드 가능합니다.');
        $event.target.value = '';
      } else {
        var fr = new FileReader();
        fr.onload = () => {
          // 데이터 파싱(2-2)
          let parser = new DOMParser();
          let xmlDoc = parser.parseFromString(<string>fr.result, "text/xml");
          let items = self.get_gpx_data(xmlDoc.documentElement, []);

          var polyline = new kakao.maps.Polyline({
            map: self.map,
            path: items,
            strokeWeight: 5,
            strokeColor: "#3399FF",
            strokeOpacity: 0.8,
            strokeStyle: 'line'
          });

          if (self.new_item)
            self.new_item.clear();
          else
            self.new_item = new PlaceInfo();
          self.new_item.type = 'gpx';

          for (var i = 0; i < polyline.getPath().length; i++) {
            self.new_item.points.push(polyline.getPath()[i]); // 찍었는 좌표 갯수만큼 배열에 담음
          }

          self.new_item.lat = polyline.getPath()[0].getLat();
          self.new_item.lon = polyline.getPath()[0].getLng();
          self.new_item.map_item = polyline;
          self.edit_item = self.new_item;
          //  var drawItem = new PlacedrawInfo(polyline,undefined);
          //  let mapkey =  self.createdrawId('gpx');
          //  polyline.listId =   mapkey;
          polyline.gpxfile = file;
          //  self.drawlist.set(mapkey, drawItem);

          // 디테일모달을 띄움(2-3)
          self.themeDetailOpen(self.modalContent);
        };
        fr.readAsText(files[0], 'utf-8');
      }
    }
  }

  // GPX 데이터(좌표)를 파싱(2-2)
  get_gpx_data(node, result) {
    switch (node.nodeName) {
      case 'trkseg':
        for (var i = 0; i < node.childNodes.length; i++) {
          var snode = node.childNodes[i];
          if (snode.nodeName == 'trkpt') {
            let trkpt = new kakao.maps.LatLng(parseFloat(snode.attributes['lat'].value), parseFloat(snode.attributes['lon'].value));
            // console.log('trkpt = ' + JSON.stringify(trkpt));
            result.push(trkpt);
          }
        }
        break;
    }
    for (var i = 0; i < node.childNodes.length; i++) {
      this.get_gpx_data(node.childNodes[i], result);
    }
    return result;
  }

  // (디테일모달) 이미지 추가
  menu_marker_line_gon_gpx_openFile() {
    var ua = window.navigator.userAgent;
    // console.log("ua1=>"+ ua);
    var msie = ua.indexOf('MSIE ');
    // console.log("msie1=>"+ msie);
    var trident = ua.indexOf('Trident/');
    // console.log('trident1=>' + trident);
    if (msie > 0 || trident > 0) {
      this.menu_marker_line_gon_gpx_image.nativeElement.click();
    } else {
      let event = new MouseEvent('click', { bubbles: true });
      this.renderer.invokeElementMethod(this.menu_marker_line_gon_gpx_image.nativeElement, 'dispatchEvent', [event]);
    }
  }
  // (디테일모달) 이미지인지 확인
  menu_marker_line_gon_gpx_checkFileType($event) {
    // 이미지넣을때 무조건 초기화
    let files: FileList = $event.target.files;
    if (files.length > 0) {
      let file: File = files[0];
      if (!file.type.includes('image/')) {
        alert('이미지만 업로드 가능합니다.');
        $event.target.value = '';
      } else {
        var fr = new FileReader();
        fr.onload = () => {
          this.edit_item.img_url = fr.result;
        };
        fr.readAsDataURL(files[0]);
      }
    }
  }
  // (디테일모달) 이미지 삭제
  menu_marker_line_gon_gpx_deleteFile(index) {
    this.edit_item.img_url = null;
  }

  // 모달닫기 + 생성한 점, 선, 면 삭제
  modal_close() {
    this.modalService.dismissAll();                 // 모달 없애기
    if (!this.edit_item.place_no)
      this.edit_item.map_item.setMap(null);         // 추가하려고했는 점,선,면 삭제
  }

  themeDelete(place) {
    var self = this;
    var over = self.overlayMaps.get(self.selectMarker.place_no);
    over.setMap(null);                                                // 오버레이 삭제
    // self.overlayMaps.delete(place);

    self.mapdelete2(self.selectMarker.place_no, self);                      // DB값 삭제
  }

  // (추가한뒤) 삭제버튼누를시 DB에서도 삭제시킴
  mapdelete2(place,self) {
    this.mapprovider.theme.delete({
      // map.ts의 api url에 cls_cd값을 넘겨줌으로서 DB에서 삭제시킴
      body: {
        map_no: this.map_no,
        place_no: place
      },
      responseType: 'text'
    })
      .subscribe(
        _ => {
          alert('삭제되었습니다.');
          this.getPlaceList();                          // 새로고침
          self.modalService.dismissAll();               // 디테일 모달닫기
        },
        err => {
          alert('삭제실패!');
        }
      );
  }

  color(color){
    console.log(color);
  }
  createMarkerImage(markerImg, width = 27, heigth = 43) {
    var markerImage = markerImg
      ? new kakao.maps.MarkerImage(
          markerImg, // 스프라이트 마커 이미지 URL
          new kakao.maps.Size(width, heigth) // 마커의 크기
        )
      : null;

    return markerImage;
  }

  openFile3() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var trident = ua.indexOf('Trident/');
    if (msie > 0 || trident > 0) {
        this.inputFile3.nativeElement.click();
    } else {
      let event = new MouseEvent('click', { bubbles: true });
      this.renderer.invokeElementMethod(this.inputFile3.nativeElement, 'dispatchEvent', [event]);
    }
  }
  openFile4() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var trident = ua.indexOf('Trident/');
    if (msie > 0 || trident > 0) {
        this.inputFile4.nativeElement.click();
    } else {
      let event = new MouseEvent('click', { bubbles: true });
      this.renderer.invokeElementMethod(this.inputFile4.nativeElement, 'dispatchEvent', [event]);
    }
  }

  // 마커이미지3
  checkFileType3($event) {
    let files: FileList = $event.target.files;
    if (files.length > 0) {
      let file: File = files[0];
      if (!file.type.includes('image/')) {
        alert('이미지만 업로드 가능합니다.');
        $event.target.value = '';
      } else {
        var fr = new FileReader();
        fr.onload = () => {
          if(this.edit_item.marker_img3 != null) {
            this.edit_item.marker_img3  = fr.result;
          } else {
            this.image3 = fr.result;
          }
        };
        fr.readAsDataURL(files[0]);
      }
    }
  }
  // 마커이미지4
  checkFileType4($event) {
    let files: FileList = $event.target.files;
    if (files.length > 0) {
      let file: File = files[0];
      if (!file.type.includes('image/')) {
        alert('이미지만 업로드 가능합니다.');
        $event.target.value = '';
      } else {
        var fr = new FileReader();
        fr.onload = () => {
          if (this.edit_item.marker_img4 != null) {
            this.edit_item.marker_img4  = fr.result;
          } else {
            this.image4 = fr.result;
          }
        };
        fr.readAsDataURL(files[0]);
      }
    }
  }

  clearimg3() {
    this.image3 = null;
    this.edit_item.marker_img3 = null;
    this.inputFile3.nativeElement.value =null;
  }
  clearimg4() {
    this.image4 = null;
    this.edit_item.marker_img4 = null;
    this.inputFile4.nativeElement.value =null;
  }

  open_sort_List(){
    this.sort_List = true;
  }
  close_sort_List(){
    this.sort_List = false;
  }

  sort_start(index){

    this.nowThemeindex = index;

  }
  sort_Forward( ) {
    if(this.nowThemeindex <= 0){
      alert("맨위입니다.");
      return;
    }
    let sortItem = this.place_list[this.nowThemeindex];
    let forwardItem = this.place_list[this.nowThemeindex - 1];
    this.place_list.splice(this.nowThemeindex - 1, 2 , sortItem, forwardItem);
    this.nowThemeindex = this.nowThemeindex - 1;
  }

  sort_Backward() {
    if((this.place_list.length-1) == this.nowThemeindex)
    {
      alert("맨아래 입니다.");
      return;
    }

    let sortItem = this.place_list[this.nowThemeindex];
    let backwardItem = this.place_list[this.nowThemeindex + 1];
    this.place_list.splice(this.nowThemeindex, 2 , backwardItem, sortItem);
    this.nowThemeindex = this.nowThemeindex + 1;
    // console.log(this.nowThemeindex);
  }

  sort_save(i = 0) {
    let array = {
      place_list:[ ]
  };
    this.place_list.forEach(element => {
      i++;
      let test = {
        place_no : element.place_no,
        disp_ord : i
      }
      array.place_list.push(test);
    });
    this.mapprovider.theme.sort(array).subscribe(
      (data: any) => {
        alert("저장되었습니다.");
        this.sort_List = false;
      },
      err => { 
        alert("err=>" + JSON.stringify(err));
        this.sort_List = false;
      }
    );
  }
}

// 신규데이터와 기존데이터를 담을 클래스
export class PlaceInfo {
  place_disp: any;   // map 데이터
  txt: any; // DB 데이터
  figure_color: any = "#3399FF";
  img_url: any;
  thumb_url:any;
  lat: any;
  lon: any;
  points = [];
  map_item: any;
  address: any;
  type: any;
  place_no: any;
  gpx: any;
  use_yn: any = 1;
  marker_img3:any ;
  marker_img4:any ;

  constructor() { }

  clear() {
    this.place_disp = "";
    this.txt = "";
    this.figure_color = "#3399FF";
    this.img_url = "";
    this.lat = "";
    this.lon = "";
    this.map_item = null;
    this.address = "";
    this.type = "";
    this.place_no = null;
    this.points = [];
    this.gpx = "";
    this.thumb_url="";
    this.use_yn ='';
    this.marker_img3 =null;
    this.marker_img4 =null;
  }

  placeTypeToString(typeNum) {
    let typeString = "marker";
    switch (typeNum) {
      case "1":
        typeString = "marker";
        break;
      case "2":
        typeString = "polyline";
        break;
      case "3":
        typeString = "polygon";
        break;
      case "4":
        typeString = "gpx";
        break;
      default:
        break;
    }
    return typeString;
  }
}