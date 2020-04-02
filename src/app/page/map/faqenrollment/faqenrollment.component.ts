import { Component, OnInit, Renderer, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MapProvider } from '../../../providers/map';

@Component({
  selector: 'itsm-faqenrollment',
  templateUrl: './faqenrollment.component.html',
  styleUrls: ['./faqenrollment.component.scss']
})
export class FaqenrollmentComponent implements OnInit {

  subj :string = "";     // 제목
  txt = "";              // 내용
  state = 1;             // 게시상태
  no : any = {
    place_no: ""
  }

  faq : any = { };

  uploadfile : Array<any> = [];

  img_url;
  constructor(private mapprovider: MapProvider, private router: Router, private route: ActivatedRoute, public renderer: Renderer) { }

  ngOnInit() {
    this.route.queryParams.subscribe(no=>{
      this.no.faq_no = no.faq_no;

      if(no.faq_no){
        this.mapprovider.faq.get(no.faq_no).subscribe((data:any)=>{
          // API전체값
          this.faq ={...data};
          // console.log(this.faq );
        });
      }
      else {
        this.faq = {
          state: 1
        };
        // console.log("def");
      }
    })
  }


  // 저장
  save(){
    if (confirm(this.no.faq_no ? "수정하시겠습니까?" : "추가하시겠습니까?")) {
          this.mapprovider.faq.post({
            faq_no: this.no.faq_no ? this.no.faq_no : undefined,
            question: this.faq.question,
            answer: this.faq.answer, 
            state : this.faq.state
          }).subscribe(
            _ => {
              alert('저장되었습니다.');
              this.faqback();
            },
            err => {
             alert('제목, 내용을 적어주세요.');
            }
          );
    }
  }

  // 저장후 관리페이지로 이동
  faqback(){
    this.router.navigate(['map/faq'])
  }
}