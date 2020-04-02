import { Component, OnInit } from '@angular/core';
import { LoginSession } from '../../../services/login.session';
import { HttpClient } from '@angular/common/http';
import { AttendProvider } from '../../../providers/attend';
import { API } from '../../../../config';

@Component({
  selector: 'itsm-deviceoffi',
  templateUrl: './deviceoffi.component.html',
  styleUrls: ['./deviceoffi.component.scss']
})
export class DeviceoffiComponent implements OnInit {

  // 비컨 리스트
  beacons:any = [];
  rfid : Array<any> = [];
  selectedOrgNo = 1;

  society_no = null; // 단체선택 No값
  checktyp: string = "1";        // 비콘 or RFID
  beacon : Array<any> = []; 

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
  
  constructor(private http: HttpClient, public session: LoginSession, private attendProvider: AttendProvider) { }

  ngOnInit() {
    this.getBeacon(1);
    this.getrfid(2)
  }

  // 비컨리스트
  getBeacon(check_typ) {
    this.attendProvider.deviceoffi.beaconlist(check_typ).subscribe((data:any)=>{
      this.beacons = data
    })
  }

  // RFID리스트
  getrfid(check_typ) {
    this.attendProvider.deviceoffi.rfidlist(check_typ).subscribe((data:any)=>{
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

  // 비컨 저장
  beaconsave(){
    this.attendProvider.deviceorg.beaconpost({
      device_no : this.beacondata.beacon_no ? this.beacondata.beacon_no : undefined,
      mac_addr : this.beacondata.mac_addr,
      major: this.beacondata.major,
      minor: this.beacondata.minor,
      uuid : this.beacondata.uuid ,
      check_typ: 1,                   // beacon 번호
      service_cls: 2,                 // 기관단체 번호(2-공무원, 3-기관단체)
      society_no : this.society_no,   // 단체번호
      // reg_user_nm : this.beacondata.reg_user_nm,
    }).subscribe(_=>{
      alert('저장되었습니다.');
      // 비컨 저장후 갱신
      this.getBeacon(1);
      this.beacondata = { 
        beacon_no : '',
        uuid : '',
        mac_addr : '',
        major : '',
        minor : '',
        reg_user_nm : ''
      }
    }, err=>{
      alert('저장실패!')
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
          // 비컨 삭제후 갱신
          this.getBeacon(1);

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
      service_cls: 2,                 // 기관단체 번호(2-공무원, 3-기관단체)
      society_no : this.society_no,   // 단체번호
      device_no : this.rfiddata.rfid_no ? this.rfiddata.rfid_no : undefined,
      rfid : this.rfiddata.rfid,
    }).subscribe(_=>{
      alert('저장되었습니다.');
      // RFID 저장후 갱신
      this.getrfid(2)
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
        // RFID 삭제후 갱신
        this.getrfid(2)
        // 삭제클릭할때 들어온 값 제거
        this.rfiddata = { 
          rfid_no : '',
          rfid : ''
        }
      }
    );
  }
}