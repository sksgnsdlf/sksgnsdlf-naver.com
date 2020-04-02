import { Component, OnInit , ViewChild} from '@angular/core';
import { MapProvider } from '../../../providers/map';
import { LoginSession } from '../../../services/login.session';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'itsm-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  @ViewChild('clsForm1') clsForm1: FormControl;

  // lv1(+ lv2)값
  data = [] ;
  // lv2 값
  data2 = [];
  // lv3 값
  list :any = [];

  // lv2의 cls_cd 값 (select, add에서 사용)
  cls_cd;

  // lv2 눌럿을때 html에서 사용
  lv2_cls_nm;

  // ?
  item = {
    report_cd : '',
    cls_cd : '',
    report_txt : '',
    disp_ord : ''
  };

  // 대분류
  place_cls1 = -1;
  // 소분류
  place_cls2 ='';

  // lv1,2,3
  selectlev1Index = -1;
  selectedLinkList: Array<any> = [];
  cls1: any = {   // 최초 페이지때 분류값이 아예없으면 API에 값을 못넘겨줘서 오류남, 그래서 값이 없음으로 기본값을 지정해줘야 API가 먹힘
    cls_cd: undefined,
    cls_nm: undefined,
    lvl: undefined,
    disp_ord: undefined,
    use_yn: 0
  };

  cls2: any = {
    cls_cd: undefined,
    cls_nm: undefined,
    lvl: undefined,
    upper_cd: undefined,
    maker_img: undefined,
    etc: undefined,
    disp_ord: undefined,
    use_yn: undefined,
    links: [
      {
        link_cls: undefined,
        link_ref: undefined
      }
    ]
  };

  secondlist = {
    report_cd: '',
    report_txt: '',
    cls_cd: '',
    disp_ord : ''
  };

  lev1Index = 0;

  addcheck: boolean = true;
  savecheck: boolean = false;


  test;
  test2;
  

  // report_no;
  // report_txt;
  // disp_ord;
  // lv2 = [];
  constructor(private mapprovider: MapProvider, public loginSession: LoginSession) { 
  }

  ngOnInit() {
    this.getCode();
  }

  getCode(lev1Index = -1) {
    this.data = [];
      this.mapprovider.cls.getSearch(1) 
      .subscribe((level1:any)=>{
        this.mapprovider.cls.getSearch(2)  
        .subscribe((level2:any)=>{

             let customlv1 = []; 

            level2.forEach(element => {
              customlv1.push({
                ...element,
                lvl: 2,
                name: `${element.cls_nm} (${element.cls_cd})`,
                expanded: false,
                sub: []
              });
            });

            level1.forEach(element => {
              let item = {
                 ...element,
                lvl: 1,
                name: `${element.cls_nm} (${element.cls_cd})`,
                expanded: false,
                sub:[],
                lv2:  customlv1.filter(lv2=>{
                  return lv2.upper_cd == element.cls_cd;
                })
              }
            this.data.push(item);
              // console.log("JSON.stringify(this.data) => " + JSON.stringify(this.data));
            });
           });
      });
    }

  // lv2,lv3 데이터를 가져옴
  select(lvl, cls123) {    
  //  console.log("cls123=>" + JSON.stringify(cls123));
  // lv1 클릭시 lv2가 나옴
  if(lvl == 1)
  {
    this.selectlev1Index = this.data.indexOf(cls123);
    // lv2 데이터
    this.data2 = this.data[this.selectlev1Index].lv2;
    // console.log("JSON.stringify(this.data2) = > " + JSON.stringify(this.data2));
  }
  // lv2 클릭시 lv3 내용이 나옴
  else{
    this.mapprovider.report.getlist(cls123.cls_cd)
    .subscribe(element=>{
      // lv3 데이터 수정후 새로값넘기는 cls_cd(reset메소드에서 사용중) + lv2클릭시 lv3표위에 이름,숫자띄움
      this.test2 = cls123.cls_cd;
      this.lv2_cls_nm = cls123.cls_nm;
      // console.log("lv2클릭 => "+ cls123.cls_nm ,cls123.cls_cd);

      // lv3 데이터담기용
      this.list = element,
      console.log("lv3값 => "+ JSON.stringify(element));

      // 분류추가시 cls_cd값 담기용
      this.cls_cd = cls123.cls_cd;

      // 서브메뉴 상세내용이 있을때 레벨2를 누를시 상세내용 초기화
      if( this.list == '' || this.list != ''){
        this.item = {
          report_cd : '',
          cls_cd : '',
          report_txt : '',
          disp_ord : ''
        };
        // + 버튼유무
        this.addcheck = true;
        this.savecheck = false;
        }
      //  console.log("this.list= > " + JSON.stringify(this.list));
      },
    );
    }
  }


  // 라디오버튼 클릭시 신고항목,표시순서 바인딩
  Detail(item){
    // 분류추가버튼 비활성화
    this.addcheck = false;
    // 저장,삭제버튼 활성화
    this.savecheck = true;
    // 라디오버튼시 해당 데이터를 담음
    this.item = {...item}
    // console.log("this.item => " + JSON.stringify(this.item));
  }

  // 저장(수정)
  save() {
    // if (confirm(this.edit1 ? "저장하시겠습니까?" : "추가하시겠습니까?")) {
      this.mapprovider.report.post({
        ...this.item,
  }).subscribe(_=>{
        alert('저장되었습니다.');
        // 저장후 데이터값 재조회
        this.reset();
        // 저장후 신고항목, 표시순서 초기화
        if( this.list == '' || this.list != ''){
          this.item = {
            report_cd : '',
            cls_cd : '',
            report_txt : '',
            disp_ord : ''
             };
            }
            // 버튼전환
            this.addcheck = true;
            this.savecheck = false;
      }, err=>{
        alert('저장실패!');
      });
  }

  // 분류추가
  add(){
    this.mapprovider.report.post({
      // 신고항목 값
      report_txt : this.item.report_txt,
      // 신고항목에 값이 없을때 post에서 cls_cd를 없앰으로 DB에 쓰레기값이 안들어가게 막음 or 신고항목에 값이 있으면 DB에 값이 들어감
      cls_cd : this.item.report_txt == '' ? '' : this.cls_cd, 
      // 추가할때 표시순서가 없을땐 기본값 1 or 적은 값을 넘김
      disp_ord : this.item.disp_ord == '' ? 1 : this.item.disp_ord
    }).subscribe(_=>{
      alert('저장되었습니다.');
      // 추가하고 데이터값 재조회
      this.reset();
      // 추가하고 신고항목, 표시순서 초기화
      if( this.list == '' || this.list != ''){
        this.item = {
          report_cd : '',
          cls_cd : '',
          report_txt : '',
          disp_ord : ''
           };
          }
          // 버튼전환
          this.addcheck = true;
          this.savecheck = false;
    }, err=>{
      alert('신고항목을 적어주세요.');
    });  
    }

  // 삭제
  delete() {
    if (confirm('삭제하시겠습니까?')) {
      this.mapprovider.report.delete({
        report_cd: this.item.report_cd,  // map.ts의 api url에 cls_cd값을 넘겨줌으로서 DB에서 삭제시킴
      }).subscribe(_=>{
        alert('삭제되었습니다.');
        // 삭제후 데이터값 재조회
        this.reset();
        // 삭제후 신고항목, 표시순서 초기화
        if( this.list == '' || this.list != ''){
          this.item = {
            report_cd : '',
            cls_cd : '',
            report_txt : '',
            disp_ord : ''
             };
            }
            // 버튼전환
            this.addcheck = true;
            this.savecheck = false;
      }, err=>{
        alert('삭제실패!');
      });
    }
  }

  // 취소(클릭시 초기화)
  cancel(){
    this.mapprovider.report.getlist(this.test2)
    .subscribe(element=>{
      // lv3 데이터담기용
      this.list = element
      if( this.list == '' || this.list != ''){
        this.item = {
          report_cd : '',
          cls_cd : '',
          report_txt : '',
          disp_ord : ''
           };
          }
        }
      );
      this.addcheck = true;
      this.savecheck = false;
  }

  // 추가, 저장, 삭제후 데이터 값 다시부르기
  reset(){
    this.mapprovider.report.getlist(this.test2)
    .subscribe(element=>{
      // lv3 데이터담기용
      this.list = element
       }
      );
  }
}
