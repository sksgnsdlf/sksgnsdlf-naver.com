import { Component, OnInit, Renderer, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MapProvider } from '../../../providers/map';

@Component({
  selector: 'itsm-noticeenrollment',
  templateUrl: './noticeenrollment.component.html',
  styleUrls: ['./noticeenrollment.component.scss']
})
export class NoticeenrollmentComponent implements OnInit {

  @ViewChild('inputFile') inputFile: ElementRef;
  subj : string = "";    // 제목
  txt = "";              // 내용
  state = 1;             // 게시상태
  no : any = {
    place_no: ""
  }

  notice : any = { };

  uploadfile : Array<any> = [];

  file_upload;
  file_upload2;

  test = [];

  response_notice_no = '';
  constructor(private mapprovider: MapProvider, private router: Router, private route: ActivatedRoute, public renderer: Renderer) { }

  ngOnInit() {
    this.route.queryParams.subscribe(no => {
      this.no.notice_no = no.notice_no;

      if(no.notice_no) {
        this.mapprovider.notice.get(no.notice_no).subscribe((data: any) => {
          // API전체값
          this.notice = {...data};
          console.log(this.notice);
        });
      } else {
        this.notice = {
          state: 1,
          files : [],
        };
      }
    })
  }


  // 저장
  save() {
    if (confirm(this.no.notice_no ? "수정하시겠습니까?" : "추가하시겠습니까?")) {
      // form방식으로함
      let formData: FormData = new FormData();

      let postData = {
            notice_no : this.no.notice_no ? this.no.notice_no : undefined,
            subj : this.notice.subj,
            txt : this.notice.txt,
            state : this.notice.state,
      };
          for(let key in postData) {
          if(postData[key]) {
            if(postData[key] instanceof Array) {
              formData.append(key, JSON.stringify(postData[key]));
            } else {
              formData.append(key, postData[key]);
              }
          }
        }

         // 일반 저장(append)
          this.mapprovider.notice.post(formData).subscribe(_ => {
            alert('저장되었습니다.');

          // 저장할때 첨부파일 추가(append)

          var test = JSON.stringify(_)
          var test2 = JSON.parse(test);
          var notice_no = test2.notice_no;
          this.router.navigate(['map/noticeenrollment'],{ queryParams: { notice_no } });                // 첨부파일해야해서 notice_no저장
          }, err => {
            alert('제목, 내용을 적어주세요.');
          });
        }
      }

  // 첨부파일1
  fileupload() {
    var ua = window.navigator.userAgent; // console.log("ua2=>"+ ua);
    var msie = ua.indexOf('MSIE'); // console.log("msie2=>"+ msie);
    var trident = ua.indexOf('Trident/'); // console.log('trident2=>' + trident);
    if (msie > 0 || trident > 0) {
      this.inputFile.nativeElement.click();
    } else {
      let event = new MouseEvent('click', { bubbles: true });
      this.renderer.invokeElementMethod(this.inputFile.nativeElement, 'dispatchEvent', [event]); 
    }
  }

  // 첨부파일2
  checkFileType($event) {
    let files: FileList = $event.target.files;
    let test = {
      notice_no : 21,
      add_name : files[0].name
    }
      this.notice.files.push(test);                                                 // 첨부파일등록시 실시간 HTML

    // 첨부파일(업로드) 기능
    let fileData: FormData = new FormData();
    let file_postData = {
      notice_no : this.no.notice_no                 // 첨부파일때 사용하는 notice_no(수정할때나 등록후 바로 첨부파일올릴때))
     };

     for(let key in file_postData) {
      if(file_postData[key]) {
        if(file_postData[key] instanceof Array) {
          fileData.append(key, JSON.stringify(file_postData[key]));
        } else {
          fileData.append(key, file_postData[key]);
          }
      }
    }

    let upload_urls : FileList = this.inputFile.nativeElement.files;
      if (upload_urls.length > 0) {
      for(let i = 0; i < upload_urls.length; i++) {
        this.file_upload = upload_urls[i];
        }
        fileData.append('files', this.file_upload, this.file_upload.name);
     }
     this.mapprovider.notice.put(fileData).subscribe(_ => {
       alert("업로드 성공")
    }, err => {
        alert("업로드 실패") 
      });
    }

  // 첨부파일 삭제
    deleteRow(i,file_data) {
      this.notice.files.splice(i, 1);

      // 서버에서 삭제
        let small: any = {
          notice_no : this.no.notice_no,
            add_seq : file_data.add_seq
        };
        // 첨부파일 삭제
        this.mapprovider.notice.delete(small).subscribe(_ => {
          // 삭제완료
        });
      }

  // 돌아가기
    noticeback() {
      this.router.navigate(['map/notice']);
    }
}
