import { Component, OnInit, ViewChild, ElementRef, Renderer } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms';
import { MapProvider } from '../../../providers/map';
//test용
import { ResourceService } from '../../../services/resource.service';
import { LoginSession } from '../../../services/login.session';
import { OneStopProvider } from '../../../providers/onestop';
import { UserProvider } from '../../../providers/user';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { API } from '../../../../config';
import { element } from '@angular/core/src/render3/instructions';
import { link } from 'fs';
import { i8 } from '@angular/core/src/render3';

declare let daum: any;

@Component({
  selector: 'itsm-cls',
  templateUrl: './cls.component.html',
  styleUrls: ['./cls.component.scss']
})
export class ClsComponent implements OnInit {

  @ViewChild("inputFile1") inputFile1: ElementRef;
  @ViewChild("inputFile2") inputFile2: ElementRef;
  @ViewChild("inputFile3") inputFile3: ElementRef;
  @ViewChild("inputFile4") inputFile4: ElementRef;
  @ViewChild('clsForm1') clsForm1: FormControl;
  @ViewChild('clsForm2') clsForm2: FormControl;

  // level1 변수
  data:Array<any> = [];                          // 레벨1 리스트
  selectlev1Index = -1;                          // 레벨1의 인덱스값 -> cls_cd(생활(0) ~ 상가(4))
  cls1: any = { };                               // 클릭한 레벨1의 정보
  edit1: boolean = false;                        // 레벨1 수정할때 필요한 화면(버튼)

  // level2 변수
  data2 = [];                                    // 레벨2 리스트
  edit2: boolean = false;                        // 레벨2 수정할때 필요한 화면(버튼)
  lv2_cls_cd;                                    // 레벨2 클릭시 넘겨받을 cls_cd값
  cls2: any = { };                               // 클릭한 레벨2의 정보
  lv2_admindata: any = [];                       // 레벨2에 속한 담당자정보
  selectedLinkList: Array<any> = [];             // 사용안하는 링크(안쓰는데 필요함)

  // (레벨2) 마커이미지
  body: any = {};
  image1: string | ArrayBuffer = '';
  image2: string | ArrayBuffer = '';
  image3: string | ArrayBuffer = '';
  image4: string | ArrayBuffer = '';

  // 모달관련
  selectedOrgId: number = 1;                     // (담당자모달) 고정값1
  org: number = 1;                               // (담당자모달) 고정값2
  orgs: any = [];                                // (담당자모달) 고정값3
  tempIdx: number = 0;                           // (담당자모달) 고정값4
  assign_popup_type: number = 0;                 // (담당자모달) 고정값5
  selectedPopupTab: number;                      // (담당자모달) 고정값6 -> 밑에 0으로 되어있음 0=> 인명(공무원)
  partner_nm: string = "";                       // (담당자모달) 검색이름
  q;                                             // (담당자모달) 검색이름2
  orgUserList: Array<any> = [];                  // (담당자모달) 검색후 검색에 해당되는 담당자리스트
  admin_name = '';                               // 담당자모달에서 선택한 담당자이름
  admin_dept_nm  = '';                           // 담당자모달에서 선택한 담당자소속/직책
  admin_phone = '';                              // 담당자모달에서 선택한 담당자번호



  // 행정지역 변수
  administrative_division_list: Array<any> = [];  // (행정지역모달) 행정지역리스트(전체)
  Administrative_division: Array<any> = [];       // 전체에서 선택한 행정지역리스트
  admin_cd = '';

  
  tempSelectedUserList2: Array<any> = [];         // 담당부서리스트
  depts: Array<any> = [];

  constructor(public mapprovider: MapProvider, private modalService: NgbModal, public renderer: Renderer,
    private resourceService: ResourceService, private session: LoginSession,private oneStop: OneStopProvider,
    private userProvider: UserProvider, private http: HttpClient) { }

  ngOnInit() {
    this.getCode();
    // this.getBigCategory(); // 바로응답분류리스트를 미리 실행시켜놓아서 바로응답분류 검색시 모달에 바로 적용시킴
  }


  initData(type){
    switch(type)
    {
      case 1:
          this.cls1 = {
            cls_cd: undefined,
            cls_nm: undefined,
            disp_ord: undefined,
            lvl:1,
            use_yn: "1"
          };
        break;
      case 2:
          this.cls2  = {
            cls_cd: undefined,
            cls_nm: undefined,
            lvl: 2,
            upper_cd: this.cls2.upper_cd,
            maker_img: undefined,
            etc: undefined,
            disp_ord: undefined,
            use_yn: "1",
            links: [
              {
                link_cls: undefined,
                link_ref: undefined
              }
            ]
          };
          break;
    }
  }

// itsm-tree-view 지정해주는곳
  getCode(lev1Index = -1) {
    this.data = [];
      this.mapprovider.cls.getSearch(1)
      .subscribe((level1: any) => {
        this.mapprovider.cls.getSearch(2)
        .subscribe((level2: any) => {

             let customlv1 = []; // api에있는 데이터를 담을 배열 93p에서 push하여 사용할예정

            level2.forEach(element => {
              customlv1.push({
                ...element,
                lvl: 2,                                        // 레벨2 즉, 두번째 서브메뉴
                name: `${element.cls_nm} (${element.cls_cd})`, // ex.생활(1) 안에 있는 서브메뉴들(주민센터(6), 무인민원발급기(7)) 출력시키는부분
                expanded: false,
                sub: []                                        // 레벨2 상자이미지
              });
            });                                                // 요약 - 두번째 서브메뉴 선언 + 출력(tree-view에서)을 해줌

            // forEach가 2개있는데 연결 for문이 아니고 별개의 for문임

            level1.forEach(element => {
              let item = {
                 ...element,
                lvl: 1,                                         // 레벨1 즉, 첫번째 서브메뉴
                name: `${element.cls_nm} (${element.cls_cd})`,  // 이 부분이 생활(1), 교통(2), 의료(3) 출력시키는부분 (name은 tree-view.component.html에 있음) 
                expanded: false,
                sub:[],
                lv2:  customlv1.filter(lv2=>{                   // customlv2에서 조건에 맞는거만 리턴시킨다.
                  return lv2.upper_cd == element.cls_cd;        // 조건은 lv2.upper_cd와 element.cls_cd가 맞는것만
                                                                // ex. 생활은 cls_cd가 1이고 주민센터는 upper_cd가 1이라서 연결해주는것
                })
              }                                                 // 요약 - 첫번째 서브메뉴선언 + 조건에 맞는것만 첫번째 서브메뉴에 두번째 서브메뉴를 정의 및 붙여주고 출력(tree-view에서)함
            this.data.push(item);                               // LV1 + LV2 전부다 있음
            });
              // 2차분류에서 분류추가할때 2차분류 서브메뉴를 새로불러들임()
               if (lev1Index > -1) {
                  this.data2 = this.data[lev1Index].lv2;
                }
           });
      });
    }

  // 레벨2 클릭시 해당 데이터를 가져옴
  select(lvl, cls123) {
  if(lvl == 1) {                                              // 레벨1에 관한 데이터들 (분류명 ~ 표시순서)
    this.edit1 = true;                                        // 레벨1 오른쪽창 뛰움(수정창)
    this.cls1 = { ...cls123 };                                // 클릭한 레벨1의 정보

    this.selectlev1Index = this.data.indexOf(cls123);         // 레벨1 클릭한 인덱스값(생활(0) ~ 상가(5)) -> 클릭시 해당하는 레벨2값들을 가져와야함
    this.data2 = this.data[this.selectlev1Index].lv2;         // 레벨1 클릭에 해당하는 레벨2 리스트

    this.lv2_cls_cd = '';                                     // 레벨2 cls_cd 초기화(안하면 레벨2마지막 클릭했던게 update가 되버림)
    this.edit2 = false;                                       // 레벨2 오른쪽창 화면 초기화(등록창)
    this.initData(2);                                         // 레벨2 오른쪽창 정보들 초기화
    this.selectedLinkList = [];                               // 레벨2 담당부서 초기화
    // this.clearimg(); this.clearimg2(); this.clearimg3(); this.clearimg4(); // 레벨2 이미지들 초기화

  } else {                                                    // 레벨2에 관한 데이터들(분류명 ~ 마커이미지)
    this.data2 = this.data[this.selectlev1Index].lv2;         // 레벨2 리스트(186p 에서 LV2로 지정된것만 data2에 넣음)
    this.lv2_cls_cd = cls123.cls_cd;                          // 클릭한 레벨2의 cls_cd
    this.cls2 = cls123;                                       // 클릭한 레벨2의 정보
    this.edit2 = true;                                        // 레벨2 오른쪽창 뛰움(수정창)
    this.selectedLinkList = [];                               // 레벨2 담당부서 초기화

    this.mapprovider.cls.getOne(cls123.cls_cd)
    .subscribe(element => {
      this.cls2 = {
        ...cls123,
        ...element
      };
      console.log(this.cls2);
      this.selectedLinkList = this.cls2.links;
    }, error => {

     });
    }
  }


  // 새분류추가
  newCategory(level) {
    if(level == 1) {
      this.edit1 = false;                                                    // 레벨1 오른쪽창 화면 초기화(등록창)
      this.initData(1);                                                      // 레벨1 오른쪽창 데이터 초기화
    } else {
      this.edit2 = false;                                                    // 레벨2 오른쪽창 화면 초기화(등록창)
      this.lv2_cls_cd = '';                                                  // 클릭시 얻은 cls_cd 초기화(안하면 update가 되버림)
      this.initData(2);                                                      // 레벨2 오른쪽창 데이터 초기화
      this.clearimg(); this.clearimg2(); this.clearimg3(); this.clearimg4(); // 이미지들 초기화
      this.selectedLinkList = [];                                            // 담당부서 초기화
    }
  }

  // 1차분류 저장기능
  save1() {
    if (confirm(this.edit1 ? "저장하시겠습니까?" : "추가하시겠습니까?")) {
      this.mapprovider.cls.post({
        ...this.cls1,         // save를 누를때 api속성들을 연결해줌
        lvl:1,                 // 분류추가할때 api에 없는 lvl을 2로 지정해줘야 값이 넘어감
  }).subscribe(_=>{
        alert('저장되었습니다.');
        this.initData(1);
        this.getCode();            // 실시간으로 데이터를 처리하는듯함
      }, err=>{
        alert('저장실패!');
      });
    }
  }


  // 2차분류 저장 + 수정
  save2() {
    if (confirm( this.edit2 ? "저장 하시겠습니까?" : "추가 하시겠습니까?")) {
      let formData: FormData = new FormData();
      let files1: FileList = this.inputFile1.nativeElement.files;
      let files2: FileList = this.inputFile2.nativeElement.files;
      let files3: FileList = this.inputFile3.nativeElement.files;
      let files4: FileList = this.inputFile4.nativeElement.files;

      let postData = {
        ...this.cls2,
        lvl: 2,
        cls_cd : null  ? null : this.lv2_cls_cd,     // 분류최초저장직후 바로 수정할때 response.cls_cd(update) /  아니면 insert
        upper_cd: this.cls1.cls_cd,
        user_no: this.session.profile.user_no,
        links: this.selectedLinkList
       };

      for(let key in postData){
        if (postData[key]) {
          if (postData[key] instanceof Array) {
            formData.append(key, JSON.stringify(postData[key]));
          } else {
            formData.append(key, postData[key]);
          }
        }
      }

      if (files1.length > 0){
        // console.log('img');
        let file: File = files1[0];
        formData.append('marker_img1', file, file.name);
      }

      if (files2.length > 0){
        // console.log('img');
        let file: File = files2[0];
        formData.append('marker_img2', file, file.name);
      }

      if (files3.length > 0){
        // console.log('img');
        let file: File = files3[0];
        formData.append('marker_img3', file, file.name);
      }

      if (files4.length > 0){
        // console.log('img');
        let file: File = files4[0];
        formData.append('marker_img4', file, file.name);
      }

      // 분류명 ~ 마커이미지
      this.mapprovider.cls.post(formData).subscribe( data => {
        alert('저장되었습니다.');
        this.edit2 = false;                        // 레벨2 오른쪽창 화면 초기화(등록창)
        this.lv2_cls_cd = '';                      // 초기등록후 받은 분류cd값을 초기화
        this.initData(2);
        this.selectedLinkList = [];                // 담당부서 초기화면
        this.getCode(this.selectlev1Index);        // 레벨2 재갱신
        this.clearimg();                           // 이미지1 삭제
        this.clearimg2();                          // 이미지2 삭제
        this.clearimg3();                          // 이미지3 삭제
        this.clearimg4();                          // 이미지4 삭제
      }, err => {
        alert('저장실패!');
      });
    }
  }

  // 삭제기능
  delete1() {
    if (confirm('삭제하시겠습니까?')) {
      this.mapprovider.cls.delete({
        cls_cd: this.cls1.cls_cd,
      }).subscribe(_ => {
        alert('삭제되었습니다.');
        this.getCode();                         // 레벨1 리스트 재갱신
        this.edit1 = false;                     // 레벨1 초기화면(분류새등록)
        this.initData(1);                       // 레벨1 데이터 초기화
        }, err => {
        alert('삭제실패!');
      });
    }
  }

  // 삭제기능
  delete2() {
    var cls_cd = this.lv2_cls_cd.cls_cd;
    if (confirm('삭제하시겠습니까?')) {
      this.mapprovider.cls.delete({
        cls_cd: this.cls2.cls_cd ? this.cls2.cls_cd : cls_cd,                     // 레벨2클릭시 받는 분류번호가 없을땐 분류추가시 response받은 값을 넣으면됨(2가지상황뿐임)
      }).subscribe(_ => {
        alert('삭제되었습니다.');
        this.getCode(this.selectlev1Index);                                       // 레벨2 리스트 재갱신
        this.initData(2);                                                         // 레벨2 데이터 초기화
        this.clearimg();  this.clearimg2();  this.clearimg3();  this.clearimg4(); // 이미지 삭제
        this.selectedLinkList = [];                                               // 담당부서 초기화면
        this.edit2 = false;                                                       // 레벨2 초기화면(분류새등록)
        this.lv2_cls_cd = '';                                                     // 초기등록후 받은 분류cd값을 초기화
      }, err => {
        alert('삭제실패!');
      });
    }
  }

  // 마커이미지1
  checkFileType1($event) {
    let files: FileList = $event.target.files;
    if (files.length > 0) {
      let file: File = files[0];
      if (!file.type.includes('image/')) {
        alert('이미지만 업로드 가능합니다.');
        $event.target.value = '';
      } else {
        var fr = new FileReader();
        fr.onload = () => {
          if (this.cls2.marker_img1 != null) {
            this.cls2.marker_img1  = fr.result;
          } else {
            this.image1 = fr.result;
          }
        };
        fr.readAsDataURL(files[0]);
      }
    }
  }
  // 마커이미지2
  checkFileType2($event) {
    let files: FileList = $event.target.files;
    if (files.length > 0) {
      let file: File = files[0];
      if (!file.type.includes('image/')) {
        alert('이미지만 업로드 가능합니다.');
        $event.target.value = '';
      } else {
        var fr = new FileReader();
        fr.onload = () => {
          if (this.cls2.marker_img2 != null) {
            this.cls2.marker_img2  = fr.result;
          } else{
            this.image2 = fr.result;
          }
         };
        fr.readAsDataURL(files[0]);
      }
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
          if(this.cls2.marker_img3 != null) {
            this.cls2.marker_img3  = fr.result;
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
          if (this.cls2.marker_img4 != null) {
            this.cls2.marker_img4  = fr.result;
          } else {
            this.image4 = fr.result;
          }
        };
        fr.readAsDataURL(files[0]);
      }
    }
  }

  openFile1() {
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
  openFile2() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');
    var trident = ua.indexOf('Trident/');
    if (msie > 0 || trident > 0) {
        this.inputFile2.nativeElement.click();
    } else {
      let event = new MouseEvent('click', { bubbles: true });
      this.renderer.invokeElementMethod(this.inputFile2.nativeElement, 'dispatchEvent', [event]);
    }
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

  clearimg() {
    this.image1 = null;
    this.cls2.marker_img1 = null;
    this.inputFile1.nativeElement.value =null;
  }
  clearimg2() {
    this.image2 = null;
    this.cls2.marker_img2 = null;
    this.inputFile2.nativeElement.value =null;
  }
  clearimg3() {
    this.image3 = null;
    this.cls2.marker_img3 = null;
    this.inputFile3.nativeElement.value =null;
  }
  clearimg4() {
    this.image4 = null;
    this.cls2.marker_img4 = null;
    this.inputFile4.nativeElement.value =null;
  }

  // 모달------------------------------------------------------------------------------------------------
  openAsgnPopup2(content, i, type, search) {
    this.tempIdx = i;
    this.assign_popup_type = type;
    this.resourceService.getOrg(4)
      .then((_:any) => this.orgs = _);
    this.org = this.session.checkAdminAndGetOrg() == -1 ? 1 : this.session.checkAdminAndGetOrg();
    this.openModal(content, null, 'customModal');
    this.setOrg(1);                                    // 담당부서
  }

  changePopupTab(idx) {
    this.selectedPopupTab = idx;
  }

  openModal(content, size = null, customClass=null){
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', size:size, windowClass:customClass }).result.then((result) => {
    }, (reason) => {
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  // 담당부서 선택
  selectTempUsers2() {
    if(this.tempSelectedUserList2.length == 0) {
      alert('선택된 담당자가 없습니다.');
      return ;
      }
      this.tempSelectedUserList2.forEach(element => {
        this.addRow(2,element);
      });

      this.tempSelectedUserList2 = [];

      this.modalService.dismissAll();
  }

  // 분류 - 선택된 내용들
  addRow(link_cls,user) {
    var item = {
     link_cls: link_cls,
     link_ref: user.id,
     link_ref_nm: user.node_nm
   };
   // 중복값 확인
   var index = this.selectedLinkList.findIndex(element => {
     // console.log("==============user============"+JSON.stringify(user)); //중복값 확인
     return (element.link_ref_nm == user.name && element.link_ref == user.id);
   });

   if(index > -1 ){
     alert(user.name + ' 은(는) 이미 추가된 항목입니다.');
     return;
 }
   this.selectedLinkList.unshift(item);
 }

   // 담당부서 체크박스
   userSelectChanged2(ev) {
    var index = this.tempSelectedUserList2.findIndex(element => {
      return (element.name == ev.name && element.id == ev.id);
    });
    if(ev.selected) {
      if(index < 0) {
        this.tempSelectedUserList2.push(ev);
      }
    }
    else {
      if(index > -1) {
        this.tempSelectedUserList2.splice(ev, 1);
      }
    }
  }
  // 담당부서 리스트 
  setOrg(org = 1) {
    this.resourceService.getDept(org, '')
      .then((_: any) => {
        let lvl1, lvl2;
        this.depts = [];
        for (let row of _) {
          let item: any = {
            id: row.id,
            orgNo: row.orgNo,
            name: row.name,
            selected: false,
            expanded: false,
            lvl: row.lvl,
            sub: [],
            node_nm: row.node_nm                            // 전체 소속
          };

          if (row.lvl == 1) {
            lvl1 = this.depts.length;
            this.depts.push(item);
          } else if (row.lvl == 2) {
            lvl2 = this.depts[lvl1].sub.length;
            this.depts[lvl1].sub.push(item);
          } else {
            if (this.depts[lvl1].sub[lvl2])
              this.depts[lvl1].sub[lvl2].sub.push(item);
            else
              this.depts[lvl1].sub.push(item);
          }
        }
      })
      .catch(err => console.error(err));
  }

  // 담당부서 선택된거 삭제
  deleteRow(i) {
    this.selectedLinkList.splice(i, 1);
  }
}