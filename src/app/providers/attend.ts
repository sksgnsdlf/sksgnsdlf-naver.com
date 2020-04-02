import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API } from '../../config';
import { EventoffiComponent } from '../page/attend/eventoffi/eventoffi.component';
@Injectable({ providedIn: 'root' })

export class AttendProvider {

    public eventorg : Eventorg = new Eventorg(this.auth);
    public eventoffi : Eventoffi = new Eventoffi(this.auth);
    public deviceorg: Deviceorg = new Deviceorg(this.auth);
    public deviceoffi: Deviceoffi = new Deviceoffi(this.auth);
    public child : Child = new Child(this.auth);
    public childenroll : Childenroll = new Childenroll(this.auth);
    public child_attend : Child_Attend = new Child_Attend(this.auth);

    constructor(private auth: HttpClient) {
    }
}

// 행사목록 - 기관단체 + 행사목록 - 공무원
export class Eventorg{

    constructor(private auth: HttpClient) { }

    private society: string = "/society";
    // 단체선택
    societyget() {
        return this.auth.get(`${API}${this.society}`);
    }

    private resource: string = "/attend/course"

    // 단체선택후 리스트+페이징
    getlist(queryString) {
        return this.auth.get(`${API}${this.resource}${queryString}`); //
    }

    // 상세페이지
    get(no)
    {
        return this.auth.get(`${API}${this.resource}/${no}`); //
    }

    // 등록(수정)페이지
    post(body: any){
    return this.auth.post(`${API}${this.resource}`, body, {responseType:'json'});
    }

    private event: string = "/attend/course/options";

    // 행사관련 정보
    eventget() {
        return this.auth.get(`${API}${this.event}`);
    }

    private beacon: string = "/attend/device";
    // 기관단체 - 비콘
    org_off_beaconlist(society_no){
        return this.auth.get(`${API}${this.beacon}?service_cls=3&check_typ=1&society_no=${society_no}`);
    }

    // 기관단체 - rfid
    org_off_rfidlist(society_no){
        return this.auth.get(`${API}${this.beacon}?service_cls=3&check_typ=2&society_no=${society_no}`);
    }

    // 공무원 - 비콘
    eventoffi_beaconlist(){
        return this.auth.get(`${API}${this.beacon}?service_cls=2&check_typ=1`);
    }

    // 공무원 - 비콘
    eventoffi_rfidlist(){
        return this.auth.get(`${API}${this.beacon}?service_cls=2&check_typ=2`);
    }



    // 회원정보 엑셀저장
    private org_excel : string = "/attend/course/excel/society";

    excelget(course_no){
        return this.auth.get(`${API}${this.org_excel}/${course_no}`, {
            responseType: 'blob'});
    }

    private user : string ="/attend/course/society"

    // 강좌에 있는 출결회원정보 리스트
    usergetlist(queryString) {
        return this.auth.get(`${API}${this.user}/list${queryString}`); //
    }

    // 강좌삭제
    private lecdelete : string = "/attend/course";

    delete(body:any) {
        return this.auth.delete(`${API}${this.lecdelete}/${body.course_no}`, {responseType:'text'});
    }

    // 해당강좌 회원출결등록
    private attenduser: string = "/attend/inout/web";
    userpost(body: any){
        return this.auth.post(`${API}${this.attenduser}`, body, {responseType:'json'});
    }

    private userdel: string = "/attend/inout";
    userdelete(body:any) {
        return this.auth.delete(`${API}${this.userdel}?course_no=${body.course_no}&attendance_dvsn=${body.attendance_dvsn}&attend_user_nm=${body.attend_user_nm}&attend_cp_no=${body.attend_cp_no}`, {responseType:'text'});
    }

}

// 행사목록 - 공무원
export class Eventoffi{
    constructor(private auth: HttpClient) { }

    private offi_excel: string = "/attend/course/excel/org";

    // 공무원 excel
    excelget(course_no){
        return this.auth.get(`${API}${this.offi_excel}/${course_no}`, {
            responseType: 'blob'});
    }
}

// 장치관리 - 기관단체
export class Deviceorg{
    constructor(private auth: HttpClient) { }

    private beaconget1: string = "/attend/device?service_cls=3&check_typ=1";

    // 비컨리스트 
    beaconget(society_no) {
        return this.auth.get(`${API}${this.beaconget1}&society_no=${society_no}`);
    }

    private beacondat : string = "/attend/device/detail?check_typ=1";

    // 비컨 상세정보
    beacondetail(device_no){
        return this.auth.get(`${API}${this.beacondat}&device_no=${device_no}`);
    }

    private beacon : string = "/attend/device";

    // 비컨등록,수정
    beaconpost(body: any){
        return this.auth.post(`${API}${this.beacon}`, body, {responseType:'json'});
    }

    // 비컨삭제
    beacondelete(body:any) {
        return this.auth.delete(`${API}${this.beacon}?check_typ=${body.check_typ}&device_no=${body.device_no}`, {responseType:'json'});
    }

    // RFID리스트 
    private rfid: string = "/attend/device?service_cls=3&check_typ=2";

    rfidget(society_no) {
        return this.auth.get(`${API}${this.rfid}&society_no=${society_no}`);
    }

    private rfiddat : string = "/attend/device/detail?check_typ=2";

    // RFID 상세정보
    rfiddetail(device_no){
        return this.auth.get(`${API}${this.rfiddat}&device_no=${device_no}`);
    }

    // RFID 등록,수정
    rfidpost(body: any){
        return this.auth.post(`${API}${this.beacon}`, body, {responseType:'json'});
    }

    // RFID 삭제
    rfiddelete(body:any) {
        return this.auth.delete(`${API}${this.beacon}?check_typ=${body.check_typ}&device_no=${body.device_no}`, {responseType:'json'});
    }
}

// 장치관리 - 공무원
export class Deviceoffi{

    constructor(private auth: HttpClient) { }

    private beacon : string = "/attend/device?service_cls=2"

    beaconlist(check_typ){
        return this.auth.get(`${API}${this.beacon}&check_typ=${check_typ}`);
    }

    rfidlist(check_typ){
        return this.auth.get(`${API}${this.beacon}&check_typ=${check_typ}`);
    }
}

// 어린이집목록
export class Child{
    constructor(private auth: HttpClient) { }

    private child : string = "/attend/daycare"

    childlist(queryString){
        return this.auth.get(`${API}${this.child}/list?${queryString}`);
    }
}

// 어린이집 등록페이지
export class Childenroll {
    constructor(private auth: HttpClient) { }

    private childdetail : string = "/attend/daycare/detail"

    // 상세페이지
    get(no) {
        return this.auth.get(`${API}${this.childdetail}/${no}`); //
    }

    private childenroll : string = "/attend/daycare"

    // 어린이집 등록(수정)
    post(body: any){
        return this.auth.post(`${API}${this.childenroll}`, body, {responseType:'json'});
    }

    // 어린이집 삭제
    delete(body:any) {
    return this.auth.delete(`${API}${this.childenroll}/${body.daycare_no}`, {responseType:'text'});
    }

    // 어린이집 등록후 반 등록(수정)
    private class : string = "/attend/daycare/daycare_cls";

    classpost(body: any){
        return this.auth.post(`${API}${this.class}`, body, {responseType:'json'});
    }
    // 어린이집 등록후 반 삭제
    classdelete(body:any) {
        return this.auth.delete(`${API}${this.class}/${body.cls_no}`, {responseType:'text'});
    }

    // 어린이집 등록후 교사 등록(수정)
    private staff : string = "/attend/daycare/daycare_staff";

    staffpost(body: any){
        return this.auth.post(`${API}${this.staff}`, body, {responseType:'json'});
    }
    // 어린이집 등록후 교사 삭제
    staffdelete(body:any) {
        return this.auth.delete(`${API}${this.staff}/${body.staff_no}`, {responseType:'text'});
    }

    // 어린이집 등록후 NFC 등록(수정)
    private rfid : string = "/attend/daycare/daycare_rfid";

    rfidpost(body: any){
        return this.auth.post(`${API}${this.rfid}`, body, {responseType:'json'});
    }
    // 어린이집 등록후 NFC 삭제
    rfiddelete(body:any) {
        return this.auth.delete(`${API}${this.rfid}/${body.rfid_no}`, {responseType:'text'});
    }

    // 어린이집 등록후 어린이 등록(수정)
    private child : string = "/attend/daycare/child";

    childpost(body: any){
        return this.auth.post(`${API}${this.child}`, body, {responseType:'json'});
    }
    // 어린이집 등록후 NFC 삭제
    childdelete(body:any) {
        return this.auth.delete(`${API}${this.child}/${body.child_no}`, {responseType:'text'});
    }

    // (어린이집에 해당하는) 어린이 조회
    private chlidlist : string = "/attend/daycare/child_list";

    chlidlistget(queryString){
        return this.auth.get(`${API}${this.chlidlist}${queryString}`);
    }
}

// 어린이집 출결관리
export class Child_Attend{
    constructor(private auth: HttpClient) { }

    private child_select : string = "/attend/daycare/list"

    // 해당 어린이집 select로 가져옴
    child_Select(){
        return this.auth.get(`${API}${this.child_select}`);
    }

    private child_list : string = "/attend/daycare/inout/list"

    // 해당 어린이집에 소속된 어린이 데이터
    child_List(queryString){
        return this.auth.get(`${API}${this.child_list}${queryString}`);
    }

    private excelroot : string = "/attend/daycare/inout"

    // 조건에 해당하는 데이터 엑셀화
    excel(cls_no, child_nm, fdate, tdate, pageNo, pageSize) { // , pageNo, pageSize
        return this.auth.get(`${API}${this.excelroot}/excel?cls_no=${cls_no}&child_nm=${child_nm}&fdate=${fdate}&tdate=${tdate}&pageNo=${pageNo}&pageSize=${pageSize}`, {
            responseType: 'blob'
        });                                                        // &pageNo=${pageNo}&pageSize=${pageSize}
    }
}