import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, Renderer, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MapProvider } from '../../../providers/map';
import { LoginSession } from '../../../services/login.session';
// import { ConsoleReporter } from 'jasmine';
declare let kakao: any;

@Component({
  selector: 'itsm-themeenrollment',
  templateUrl: './themeenrollment.component.html',
  styleUrls: ['./themeenrollment.component.scss']
})
export class ThemeenrollmentComponent implements OnInit {
  @ViewChild('inputFile1') inputFile1: ElementRef;
  @ViewChild('inputFile2') inputFile2: ElementRef;
  @ViewChild('menu_marker_line_gon_gpx_image') menu_marker_line_gon_gpx_image: ElementRef;

  // theme에서 no값 넘기기용
  no: any = {
    map_no: ''
  };

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
  map_no = '';                  // 테마등록후 표(테마지도 리스트) 오픈

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
  drawlist  = new Map<string,any>();              // (공통)좌표 ...
  geocoder = new kakao.maps.services.Geocoder();  // (공통)좌표에 대한 실제주소값(DB)

  mapdata;                                        // (추가?) place_no 변수

  searchdata = [];                                // (지도-검색기능) 변수
  search_check : boolean = false;
  places_List : boolean = true;
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
  selectMarker = []; // 점(마커) ~ gpx 재클릭시 담을 변수

  tilteOverlay;

  // test 중
  menu_open : boolean = false;                    // 마커,선,면,gpx 메뉴닫기

  marker_line_gon_gpx_place_disp;                 // 마커,선,면,gpx 테마지도명
  marker_line_gon_gpx_txt;                        // 마커,선,면,gpx 내용
  marker_line_gon_gpx_img_url: Array<any> = [];                    // 마커,선,면,gpx 썸네일
  marker_line_gon_gpx_figure_color;               // 선,면,gpx 색깔

  place;                                          // 수정할때 해당 ID에 관한 데이터를 담음
  marker_line_gon_gpx_place;
  points = [];
  constructor(
    private route: ActivatedRoute,
    // private http: HttpClient,
    private mapprovider: MapProvider,
    public loginSession: LoginSession,
    private router: Router,
    public renderer: Renderer,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.getPlaceList();

    // 테마구분 API
    this.mapprovider.theme.getcode().subscribe((code: any) => {
      this.themecode = code;
      // console.log(this.themecode);
    });

    // map_no가 있을때는 장소편집 클릭가능도록 하는 부분
    if (this.no.map_no) {
      this.mapopen = false;
      this.mapclose = true;
    }
  }

  getPlaceList(place_no? , mapItem_id?){
    // console.log("place_no, mapItem_id =>" + place_no, mapItem_id);
    var self = this;
    // theme페이지에서 리스트 클릭시 해당 번호를 가져옴
    this.route.queryParams.subscribe(no => {
      //  console.log("no.map_no=>"+JSON.stringify(no.map_no));

      // theme페이지에서 no값 넘겨서 사용
      this.no.map_no = no.map_no;

      // 기존에 있는 값 수정할때
      if (no.map_no) {
        this.mapprovider.theme.getdetaillist(no.map_no).subscribe((data: any) => {
          // API전체값
          this.theme = { ...data };

          // 테마list
          this.place_list = data.place_list;
          // console.log("length=>" + (this.place_list).length);
          // console.log("testest=>" + JSON.stringify(this.place_list));

          // 점(마커)~GPX Id , DB No값                                                          점(마커)~GPX값을 클릭시 실시간으로 부르기 위한 용도(틀)
          if(mapItem_id && place_no)
          {
            let drawItem:PlacedrawInfo = this.drawlist.get(mapItem_id);                        // map방식으로 각 점(마커)~GPX의 id값을 가져옴
            drawItem.placeItem = this.place_list.filter(element=>{                             // place의 No와 DB의 place_no을 비교하여 가져옴
            return element.place_no == place_no})[0];                                          // 첫번째 배열에 넣고
            this.drawlist.set(mapItem_id, drawItem);                                           // map에 넣음
          }

          // (테마리스트) DB안에 있는 이미지값 넘겨서 picList에 넘겨줌(html에서 [src]부분)
          if (data.img_url) {
            this.picList = [data.img_url];
          }
        });
      }
      // --------------------------------------------------------------------- 새로등록할때
      else {
        this.theme = {
          // map_no 값을 넘겨줘야함(등록할땐 없다)
          map_no: '',
          // 테마구분값을 1(=관광지도로 되어있을거임)로 최초실행
          cls_cd: 1,
          // 사용여부 기본값 1(=사용)
          use_yn: 1
        };
        // alert("사용할일없음");
      }
    });
  }

  // --------------------------------------------------------------------------------------------------------------------------------- 페이지기능
  // 돌아가기
  themeback() {
    this.router.navigate(['map/theme']);
  }

  // 지도삭제하기
  mapdelete(){
    this.mapprovider.theme.mapdelete(this.no.map_no)
    .subscribe( _ => {
      // response값이 없음
    }, err => {
        alert('삭제가 되었습니다!');
        this.themeback();
      }
    );
  }
  // 저장
  save() {
    if (confirm(this.no.map_no ? '수정하시겠습니까?' : '추가하시겠습니까?')) {
      // form방식으로함
      let formData: FormData = new FormData();


      let postData = {
        ...this.theme
      };
      // 서버에 값넘기기전에 테마지도명의 값이 있는지 확인후 없으면 경고창 리턴
      if (this.theme.map_nm == undefined) {
        alert('테마지도명은 필수입니다.');
        return;
      }
      // 서버에 값넘기기전에 테마구분의 값이 있는지 확인후 없으면 경고창하고 리턴
      if (this.theme.cls_cd == undefined) {
        alert('테마구분은 필수입니다.');
        return;
      }
      //  console.log("this.place=> " + JSON.stringify(this.theme));
      for (let key in postData) {
        if (postData[key]) {
          if (postData[key] instanceof Array) {
            formData.append(key, JSON.stringify(postData[key]));
          } else formData.append(key, postData[key]);
        }
      }

      // 이미지
      let img_urls: FileList = this.inputFile1.nativeElement.files;

      // 이미지도 API에 추가
      if (img_urls.length > 0) {
        let img_url: File = img_urls[0];

        formData.append('file', img_url, img_url.name);
      }

      this.mapprovider.theme.mappost(formData).subscribe(_ => {
          alert('저장되었습니다.');
          // 테마 저장시 장소 편집 클릭가능도록 하는 부분
          this.mapopen = false;
          this.mapclose = true;

          // 저장후 url에 map_no값 붙히기 용
          var test = JSON.stringify(_)
          var map_no = JSON.parse(test).map_no;
          this.router.navigate(['map/themeenrollment'],{ queryParams: { map_no } }); //

        },
        err => {
          alert('저장실패!');
        }
      );
    }
  }

  // 이미지 추가
  openFile() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var trident = ua.indexOf('Trident/');
    if (msie > 0 || trident > 0) {
      this.inputFile1.nativeElement.click();
    } else {
      let event = new MouseEvent('click', { bubbles: true });
      this.renderer.invokeElementMethod(this.inputFile1.nativeElement, 'dispatchEvent', [event]);
    }
  }
  // 이미지 삭제
  deleteFile(index) {
    this.picList.splice(index, 1);
  }

  // 이미지인지 확인
  checkFileType($event) {
    let files: FileList = $event.target.files;
    // console.log('[checkFileType]' + JSON.stringify($event.target.files));
    if (files.length > 0) {
      let file: File = files[0];
      if (!file.type.includes('image/')) {
        alert('이미지만 업로드 가능합니다.');
        $event.target.value = '';
      } else {
        var fr = new FileReader();
        fr.onload = () => {
          if (this.picList.length < 1) this.picList.push(fr.result);
        };
        fr.readAsDataURL(files[0]);
      }
    }
  }
  
  // (테마페이지)테마리스트에서 삭제
  delete1(themelist) {
    // console.log("themelist => " + JSON.stringify(themelist));

    if (confirm('삭제하시겠습니까?')) {
      this.mapprovider.theme
        .delete({
          // map.ts의 api url에 cls_cd값을 넘겨줌으로서 DB에서 삭제시킴
          // cls_cd: this.cls1.cls_cd,
          body: {
            map_no: this.no.map_no,
            place_no: themelist.place_no
          },
          responseType: 'text'
        })
        .subscribe(
          _ => {
            alert('삭제되었습니다.');
            this.ngOnInit();
          },
          err => {
            alert('삭제실패!');
          }
        );
    }
  }
  // --------------------------------------------------------------------------------------------------------------------------------- 지도 기능
  openMap(content) {

    this.menu_open = false;
    // 지도켰다가 닫은후 다시 지도키면 현재 마커,선,면 들이 또 drawlist에 push되서 초기화시켜줘야함(안하면 id가 꼬임(marker1,2,3들이 꼬인다.))
    if(this.drawlist)
      this.drawlist.clear();

    var self = this;
    // gpx 선택후 지도를 껏을때 선택했던 gpx 초기화시켜서 다시 부를수잇게함
    self.inputFile2.nativeElement.value = "";

    // 검색값받기위한 변수
    this.ps = new kakao.maps.services.Places();

    // 지도초기설정
    this.openModal(content, 'lg', 'customModal');
    var mapOptions: any = {  
      center: new kakao.maps.LatLng(36.0190238, 129.3433917),
                                                      // 리스트 클릭(리스트에 좌표가있음)이 없을땐 포항시청        //좌표가 있을땐 해당 좌표
      // center: selectmap == undefined ? new kakao.maps.LatLng(36.0190238, 129.3433917) : new kakao.maps.LatLng(selectmap.lat, selectmap.lon),
      level: 5
    };
    var container = document.getElementById('map');
    this.map = new kakao.maps.Map(container, mapOptions);

    // 마커가 1개이상 있을때는 마커에 맞게 지도비율조정
    if(this.place_list.length > 0){
      var points = [];
      for(var i = 0 ; i < (this.place_list).length; i++){
        points.push(new kakao.maps.LatLng(this.place_list[i].lat, this.place_list[i].lon));
        this.bounds.extend(points[i]);
      }
      this.map.setBounds(this.bounds);
    } else { }

    // ---------------------------------------------------------Toolbox
    // 도형 스타일을 변수로 설정합니다
    var strokeColor = '#39f',
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
    this.manager = new kakao.maps.Drawing.DrawingManager(options);

    // (추가) toolbox에서 사용하는것
    this.manager.addListener('drawend', function(data) {
      // click 이벤트를 등록합니다
      var drawItem = new PlacedrawInfo(data.target,undefined);        // 해당 데이터자료
      let mapkey =  self.createdrawId(data.overlayType);              // 점(마커) ~ GPX 타입(구분값)
      data.target.listId =   mapkey;                                  // target안에 listId값이 추가되면서 mapkey(타입)값을 변수로 넘김
      self.drawlist.set(mapkey, drawItem);                            // drawlist에 타입과 데이터자료를 넣어줌
      
      self.addCreate(data.target,self);                               // 마커클릭후 지도에 찍을때 바로 오버레이 띄움
      kakao.maps.event.addListener(data.target, 'click', function(e) {// 지도에 찍은 마커를 클릭시에도 오버레이 띄워야함
          self.addCreate(data.target,self);        // 점(마커) ~ GPX를 생성한다.
      });
    });

    // (----------------------------------------------------기존----------------------------------------------------------)
    // (기존) 점, 선, 면을 표시할 위치와 배열 (1번)
    for (let i = 0; i < this.place_list.length; i++) {
      if (this.place_list[i].place_figure == 1) {
        // 점(1) 출력         //DB에 있는 좌표값          // 게시글전체데이터
        self.exist_Marker(self,this.place_list[i]);
      } else if (this.place_list[i].place_figure == 2) {
        // 선(2)
        self.exist_line(self, this.place_list[i]);
      } else if( this.place_list[i].place_figure == 3) {
        // 면(3)
        self.exist_Gon(self, this.place_list[i]);
      }
      // (나중에 확인 요망) ( db에 gpx값이 있을때 출력시켜야할듯?)
      else if( this.place_list[i].place_figure == 4) {
        self.exist_gpx(self, this.place_list[i]);
      }
    }
  }
  
  // (기존) 좌표를 통한 점(마커)출력 + 점(마커) 데이터 출력 (2번)
  exist_Marker(self, place) {
    // 마커를 생성합니다
    var exist_marker = new kakao.maps.Marker({
      map: self.map,                                          // 마커를 표시할 지도
      position:  new kakao.maps.LatLng(place.lat, place.lon), // 마커를 표시할 위치
      clickable: true
    });

    var drawItem = new PlacedrawInfo(exist_marker,place); // exist_marker -> 지도안에 들어있는 데이터 / place -> DB에서 가져온 점(마커)들의 데이터 
    let mapkey =  self.createdrawId('marker');            // type 확인후 점(마커)에 대한 ID값 생성
    exist_marker.listId =  mapkey;                        // 생성한 ID값을 exist_marker안의 listId안에 넣어줌(콘솔, 디버그찍으면 확인가능)
    self.drawlist.set(mapkey, drawItem);                  // map타입안에 넣음

    var itemid = exist_marker.listId;
    var tilte_content = `<div style="margin-top: 30px;">${place.place_disp}</div>`;

    this.tilteOverlay =  new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(place.lat, place.lon),
      content: tilte_content
    });

    self.titleoverlayMaps.set(itemid, this.tilteOverlay);
    this.tilteOverlay.setMap(self.map);

    kakao.maps.event.addListener(exist_marker, 'click', function() {  
      self.popupOverlayCreate(exist_marker, place, self); 
    });
  }


  // (기존) 좌표를 통한 선 출력 + 선 데이터 출력 (2번)
  exist_line(self, lineItem) {

    // 타이틀(오버레이)
    var len = self.pointsToPath(JSON.parse(lineItem.points)).length;           // 다각형 좌표들 길이
	
		var tp=0,lp=0,rp=0,bp=0;
		
		for (let i = 0; i < len; i++) {
			if(tp == 0 || tp <self.pointsToPath(JSON.parse(lineItem.points))[i].Ha){  // 다각형좌표중 top 최대값 
        tp = self.pointsToPath(JSON.parse(lineItem.points))[i].Ha;
			}
			if(bp == 0 || bp > self.pointsToPath(JSON.parse(lineItem.points))[i].Ha){ // 다각형좌표중 bottem 최대값
				bp = self.pointsToPath(JSON.parse(lineItem.points))[i].Ha;
			}
			
			if(lp == 0 || lp > self.pointsToPath(JSON.parse(lineItem.points))[i].Ga){ // 다각형좌표중 left 최대값
				lp = self.pointsToPath(JSON.parse(lineItem.points))[i].Ga;
			}
			
			if(rp == 0 || rp < self.pointsToPath(JSON.parse(lineItem.points))[i].Ga){ // 다각형좌표중 right 최대값
				rp = self.pointsToPath(JSON.parse(lineItem.points))[i].Ga;
			}
		}
		var x = (tp + bp) / 2;                                                      // top + bottem / 2 => 세로 중간값
    var y = (rp + lp) / 2;                                                      // left + right / 2 => 가로 중간값

    // 오버레이
    if (!lineItem) return;

    var path = self.pointsToPath(JSON.parse(lineItem.points));      // DB안에 있는 선 데이터를 지도의 좌표에 맞게 변환후 path안에 넣음
    var polyline = new kakao.maps.Polyline({
      map: self.map,
      path: path,
      strokeWeight: 7,
      strokeColor: '#FF00FF',
      strokeOpacity: 0.8,
      strokeStyle: 'line'
    });

    var drawItem = new PlacedrawInfo(polyline, lineItem);           // polyline -> 지도안에 들어있는 데이터 / lineItem -> DB에서 가져온 점(마커)들의 데이터
    let mapkey =  self.createdrawId('polyline');                    // type 확인후 선에 대한 ID값 생성
    polyline.listId =  mapkey;                                      // 생성한 ID값을 polyline안의 listId안에 넣어줌(콘솔, 디버그찍으면 확인가능)
    self.drawlist.set(mapkey, drawItem);                            // map타입안에 넣음

    var itemid = polyline.listId;
    var tilte_content = `<div style="top:20px ; margin-top: 30px;">${lineItem.place_disp}</div>`;

    this.tilteOverlay =  new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(x, y),
      content: tilte_content
    });

    self.titleoverlayMaps.set(itemid, this.tilteOverlay);
    this.tilteOverlay.setMap(self.map);

    kakao.maps.event.addListener(polyline, 'click', function() {    // 선 클릭시 관련 기능
      self.popupOverlayCreate(polyline, lineItem, self);
    });
    // console.log("abcd => " + JSON.stringify(lineItem));
  }

  // (기존) 좌표를 통한 면 출력 + 면 데이터 출력 (2번)
  exist_Gon(self, polygonItem) {

  // 타이틀(오버레이)
  var len = self.pointsToPath(JSON.parse(polygonItem.points)).length;           // 다각형 좌표들 길이
	
  var tp=0,lp=0,rp=0,bp=0;
  
  for (let i = 0; i < len; i++) {
    if(tp == 0 || tp <self.pointsToPath(JSON.parse(polygonItem.points))[i].Ha){  // 다각형좌표중 top 최대값 
      tp = self.pointsToPath(JSON.parse(polygonItem.points))[i].Ha;
    }
    if(bp == 0 || bp > self.pointsToPath(JSON.parse(polygonItem.points))[i].Ha){ // 다각형좌표중 bottem 최대값
      bp = self.pointsToPath(JSON.parse(polygonItem.points))[i].Ha;
    }
    
    if(lp == 0 || lp > self.pointsToPath(JSON.parse(polygonItem.points))[i].Ga){ // 다각형좌표중 left 최대값
      lp = self.pointsToPath(JSON.parse(polygonItem.points))[i].Ga;
    }
    
    if(rp == 0 || rp < self.pointsToPath(JSON.parse(polygonItem.points))[i].Ga){ // 다각형좌표중 right 최대값
      rp = self.pointsToPath(JSON.parse(polygonItem.points))[i].Ga;
    }
  }
  var x = (tp + bp) / 2;                                                      // top + bottem / 2 => 세로 중간값
  var y = (rp + lp) / 2;                                                      // left + right / 2 => 가로 중간값

    // 오버레이
    if (!polygonItem) return;

    var path = self.pointsToPath(JSON.parse(polygonItem.points));   // DB안에 있는 면 데이터를 지도의 좌표에 맞게 변환후 path안에 넣음
    var polygon = new kakao.maps.Polygon({
      map: self.map,
      path: path,
      strokeWeight: 7,
      strokeColor: '#FF00FF',
      strokeOpacity: 0.8,
      strokeStyle: 'line'
    });

    var drawItem = new PlacedrawInfo(polygon, polygonItem);    // polygon -> 지도안에 들어있는 데이터 / polygonItem -> DB에서 가져온 점(마커)들의 데이터
    let mapkey =  self.createdrawId('polygon');                // type 확인후 면에 대한 ID값 생성
    polygon.listId =  mapkey;                                  // 생성한 ID값을 polygon안의 listId안에 넣어줌(콘솔, 디버그찍으면 확인가능)
    self.drawlist.set(mapkey, drawItem);                       // map타입안에 넣음

    
    var itemid = polygon.listId;
    var tilte_content = `<div style="margin-top: 30px;">${polygonItem.place_disp}</div>`;

    this.tilteOverlay =  new kakao.maps.CustomOverlay({
      position: new kakao.maps.LatLng(x, y),
      content: tilte_content
    });
    self.titleoverlayMaps.set(itemid, this.tilteOverlay);
    this.tilteOverlay.setMap(self.map);

    kakao.maps.event.addListener(polygon, 'click', function() {       // 면 클릭시 관련 기능
      self.popupOverlayCreate(polygon, polygonItem, self);
    });
  }

  // (기존) 좌표를 통한 gpx 출력
  exist_gpx(self, gpxItem) {
    if (!gpxItem) return;

    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(gpxItem.gpx,"text/xml");
    let gpxpath = this.get_gpx_data(xmlDoc.documentElement,[]);
    // console.log("xmlDoc.documentElement=>" + xmlDoc.documentElement)

    var gpxline = new kakao.maps.Polyline({
      map: self.map,
      path: gpxpath,
      strokeWeight: 7,
      strokeColor: '#FF00FF',
      strokeOpacity: 0.8,
      strokeStyle: 'line'
    });

    var drawItem = new PlacedrawInfo(gpxline, gpxItem);       // polyline -> 지도안에 들어있는 데이터(gpx도 line이다.) / gpxItem -> DB에서 가져온 점(마커)들의 데이터
    let mapkey =  self.createdrawId('gpx');                   // type 확인후 면에 대한 ID값 생성
    gpxline.listId =  mapkey;                                 // 생성한 ID값을 polyline안의 listId안에 넣어줌(콘솔, 디버그찍으면 확인가능)
    self.drawlist.set(mapkey, drawItem);                      // map타입안에 넣음

    kakao.maps.event.addListener(gpxline, 'click', function() {    // gpx 클릭시 관련 기능
      self.popupOverlayCreate(gpxline, gpxItem, self);
    });
  }

  // (기존) 선, 면 좌표들 (gpx는 다른메소드로 함)
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

  // (기존) 점, 선, 면, gpx 그리고 오버레이
  popupOverlayCreate(overlay, place, self) {
    this.menu_open = true;
    this.marker_line_gon_gpx_place = place;
    console.log("this.marker_line_gon_gpx_place=>" + JSON.stringify(this.marker_line_gon_gpx_place));
    // console.log("p ="+ JSON.stringify(place));
    // toolbox에서 선택후 지도에 찍을시 좌표이동
    if(place){
      this.map.panTo(new kakao.maps.LatLng(place.lat, place.lon));
    }

    this.marker_line_gon_gpx_place_disp = place.place_disp;                   // 제목
    this.marker_line_gon_gpx_txt = place.txt;                                 // 내용
    this.marker_line_gon_gpx_img_url = [place.img_url];                         // 이미지
    this.marker_line_gon_gpx_figure_color = place.figure_color;               // 컬러

    // 지도안에 들어있는 데이터들의 각 ID
    // var itemid = overlay.listId;
    this.past_itemid = overlay.listId;

    // 기존데이터 좌표  / 마커가 없을때(즉, 선,면일때) 변환된 좌표를 확인하고 없으면 DB에 들어간 값(변환된 좌표)를 사용 
    // var iwPosition = overlay.k == undefined ?  (overlay.customIg ?  overlay.customIg : overlay.Ig[0]) : overlay.k.toLatLng();
    // ( 변환된 좌표(overlay.customIg)를 확인하는 이유는 추가직후 리스트에서 클릭하면 여기로 들어오는데 이때 선,면 클릭시 변환안된 좌표로 들어와서 오류가 터짐 )

    // 점(마커)~gpx 재클릭시 오버레이제거할 변수
    // var isSelect = self.selectMarker.indexOf(overlay);                 // 마커클릭시 오버레이뜰때가 -1  재클릭시 오버레이가 사라질때 0 이다.

    // 점(마커)~gpx 재클릭시 오버레이제거 부분
    // if (isSelect > -1) {                                               // 즉 0으로 바꿀땐(마커재클릭시)
    //   var over = self.overlayMaps.get(this.itemid);
    //   over.setMap(null);                                               // 오버레이 숨김
    //   self.selectMarker.splice(self.selectMarker.indexOf(overlay), 1); // 오버레이 제거(숨김, 제거 둘다해야함)
    //   return;
    // } else {                                                           // 1일때(마커클릭직후)
    //   if(self.selectMarker.length > 0)                                 // 마커갯수가 1개이상일경우
    //   {
    //     var over = self.overlayMaps.get(self.selectMarker[0].listId);  // 첫번째 오버레이 지정       
    //     if(over == undefined){
    //                                                                    // 마커추가하고 바로 삭제한뒤 기존마커클릭하면 over가 undefined 오류떠서 그냥 넘겨버림
    //     }
    //     else {
    //       over.setMap(null);                                           // 첫번째 오버레이는 숨김
    //     }
    //     self.selectMarker.splice(self.selectMarker.indexOf(over), 1);  // 두번째 오버레이띄울땐 첫번째 오버레이는 제거
    //   }
    //   self.selectMarker.push(overlay);                                 // tool에서 사용했는 타입 변수(점,선,면)
    // }
    // console.log("test , " + self.drawlist.get(itemid).placeItem.place_disp);   //디버깅용
//     var iwContent2 = `<div id='overlay${this.itemid}'>
//     <input id='title${this.itemid}' class="form-control" type="text" style="width:400px;" placeholder = "장소명을 입력해주세요."
//     value='${self.drawlist.get(this.itemid).placeItem ?  self.drawlist.get(this.itemid).placeItem.place_disp : ''}'><br>
//     <textarea id='txt${this.itemid}' class="form-control" type="text" style="width:400px; height:7em; text-overflow:clip;" placeholder = "내용을 입력해주세요." >
// ${self.drawlist.get(this.itemid).placeItem ?  self.drawlist.get(this.itemid).placeItem.txt == "" ? '' : self.drawlist.get(this.itemid).placeItem.txt : ''}</textarea><br>
//     <div id="preview${this.itemid}" style="width:400px; height:170px; background:#fff; ">
//      ${self.drawlist.get(this.itemid).placeItem ? self.drawlist.get(this.itemid).placeItem.img_url == null ? 
//       '<div style="text-align: center; line-height: 170px;">이미지화면</div>' : "<img src='"+self.drawlist.get(this.itemid).placeItem.img_url +
//        "' style='width:400px; height:170px';" 
//      :'<div style="text-align: center; line-height: 170px;">이미지화면</div>' }"  >
//     </div><br>
//     <input type="file" style="width:6em"; id='input${this.itemid}' name="" class="inp-img" accept=".gif, .jpg, .png">
//     <button id='changebtn${this.itemid}' class="btn btn-inverse" style="float: right;">수정</button>
//     <button id='detailbtn${this.itemid}' class="btn btn-inverse" style="float: right; margin-right:0.5rem;">자세히보기</button>
//     <button id='cencelbtn${this.itemid}' class="btn btn-inverse" style="float: right; margin-right:0.5rem;">취소</button>
//     <button id='deletebtn${this.itemid}' class="btn btn-inverse" style="float: right; margin-right:0.5rem;">삭제</button>
//     </div>`;

    // 커스텀 오버레이를 생성합니다
    // var customOverlay =  new kakao.maps.CustomOverlay({
    //   position: new kakao.maps.LatLng(iwPosition.Ha, iwPosition.Ga),
    //   content: iwContent2,
    //   xAnchor: 0.5,
    //   yAnchor: 1.1
    // });

    // self.overlayMaps.set(this.itemid, customOverlay);
    // customOverlay.setMap(self.map);    

    // 자세히보기(메뉴판)
    // document.getElementById(`detailbtn${this.itemid}`).addEventListener('click', function(){
    //   // 메뉴판 열기
    //   self.menu_marker_line_gon_gpx_open()
    // });

    // 점(마커) ~ gpx 클릭후 - 저장을 누를때 좌표전체값(iwPosition) + subscribe넘기기용(iwPosition.Ha,iwPosition.Ga))
    // document.getElementById(`changebtn${this.itemid}`).addEventListener('click', self.exist_Revise.bind(this, this.itemid, self, iwPosition.Ha, iwPosition.Ga));
                                                                                            // 전체값(?) / id값 / self  /위도값(=Ha)     /경도값(=Ga)     
    // 점(마커) ~ gpx 클릭후 - 취소기능(오버레이만 삭제)
    // document.getElementById(`cencelbtn${this.itemid}`).addEventListener('click', function() {
    //   // 메뉴판 닫기
    //   self.menu_marker_line_gon_gpx_close();

    //   var isSelect = self.selectMarker.indexOf(overlay);
  
    //   // 점(마커)~gpx 재클릭시 오버레이제거 부분
    //   if (isSelect > -1) {
    //     var over = self.overlayMaps.get(itemid);
    //     over.setMap(null);
    //     self.selectMarker.splice(self.selectMarker.indexOf(overlay), 1); // else에서 push로 들어간것을 재클릭시 해당하는것만 오버레이 제거
    //     return;
    //   } else {
    //     self.selectMarker.push(overlay);
    //     // tool에서 사용했는 타입 변수(점,선,면)
    //   }
    // })

    // 점(마커) ~ gpx 클릭후 - 삭제기능
    // document.getElementById(`deletebtn${itemid}`).addEventListener('click', function() {
    //   var over = self.overlayMaps.get(itemid);
    //   var titleover = self.titleoverlayMaps.get(itemid);
      
    //   // 마커와 관련된 오버레이삭제
    //   over.setMap(null);
    //   titleover.setMap(null);

    //   // 백그라운드에 있는 오버레이 삭제하는것
    //   self.overlayMaps.delete(itemid);

    //   // 점,선,면,gpx 삭제
    //   var mthisMarker = self.selectMarker.filter(element => {
    //     // gpx삭제할때 element값이 없으므로 찾아야함
    //     return element.listId == itemid;
    //   });
    //   mthisMarker[0].setMap(null);
      
    //   self.selectMarker.slice(self.selectMarker.indexOf(mthisMarker[0]), 1);

    //   // (테마지도) 그리고 DB까지 모조리 삭제
    //   self.mapdelete1(place);
    // });

    // 점(마커) ~ gpx 클릭후 - 파일 넣는기능
    // document.getElementById(`input${itemid}`).addEventListener('change', self.imageFileChange.bind(this, itemid, self));
  }

   // (기존) 삭제버튼누를시 DB에서도 삭제시킴
   past_mapdelete(id) {
    let place = this.drawlist.get(id).placeItem;
    this.mapprovider.theme.delete({
        // map.ts의 api url에 cls_cd값을 넘겨줌으로서 DB에서 삭제시킴
        body: {
          map_no: this.no.map_no,
          place_no: place.place_no
        },
        responseType: 'text'
      })
      .subscribe(
        _ => {
          alert('삭제되었습니다.');
          this.ngOnInit(); // 리스트새로고침
        },
        err => {
          alert('삭제실패!');
        }
      );
  }

  // (기존) 수정하는곳
  exist_Revise(id, self, Ha, Ga) { // id => 좌표 전체값(=마커위치구분용) / self => ts자체 / Ha => 마커위도 / Ga => 마커경도
    self.searchDetailAddrFromCoords(new kakao.maps.LatLng(Ha,Ga), function(result, status) {
      if (status === kakao.maps.services.Status.OK) {
        self.address = result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name; // place테이블 실제주소값
        self.place_nm2 = (<HTMLInputElement>document.getElementById(`title${id}`)).value; // place테이블 장소명
        self.txt2 = (<HTMLInputElement>document.getElementById(`txt${id}`)).value;        // place테이블 내용
        // place테이블 점,선,면값
        self.maprevise(id, self.place_nm2, self.txt2, self.address);
      }      //  id(구분값)/self/  장소명  /   내용  /  실제주소
    });
  }

  // (기존) 수정하는곳
  maprevise(id, name, txt,  address) {
    // place테이블에 값넣어주는곳
    let formData: FormData = new FormData();
    let place = this.drawlist.get(id).placeItem;
    
    this.postData = {
      place_no: place.place_no,                               // 수정할때는 place_no값을 받아와야함
      theme_cls: 2,                                           // 테마구분 고정값2
      place_nm: name,                                         // 장소명(필수값)
      txt: txt,                                               // 내용
      lat: place.lat,                                         // 위도
      lon: place.lon,                                         // 경도
      addr1: address,                                         // 위도,경도를 통한 주소값 필요
      img_url : place.img_url,                                // 기존이미지
      thumb_url : place.thumb_url,                            // 이미지경로??
      place_figure: place.place_figure,
      points: place.points,
    }
      // 이미지도 API에 추가
      // let makerImages = (<HTMLInputElement>document.getElementById(`input${id}`)).files;

      // if (makerImages.length > 0) {
      //   // console.log('img');
      //   let img_url: File = makerImages[0];
      //   formData.append('file', img_url, img_url.name);
      // }
      // 이미지도 API에 추가      
      let img_urls: FileList = this.menu_marker_line_gon_gpx_image.nativeElement.files;

      // 이미지도 API에 추가
      if (img_urls.length > 0) {
        let img_url: File = img_urls[0];

        formData.append('file', img_url, img_url.name);
    }

    for (let key in this.postData) {
      if (this.postData[key]) {
        if (this.postData[key] instanceof Array) {
          formData.append(key, JSON.stringify(this.postData[key]));
        } else formData.append(key, this.postData[key]);
      }
    }

    // gpx 
    let gpx_list: FileList = this.inputFile2.nativeElement.files;
    if (gpx_list.length > 0) {
      // console.log('img');
      let gpx_url: File = gpx_list[0];
      formData.append('gpx', gpx_url, gpx_url.name);
    }

    this.mapprovider.place.post(formData).subscribe(
      (data: any) => {
        alert('수정이 되었습니다.');
        this.getPlaceList(place.place_no,id); // 테마페이지 새로고침
        // 저장후 오버레이 숨김
        var over = this.overlayMaps.get(id);

        // 점,선,면 관련된 오버레이삭제시킴
        // over.setMap(null);
        this.menu_open = false;
        this.marker_line_gon_gpx_place_disp = '';                   // 제목
        this.marker_line_gon_gpx_txt = '';                                 // 내용
        this.marker_line_gon_gpx_img_url = [];                         // 이미지
        this.marker_line_gon_gpx_figure_color = '';               // 컬러
      },
      err => {
        alert('수정실패!');
      }
    );
  }



  // (지도) 검색후 리스트 클릭시 좌표이동 + 해당내용의 오버레이 띄움
  mapMove_overlay(item) {
    // 좌표이동
    if(item.lat){
      this.map.panTo(new kakao.maps.LatLng(item.lat, item.lon));
    } else{
      this.map.panTo(new kakao.maps.LatLng(item.y, item.x));
    }
    
    // 마커에 저장된 place값과 db의 place값을 매칭시킨뒤 해당 값의 오버레이를 띄움
    var self = this;
    let drawinfo =  Array.from(this.drawlist.values()).filter( (drawitem:PlacedrawInfo)=>{ // 지도에 있는 place와 db의 place를 비교함
      // console.log("drawitem, item => " + drawitem, item);
      return drawitem.placeItem.place_no == item.place_no;
    });

    self.popupOverlayCreate(drawinfo[0].mapItem, item, self);                             // 매칭되는 값의 마커값, 해당마커의 오버레이를 해줌
}

  // (---------------------------------------------추가-----------------------------------------------) 점, 선, 면, 오버레이
  // (추가) 점, 선, 면, 오버레이
  addCreate(target,self){
    // 기존 마커, 선, 면, gpx 클릭시 좌표이동
    if(target.k){
      this.map.panTo(new kakao.maps.LatLng(target.k.toLatLng().Ha, target.k.toLatLng().Ga));
    } else{
      this.map.panTo(new kakao.maps.LatLng(target.Ig[0].toLatLng().Ha, target.Ig[0].toLatLng().Ga));
    }
    
    this.menu_open = true;

    // 데이터 초기화
    this.marker_line_gon_gpx_place_disp = '';               // 마커,선,면,gpx 테마지도명
    this.marker_line_gon_gpx_txt = '';                        // 마커,선,면,gpx 내용
    this.marker_line_gon_gpx_img_url = [];                    // 마커,선,면,gpx 썸네일
    this.marker_line_gon_gpx_figure_color = '';               // 선,면,gpx 색깔

    this.add_itemid = target.listId;

    // 위치값을 넣어야하는데 pgx일땐 Ig 첫번째꺼 / 선, 면일땐 Ig첫번째꺼 좌표변환 / 마커일땐 그냥 좌표변환
    var iwPosition = target.listId.includes('gpx') ? target.Ig[0] : ( target.k == undefined ? target.Ig[0].toLatLng() : target.k.toLatLng() );

    // 선,면 좌표배열(DB용)
    this.points = [];
    if (target.k == undefined) {
      for (var i = 0; i < target.Ig.length; i++) {
        this.points.push(  target.listId.includes('gpx') ? target.Ig[i] : target.Ig[i].toLatLng()); // 찍었는 좌표 갯수만큼 배열에 담음
      }
    } else if (target.k != undefined) {
      // 마커일땐 그냥 패스
    }

    // 점(마커) ~ gpx 재클릭
    var isSelect = self.selectMarker.indexOf(target);

    // 점(마커) ~ gpx 재클릭시 오버레이제거 부분
    // if (isSelect > -1) {
    //   var over = self.overlayMaps.get(itemid);
    //   over.setMap(null);
    //   self.selectMarker.splice(self.selectMarker.indexOf(target), 1); // else에서 push로 들어간것을 재클릭시 해당하는것만 오버레이 제거
    //   return;
    // } else {
    //   self.selectMarker.push(target);
    // }

    // toolbox에서 선택시 타입을 확인하여 변수로 넘김
    self.tooltype = self.drawType(target.listId);

    // 커스텀오버레이에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
//     var iwContent = `<div id='overlay${itemid}'>
//     <input id='title${itemid}' class="form-control" type="text" style="width:400px;" placeholder = "장소명을 입력해주세요." 
//     value='${self.drawlist.get(itemid).placeItem ?  self.drawlist.get(itemid).placeItem.place_disp : ''}'><br>
//     <textarea id='txt${itemid}' class="form-control" type="text" style="width:400px; height:12em; text-overflow:clip;" placeholder = "내용을 입력해주세요." >
// ${self.drawlist.get(itemid).placeItem ?  self.drawlist.get(itemid).placeItem.txt == "" ? '' : self.drawlist.get(itemid).placeItem.txt : ''}</textarea><br>
//     <div id="preview${itemid}" style="width:400px; height:170px; background:#fff; ">
//      ${self.drawlist.get(itemid).placeItem ? self.drawlist.get(itemid).placeItem.img_url == null ? 
//       '<div style="text-align: center; line-height: 170px;">이미지화면</div>' : "<img src='"+self.drawlist.get(itemid).placeItem.img_url + 
//       "' style='width:400px; height:170px';" :'<div style="text-align: center; line-height: 170px;">이미지화면</div>' }" >
//     </div><br>
//     <input type="file" style="width:6em"; id='input${itemid}' name="" class="inp-img" accept=".gif, .jpg, .png">
//     <button id='savebtn${itemid}' class="btn btn-inverse" style="float: right;">저장</button>
//     <button id='deletebtn${itemid}' class="btn btn-inverse" style="float: right; margin-right:0.5rem;">
//     ${self.drawlist.get(itemid).placeItem ? '삭제 ': '취소'}</button>
//     </div>`;
//     // 커스텀 오버레이를 생성합니다
//     var customOverlay = new kakao.maps.CustomOverlay({
//       position: new kakao.maps.LatLng(iwPosition.Ha, iwPosition.Ga),
//       content: iwContent,
//       xAnchor: 0.5,
//       yAnchor: 1.1
//     });

    // id와 오버레이를 map에 담음
    // self.overlayMaps.set(itemid, customOverlay);

    // 지도에 오버레이 출력
    // customOverlay.setMap(self.map);

    // 점(마커) ~ gpx 클릭 - 저장기능
    // document.getElementById(`savebtn${itemid}`).addEventListener('click', self.add_Save_Revise.bind(this, itemid, self, iwPosition.Ha, iwPosition.Ga, points, target));

    // 점(마커) ~ gpx 클릭 - 취소기능(오버레이삭제 + 점,선,면 삭제)
    // document.getElementById(`deletebtn${itemid}`).addEventListener('click', function() {
    //   // id값을 가져와서
    //   var over = self.overlayMaps.get(itemid);

    //   // 점,선,면 관련된 오버레이삭제시킴
    //   over.setMap(null);

    //   // 백그라운드에 있는 오버레이 삭제하는것
    //   self.overlayMaps.delete(itemid);

    //   // 취소클릭시 점,선,면도 삭제
    //   var mthisMarker = self.selectMarker.filter(element => {
    //       return element.listId == itemid;
    //   });
    //   mthisMarker[0].setMap(null); // 점,선,면 삭제
    //   self.selectMarker.slice(self.selectMarker.indexOf(mthisMarker[0]), 1);
    //   if(itemid.includes('gpx'))
    //   {
    //     self.inputFile2.nativeElement.value = "";
    //   }

    //   // 저장후 place_no값이 생기는데 그걸 토대로 삭제(=취소)를 누를시 DB에서 삭제시킴)
    //   if(self.drawlist.get(itemid).placeItem){
    //     self.mapdelete2(self.drawlist.get(itemid).placeItem.place_no);
    //   }
    // });

    // // 점(마커) ~ gpx 클릭 - 파일 넣는기능
    // document.getElementById(`input${itemid}`).addEventListener('change', self.imageFileChange.bind(this, itemid, self));
}

// (추가한뒤) 삭제버튼누를시 DB에서도 삭제시킴
// mapdelete2(place) {
//   this.mapprovider.theme.delete({
//       // map.ts의 api url에 cls_cd값을 넘겨줌으로서 DB에서 삭제시킴
//       body: {
//         map_no: this.no.map_no,
//         place_no: place
//       },
//       responseType: 'text'
//     })
//     .subscribe(
//       _ => {
//         alert('삭제되었습니다.');
//         this.getPlaceList(this.mapdata.place_no,this.id); // 테마페이지 새로고침
//       },
//       err => {
//         alert('삭제실패!');
//       }
//     );
// }

  // (추가) 선택했는 기능(마커, 선, 다각형, GPX)을 사용할때 Id값이 매칭될경우 해당값(타입)을 리턴시킴
  drawType(listId)
  {
    let type = 'marker';
    if(listId.includes('marker'))
      type = 'marker';
    else if(listId.includes('polyline'))
      type = 'polyline';
    else if(listId.includes('polygon'))
      type = 'polygon';
    else if(listId.includes('gpx'))
      type = 'gpx';

    return type;
  }

  // (추가인듯?) GPX버튼 (1번)
  selectOverlay(type) {
    // 마커,선,다각형 사용중일때 gpx버튼 클릭하면 마커,선,다각형 사용을 취소합니다.
    this.manager.cancel();

    this.manager.select(kakao.maps.drawing.OverlayType[type]);
  }
  // 
  gpxstart(type){
    // -- 파일부르기
    var ua = window.navigator.userAgent; // console.log("ua2=>"+ ua);
    var msie = ua.indexOf('MSIE'); // console.log("msie2=>"+ msie);
    var trident = ua.indexOf('Trident/'); // console.log('trident2=>' + trident);
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

  // (추가인듯?) GPX파일인지 확인 (2번)
  checkGpxFile($event) {
    var self = this;
    let files: FileList = $event.target.files;
    // console.log('[checkFileType]' + JSON.stringify($event.target.files));
    if (files.length > 0) {
      let file: File = files[0];
      if (!file.name.includes('.gpx')) {
        alert('GPX만 업로드 가능합니다.');
        $event.target.value = '';
      } else {
        var fr = new FileReader();
        fr.onload = () => {
          // parseGpxFile.parseFile('./my-gpx-file.gpx').then(gpx => console.log('[fr.result]' + JSON.stringify(gpx)));
          //   gpxParse.parseGpxFromFile(fr.result, function(error, data) {
            
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(<string>fr.result,"text/xml");
        let items = this.get_gpx_data(xmlDoc.documentElement,[]);

          var polyline = new kakao.maps.Polyline({
            map: this.map,
            path: items,
            strokeWeight: 5,
            strokeColor: '#FF00FF',
            strokeOpacity: 0.8,
            strokeStyle: 'line'
        });
         var drawItem = new PlacedrawInfo(polyline,undefined);
         let mapkey =  self.createdrawId('gpx');
         polyline.listId =   mapkey; 
         polyline.gpxfile = file;
         self.drawlist.set(mapkey, drawItem); 

            kakao.maps.event.addListener(polyline, 'click', function() {
              self.addCreate(polyline, self);
            });
        };
        fr.readAsText(files[0], 'utf-8');
      }
    }
  }

  // (추가인듯?) GPX 파싱 (3번) , 여기서 gpx파일안에 좌표값들을 trkpt에 담아서 result에 담아 지도에 출력시킴
  get_gpx_data(node, result) {
    switch (node.nodeName) {
      case 'trkseg':
        for (var i = 0; i < node.childNodes.length; i++) {
          var snode = node.childNodes[i];
          if (snode.nodeName == 'trkpt') {
            let trkpt = new kakao.maps.LatLng(parseFloat(snode.attributes['lat'].value),parseFloat(snode.attributes['lon'].value));     
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

  // (추가) 점, 선, 면 저장 및 수정하는곳
  add_Save_Revise(id, self, Ha, Ga, points) { // id => 좌표 전체값(=마커위치구분용) / self => ts자체 / Ha => 마커위도 / Ga => 마커경도 / points => 선,면 좌표들
    self.searchDetailAddrFromCoords(new kakao.maps.LatLng(Ha,Ga), function(result, status) {
      // 좌표값받아서 실제주소값 확인
      if (status === kakao.maps.services.Status.OK) {
        const address = result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name; // place테이블 실제주소값
        self.place_nm = (<HTMLInputElement>document.getElementById(`title${id}`)).value; // place테이블 장소명
        self.txt = (<HTMLInputElement>document.getElementById(`txt${id}`)).value; // place테이블 내용
        self.Ha = JSON.stringify(Ha); // place테이블 위도값
        self.Ga = JSON.stringify(Ga); // place테이블 경도값

        if (self.tooltype == 'marker') {
          // place테이블 점,선,면값
          var place_figure = 1;
        } else if (self.tooltype == 'polyline') {
          var place_figure = 2;
        } else if (self.tooltype == 'polygon') {
          var place_figure = 3;
        } else {
          var place_figure = 4; // gpx(경로)
        }

        if (place_figure == 1 || place_figure == 4) {
          // 선,다각형(2,3)일때는 points 미사용
          self.mapsave(id, self.place_nm, self.txt, self.Ha, self.Ga, address, place_figure);
        } else {      //       장소명    /   내용   /  위도  /   경도  /실제주소 /점,선,면구분 /선,면 좌표배열
          // 마커(1)일때는 points 사용
          self.mapsave(id, self.place_nm, self.txt, self.Ha, self.Ga, address, place_figure, points);
        }
      } 
    });
  }

  // (추가) 저장 및 수정하는곳
  mapsave(id, name, txt, Ha, Ga, address, place_figure) {
    // (1번째) place테이블에 값넣어주는곳
    let formData: FormData = new FormData();

    var self = this;
    // this.id = id;
    // DB에 있는값인지 체크하는용
    // let insertcheck = this.place_list.filter(function(element) {
    //   // return element.lat == Ha && element.lon == Ga;
    //   return element.place_no == drawli;
    // });

    var drawItem = self.drawlist.get(id);
    if(drawItem.mapItem.listId.includes('marker')){
      this.postData = {
        theme_cls: 2, // 테마구분 고정값2
        place_nm: name, // 장소명(필수값)
        txt: txt, // 내용
        lat: drawItem.k.toString().Ha, // 위도
        lon: drawItem.k.toString().Ga, // 경도
        addr1: address, // 위도,경도를 통한 주소값 필요
        place_figure: 1,
      };
    } else if(drawItem.mapItem.listId.includes('polyline')){
      this.postData = {
        theme_cls: 2, // 테마구분 고정값2
        place_nm: name, // 장소명(필수값)
        txt: txt, // 내용
        lat: drawItem.mapItem.Ig[0].toString().Ha, // 위도
        lon: drawItem.mapItem.Ig[0].toString().Ga, // 경도
        place_figure: 2,
        points: this.points   // 선,면 좌표들
      }
    }


    for (let key in this.postData) {
      if (this.postData[key]) {
        if (this.postData[key] instanceof Array) {
          formData.append(key, JSON.stringify(this.postData[key]));
        } else formData.append(key, this.postData[key]);
      }
    }
    // 이미지도 API에 삽입
    // let makerImages = (<HTMLInputElement>document.getElementById(`input${id}`)).files;

    // if (makerImages.length > 0) {
    //   // console.log('img');
    //   let img_url: File = makerImages[0]  ? makerImages[0] : drawItem.placeItem.img_url;;
    //   formData.append('file', img_url, img_url.name);
    // }
    let img_urls: FileList = this.menu_marker_line_gon_gpx_image.nativeElement.files;

    // 이미지도 API에 추가
    if (img_urls.length > 0) {
      let img_url: File = img_urls[0];

      formData.append('file', img_url, img_url.name);
  }
    
    // gpx id값을 통해서 DB에 넣음
    var item:any = drawItem.mapItem;
    if (item.gpxfile) {
      // console.log('img');
      formData.append('gpx', item.gpxfile, item.gpxfile.name);
    }
    this.mapprovider.place.post(formData).subscribe(
      (data: any) => {
        // 최초 추가할때
        alert('저장되었습니다.');
        // (2번째post) place테이블에 값이 들어간뒤 + map_theme_place에 값을 넣어서 place - map_theme - map_theme_place를 연결해주는곳
        // 최초 저장할때엔 this.mapdata가 없으므로(response로 받는것이다.) else로 들어간뒤 this.mapprovider.theme.placePost가 실행된다.(insert)
        // 저장한 이후에는 this.mapdata가 생긴이후로 다시 저장누를때는 if로 들어가서 2번째부터는 post를 안시키는것(update)

        // 추가직후 리스트에서 선,면 클릭시 코드변환이 안되서 오류가 뜸/ 그래서 여기서 미리변환시킨 값을 임의로 추가해서 사용함 ( popupOverlayCreate() 여기서 사용함 )
        if(place_figure != 1){
            if(item.listId.includes('gpx')){        // gpx일땐 좌표변환 안해도됨
              item = {
                ...item,
                customIg: item.Ig[0]
              };
            }else{                                  // 선, 면일땐 좌표변환 해야함
              item = {
                ...item,
                // customIg: item.Ig[0].toLatLng()     
              };
            }
          drawItem.mapItem = item;
          self.drawlist.set(id,drawItem);
       }

        // 추가직후 바로 수정할때 일로감
        if (drawItem.placeItem) {
          alert('수정이 되었습니다.');
          this.getPlaceList(data.place_no,id); // 테마페이지 새로고침

          // 저장후 오버레이 숨김
          var over = this.overlayMaps.get(id);

          // 점,선,면 관련된 오버레이삭제시킴
          over.setMap(null);
        } else {
          // 저장할때 해당 place_no값을 리턴받아서 this.mapdata에 넣음
          this.mapdata = data.place_no;
          this.mapprovider.theme.placePost({
              map_no: this.no.map_no, // 해당 페이지(게시글) map_no값
              place_no: data.place_no // 1번째서 response받은걸로 넣어야함
            }).subscribe(
              _ => {
                alert('저장되었습니다.');
                this.getPlaceList(data.place_no,id); // 테마페이지 새로고침

                // 저장후 오버레이 숨김
                var over = this.overlayMaps.get(id);

                // 점,선,면 관련된 오버레이삭제시킴
                over.setMap(null);
                this.ngOnInit();
              },
              err => {
                alert('저장실패!');
              }
            );
        }
      },
      err => { // 장소명이 없을때 예외처리되는데 장소명은 필수값이다.
        alert('장소명을 적어주세요.');
      }
    );
  }

  // ------------------------------------------------------------------------- 그 외에 기능들
    // (지도)검색기능
    searchPlaces() {
      var keyword = (<HTMLInputElement>document.getElementById('keyword')).value;

      if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
      }

      // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
      var self = this;
      this.ps.keywordSearch(keyword, function(data, status) {
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
    search_place_chance() {
      this.search_check = false;
      this.places_List = true;
      (<HTMLInputElement>document.getElementById('keyword')).value = '';
    }
    // (지도) 검색후 리스트 클릭시 좌표이동
    mapMove(item) {
      // console.log(JSON.stringify(item));
      if(item.lat){
        this.map.panTo(new kakao.maps.LatLng(item.lat, item.lon));
      } else{
        this.map.panTo(new kakao.maps.LatLng(item.y, item.x));
      }
    }


    // (공통) 이미지파일 넣는기능
    imageFileChange(id, self, event) {
      // console.log(JSON.stringify(event.target.files));
  
      let files: FileList = event.target.files;
  
      // console.log('[checkFileType]' + JSON.stringify( event.target.files));
      if (files.length > 0) {
        let file: File = files[0];
        if (!file.type.includes('image/')) {
          alert('이미지만 업로드 가능합니다.');
          event.target.value = '';
        } else {
          var fr = new FileReader();
          fr.onload = () => {
            document.getElementById(`preview${id}`).innerHTML = '<img src=' + fr.result + ' width=400px height=170px >';
          };
          fr.readAsDataURL(files[0]);
        }
      }
    }

  // (공통) 타입에 맞게 인덱스값 증가후 리턴
  createdrawId(overlayType)
  {
    let mapkey ='';
    switch(overlayType)
    {
      case 'marker':
          mapkey =`marker${this.markerindex}`;
          this.markerindex++;
        break;
      case 'polyline':
          mapkey =`polyline${this.lineindex}`;
          this.lineindex++;
        break;
      case 'polygon':
          mapkey =`polygon${this.gonindex}`;
          this.gonindex++;
        break;
      case 'gpx':
         mapkey =`gpx${this.gpxindex}`;
         this.gpxindex++;
          break;
      default:
        break;
    }
    return mapkey;
  }

  // ------------------------------------------------------------------------------------------------------ 잡다한 내용들
  // 좌표를 통한 실제 주소(DB)
  searchDetailAddrFromCoords(coords, callback) {
    // 좌표로 법정동 상세 주소 정보를 요청합니다
    this.geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
  }

  // 모달창
  openModal(content, size = null, customClass = null) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: size, windowClass: customClass }).result.then(
      result => {
        // console.log(`Closed with: ${result}`);
      },
      reason => {
      }
    );
  }

  // 메뉴 열기
  menu_marker_line_gon_gpx_open(){
    this.menu_open = true;
  }

  // 메뉴 닫기
  menu_marker_line_gon_gpx_close(){
    this.menu_open = false;
  }

  // 메뉴 이미지 추가
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

  // 이미지인지 확인
  menu_marker_line_gon_gpx_checkFileType($event) {
    // 이미지넣을때 무조건 초기화
    this.marker_line_gon_gpx_img_url = [];
    let files: FileList = $event.target.files;
    // console.log('[checkFileType]' + JSON.stringify($event.target.files));
    if (files.length > 0) {
      let file: File = files[0];
      if (!file.type.includes('image/')) {
        alert('이미지만 업로드 가능합니다.');
        $event.target.value = '';
      } else {
        var fr = new FileReader();
        fr.onload = () => {
          if (this.marker_line_gon_gpx_img_url.length < 1) this.marker_line_gon_gpx_img_url.push(fr.result);
        };
        fr.readAsDataURL(files[0]);
      }
    }
  }
  menu_marker_line_gon_gpx_deleteFile(index) {
    this.marker_line_gon_gpx_img_url.splice(index, 1);
  }







  themeEditOpen(map_no) {
    this.router.navigate(['map/themeedit'],{ queryParams: { map_no }});
  }
}

// 지도에 있는 데이터와 DB의 데이터를 담는 구조
export class PlacedrawInfo
{
   mapItem:any = undefined;   // map 데이터
   placeItem:any = undefined; // DB 데이터

   constructor(mapItem ,placeItem)
   {
      this.mapItem = mapItem;
      this.placeItem = placeItem;
   }
}
