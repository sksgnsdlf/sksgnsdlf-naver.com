import { Component, OnInit, Renderer, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MapProvider } from '../../../providers/map';

@Component({
  selector: 'itsm-suggestenrollment',
  templateUrl: './suggestenrollment.component.html',
  styleUrls: ['./suggestenrollment.component.scss']
})
export class SuggestenrollmentComponent implements OnInit {
subj :string = "";     // 제목
txt = "";              // 내용
state = 1;             // 게시상태
no : any = {
  place_no: ""
}

suggest : any = { };

uploadfile : Array<any> = [];

img_url;
constructor(private mapprovider: MapProvider, private router: Router, private route: ActivatedRoute, public renderer: Renderer) { }

    ngOnInit() {
      this.route.queryParams.subscribe(no=>{
        this.no.suggest_no = no.suggest_no;

        if(no.suggest_no){
          this.mapprovider.suggest.get(no.suggest_no).subscribe((data:any)=>{
            // API전체값
            this.suggest ={...data};
            console.log(this.suggest );
          });
        }
        else {
          this.suggest = {
            state: 1
          };
          // console.log("def");
        }
      })
    }


    // 저장
    save(){
      if (confirm(this.no.suggest_no ? "수정하시겠습니까?" : "추가하시겠습니까?")) {
            this.mapprovider.suggest.post({
              suggest_no: this.no.suggest_no ? this.no.suggest_no : undefined,
              subj: this.suggest.subj,
              txt: this.suggest.txt, 
              state : this.suggest.state
            }).subscribe(
              _ => {
                alert('저장되었습니다.');
                this.suggestback();
              },
              err => {
                alert('저장실패!');
              }
            );
      }
    }

// 저장후 관리페이지로 이동
    suggestback(){
     this.router.navigate(['map/suggest'])
    }

}
