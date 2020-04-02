import { Component, OnInit } from '@angular/core';
import { LoginSession } from '../../../services/login.session';
import { HttpClient } from '@angular/common/http';
import { AttendProvider } from '../../../providers/attend';
// import { API } from '../../../../config';

@Component({
  selector: 'itsm-deviceorg',
  templateUrl: './deviceorg.component.html',
  styleUrls: ['./deviceorg.component.scss']
})
export class DeviceorgComponent implements OnInit {

  society_no = null; // 단체선택 No값
  checktyp: string = "1";        // 비콘 or RFID
  beacon : Array<any> = []; 
  rfid : Array<any> = [];

  beacondata = { 
    beacon_no : undefined,
    uuid : undefined,
    mac_addr : undefined,
    major : undefined,
    minor : undefined,
    reg_user_nm : undefined
  };

  rfiddata = {
    rfid_no : undefined,
    rfid : undefined
  };

  // selectedOrgNo;
  // beacons:any = [];
  // orgs: Array<any> = [];
  constructor(private http: HttpClient, public session: LoginSession, private attendProvider: AttendProvider) { }

  ngOnInit() {
  
  }

  // 단체선택
  societySelected(society_no){
    this.society_no = society_no;
    if(!this.society_no || this.society_no == 'null') return;
    // 단체선택에 대한 데이터
    this.getSociety(this.society_no);
  }

  getSociety(society_no){
    this.attendProvider.deviceorg.beaconget(society_no).subscribe((data:any)=>{
      this.beacon = data
    })

    this.attendProvider.deviceorg.rfidget(society_no).subscribe((data:any)=>{
      this.rfid = data
    })
  }

  // 비콘 신규추가
  beaconadd(){
    this.beacondata = { 
      beacon_no : '',
      uuid : '',
      mac_addr : '',
      major : '',
      minor : '',
      reg_user_nm : ''
    }
  }

  // 비콘 리스트 클릭(수정)
  beaconselect(item){
    this.attendProvider.deviceorg.beacondetail(item.beacon_no).subscribe((data:any)=>{
      this.beacondata.beacon_no = data.beacon_no;
      this.beacondata.mac_addr = data.mac_addr;
      this.beacondata.major = data.major;
      this.beacondata.minor = data.minor;
      this.beacondata.reg_user_nm = data.reg_user_nm;
      this.beacondata.uuid = data.uuid;
    })
  }

  // 비콘 저장
  beaconsave(){
    this.attendProvider.deviceorg.beaconpost({
      device_no : this.beacondata.beacon_no ? this.beacondata.beacon_no : undefined,
      mac_addr : this.beacondata.mac_addr,
      major: this.beacondata.major,
      minor: this.beacondata.minor,
      uuid : this.beacondata.uuid ,
      check_typ: 1,                   // beacon 번호
      service_cls: 3,                 // 기관단체 번호(2-공무원, 3-기관단체)
      society_no : this.society_no   // 단체번호
    }).subscribe(_=>{
      alert('저장되었습니다.');
      this.getSociety(this.society_no);

      this.beacondata = { 
        beacon_no : '',
        uuid : '',
        mac_addr : '',
        major : '',
        minor : '',
        reg_user_nm : ''
      }
    }, err=>{
      alert('저장실패')
    });
  }

  // 비콘장치 리스트 삭제
    beacondelete(item) {
      // this.beacon.splice(i, 1);
      console.log(item.beacon_no);
      this.attendProvider.deviceorg.beacondelete({
        check_typ : 1,
        device_no: item.beacon_no,
      })
      .subscribe( _ => {
          // response 값이 없어서 패스
        },
        err => {
          alert('삭제되었습니다.');
          // 리스트 갱신
          this.getSociety(this.society_no);
          // 삭제클릭할때 들어온 값 제거
          this.beacondata = { 
            beacon_no : '',
            uuid : '',
            mac_addr : '',
            major : '',
            minor : '',
            reg_user_nm : ''
          }
        }
      );
    }

  // RFID 신규 추가
  rfidadd(){
    this.rfiddata = { 
      rfid_no : '',
      rfid : ''
    }
  }

  // RFID(NFC) 리스트 클릭(수정)
  rfidselect(item){
    this.attendProvider.deviceorg.rfiddetail(item.rfid_no).subscribe((data:any)=>{
      this.rfiddata.rfid_no = data.rfid_no,
      this.rfiddata.rfid = data.rfid;
    });
  }

  // RFID(NFC) 저장
  rfidsave(){
    this.attendProvider.deviceorg.rfidpost({
      check_typ: 2,                   // RFID 번호
      service_cls: 3,                 // 기관단체 번호(2-공무원, 3-기관단체)
      society_no : this.society_no,   // 단체번호
      device_no : this.rfiddata.rfid_no ? this.rfiddata.rfid_no : undefined,
      rfid : this.rfiddata.rfid,
    }).subscribe(_=>{
      alert('저장되었습니다.');
      this.getSociety(this.society_no);
      this.rfiddata = { 
        rfid_no : '',
        rfid : ''
      }
    }, err=>{
      alert('저장실패')
    });
  }

  // RFID(NFC) 리스트 삭제
  rfiddelete(item) {
    this.attendProvider.deviceorg.beacondelete({
      check_typ : 2,
      device_no: item.rfid_no,
    })
    .subscribe( _ => {
        // response 값이 없어서 패스
      },
      err => {
        alert('삭제되었습니다.');
        // 리스트 갱신
        this.getSociety(this.society_no);
        // 삭제클릭할때 들어온 값 제거
        this.rfiddata = { 
          rfid_no : '',
          rfid : ''
        }
      }
    );
  }
}