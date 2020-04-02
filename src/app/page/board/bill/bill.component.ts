import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SocietyProvider } from '../../../providers/society';
import { ActivatedRoute, Router } from '@angular/router';
import { MaxPageSize, TB_COL_BACK_COLOR, TB_BORDER_COLOR, TB_HOVER_COLOR } from '../../../../config';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss']
})
export class BillComponent implements OnInit {
  societyList:any = [];
  postList:any = [];
  total:number = 0;
  totalPage:number = 0;
  page = 1;
  pageSize = 10;
  maxPage:number = MaxPageSize;
  collectionSize:number = 10;
  searchForm:any = {
    society_no:null,
    searchType:null,
    searchTxt:null,
    board_tab:null,
    fromDt:null,
    toDt:null,
    state:null,
    pageIndex:0,
    pageSize:10
  };
  option:any = {
    searchType:['제목', '내용', '제목+내용', '담당자'],//검색 항목
    board:[],
    state:[]
  }; // 검색 옵션들
  listTable:any = {};
  constructor(private ref:ChangeDetectorRef, private society : SocietyProvider,private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    //society list 가져오기
    this.society.get(null, 0, 0, true)
    .subscribe((data:any)=>{
      this.societyList = data.list;
    });
    this.setTable();
  }
  //init searchFrom
  initSearchForm(){
    this.searchForm = {
      society_no:(!this.searchForm.society_no || this.searchForm.society_no == 'null')? null : this.searchForm.society_no,
      searchType:null,
      searchTxt:null,
      board_tab:null,
      fromDt:null,
      toDt:null,
      state:null,
      pageIndex:0,
      pageSize:10
    };
  }
  //회원 검색 option 가져오기
  optionSelected(society_no){
    if(!society_no) return;
    this.searchForm.society_no = society_no;
    this.initSearchForm();
    //신청접수목록 가져오기(table -> 'post') 검색옵션 없이 일단 모든거 
    this.searchPost();
    //검색 옵션 가져오기
    if(this.searchForm.society_no){
      this.society.board.post.bill.getBillOption(this.searchForm.society_no)
      .subscribe((option:any)=>{
        this.option.board = option.board;
        this.option.state = option.state;
      });
    } 
    this.ref.detectChanges();
  }

  //포스트 목록 조회
  searchPost(page=null){
    if(page) this.searchForm.pageIndex = page-1;
    this.society.board.post.bill.getBillPost(this.searchForm)
    .subscribe((data:any)=>{
      this.postList = data.list;
      this.total = data.total;
      this.totalPage = Math.ceil(this.total/this.pageSize);
      this.collectionSize = this.totalPage * 10;
      this.ref.detectChanges();
      this.setTable();
    });
  }
  setTable(){
    this.listTable={
      attr:{
        col_back_color:TB_COL_BACK_COLOR,
        border_color:TB_BORDER_COLOR,
        border_yn:true,
        table_dir:'col' //col:컬럼명 제일 위에 row:컬럼명 왼쪽에
      },
      cols:[
        { value:'No.', width:'5%', align:'center'},
        { value:'제목', width:'35%', align:'center'},
        { value:'게시판', width:'20%', align:'center'},
        { value:'담당자', width:'10%', align:'center'},
        { value:'등록일자', width:'10%', align:'center'},
        { value:'진행상태', width:'10%', align:'center'},
        { value:'신청자수', width:'10%', align:'center'}
      ],
      rows:this.postList.map((_,idx)=>{
        return [
            { key:'post_no', value:_.post_no, hidden:true},
            { key:'index', value:(idx+1)+((this.page-1)*10)},
            { key:'subj', value:_.subj , align:'left'},
            { key:'board_tab_nm', value:_.board_tab_nm },
            { key:'user_nm', value:_.user_nm },
            { key:'reg_dttm', value:_.reg_dttm },
            { key:'state_nm', value:_.state_nm },
            { key:'appl_cnt', value:(_.appl_cnt?_.appl_cnt:0)+' / '+(_.max_appl_cnt?_.max_appl_cnt:'∞') }
        ]
      })
    }
  }
  getPostDetail(row){
    console.log('getPostDetail');
    
    let post_no = null;
    for(let item of row){
      if(item.key == 'post_no') post_no = item.value;
    }
    this.router.navigate(['board/bill/detail'],{ queryParams: { post_no } });
  }
}
