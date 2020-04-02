import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API, UserSearchForm } from '../../config';
import { ResponseContentType } from '@angular/http';
import { Report } from './onestop';
@Injectable({ providedIn: 'root' })

export class MapProvider {
    public cls : Cls = new Cls(this.auth);
    public place : Place = new Place(this.auth);
    public report : report = new report(this.auth);
    public theme : theme = new theme(this.auth);
    public notice : notice = new notice(this.auth);
    public faq : faq = new faq(this.auth);
    public suggest : suggest = new suggest(this.auth);
    public reportmanage : Reportmanage = new Reportmanage(this.auth);
    public reportbroken : ReportBroken = new ReportBroken(this.auth);

    // public clslink : ClsLink = new ClsLink(this.auth);
    constructor(private auth: HttpClient) {
    }
}
// 분류관리
export class Cls {
    private resource: string = "/place/cls"
    constructor(private auth: HttpClient) { }

    // 조회
    getSearch(level: number  = 1, search: number = -1) {
        let url  = `${API}${this.resource}/all/${level}`;
        if(search != -1)
            url += `?upper_cd=${search}`;
        return this.auth.get(url);
    }

    // 수정
    post(body: any) {
        return this.auth.post(`${API}${this.resource}`, body, {responseType:'json'});
    }

    // 삭제
    delete(body) {
        return this.auth.delete(`${API}${this.resource}?cls_cd=${body.cls_cd}`, {responseType:'text'});
    }

    getOne(cls_cd){
        return this.auth.get(`${API}${this.resource}/${cls_cd}`);
    }

    private administrative_division : string = "/place/cls/duty/district"
    // 행정구역 리스트
    administrative_division_list() {
        return this.auth.get(`${API}${this.administrative_division}`);
    }

    private admin : string = "/place/cls/duty"

    // 담당자 조회
    adminlist(cls_cd){
        return this.auth.get(`${API}${this.admin}/${cls_cd}`)
    }

    // 담당자 + 행정구역추가
    administrative_division_post(body: any) {
        return this.auth.post(`${API}${this.admin}`, body, {responseType:'json'});
    }

    // 담당자 삭제
    admindelete(body){
        return this.auth.delete(`${API}${this.admin}?cls_cd=${body.cls_cd}&duty_user_no=${body.duty_user_no}`)
    }
}

export class report {
    private resource : string = "/place/cls/report"
    constructor(private auth: HttpClient) { }

    // 조회
    getlist(cls_cd){
        return this.auth.get(`${API}${this.resource}/${cls_cd}`)
    }

    // 수정 및 등록
    post(body: any) {
        return this.auth.post(`${API}${this.resource}`, body, {responseType:'json'});
    }

    // 삭제
    delete(body) {
        return this.auth.delete(`${API}${this.resource}?report_cd=${body.report_cd}`, {responseType:'text'});
    }
}

export class Reportmanage {
    private resource: string = "/place/report/manager"
    constructor(private auth: HttpClient) { }

    // 오류신고관리 리스트
    getlist(queryString) {
        return this.auth.get(`${API}${this.resource}/list${queryString}`); //
    }

    private cls : string = "/place/report/options"

    // 시설분류 리스트(주민센터(6)~공영주차장(12))
    get_cls_list() {
        return this.auth.get(`${API}${this.cls}`);
    }

    // // 장소관리 리스트 클릭시 상세항목
    // get(no)
    // {
    //     return this.auth.get(`${API}${this.resource}/${no}`); //
    // }
    
    // // 장소 등록창 - 등록 + 수정
    // post(body?: any){
    // return this.auth.post(`${API}${this.resource}`, body, {responseType:'json'});
    // }
}

export class ReportBroken {
    private resource : string = "/place/report/manager/detail";
    
    constructor(private auth: HttpClient) { }
    // 오류신고 데이터
    getdetaillist(report_no) {
        return this.auth.get(`${API}${this.resource}/${report_no}`); //
    }

    private proc : string = "/place/report/manager/proc"
    // 오류신고 처리등록
    post(body: any) {
        return this.auth.post(`${API}${this.proc}`, body, {responseType:'json'});
    }
}

// 장소관리
export class Place {
    private resource: string = "/place"
    constructor(private auth: HttpClient) { }

    // 장소관리 - 리스트
    getlist(queryString){
        return this.auth.get(`${API}${this.resource}/manager/list${queryString}`); //
    }

    // 장소관리 리스트 클릭시 상세항목
     get(no)
     {
         return this.auth.get(`${API}${this.resource}/${no}`); //
     }

     // 장소 등록창 - 등록 + 수정
     post(body: any){
         return this.auth.post(`${API}${this.resource}`, body, {responseType:'json'});
     }

     // 소분류삭제
     small_delete(body){
        return this.auth.delete(`${API}${this.resource}/place_place_cls?place_no=${body.place_no}&cls_cd=${body.cls_cd}`, {responseType:'text'});
     }

     // 지도에 맞는 동, 읍, 면 선택
    private dong : string = "/place/district/"
    get_dong(dong_name) {
        return this.auth.get(`${API}${this.dong}find?dong=${dong_name}`); //
    }

    // 담당자삭제
     duty_delete(body) {
        return this.auth.delete(`${API}${this.resource}/duty?place_no=${body.place_no}&user_role=${body.user_role}&duty_user_no=${body.duty_user_no}`, {responseType:'text'});
    }

    // 장소 등록/수정창 - 리뷰리스트
    getReViewlist(queryString){
        return this.auth.get(`${API}${this.resource}/review/list/${queryString}`); 
    }

    // 장소 등록/수정창 - 오류신고리스트
    geterrorlist(queryString){
        return this.auth.get(`${API}${this.resource}/report/list/${queryString}`); 
    }

    // 장소 등록/수정창 - 불편신고리스트
    getinconlist(queryString){
        return this.auth.get(`${API}${this.resource}/complaint/list/${queryString}`); 
    }

    placedelete(place_no){
        return this.auth.delete(`${API}${this.resource}/place?place_no=${place_no}`);
    }
}

export class theme {
    // 테마구분용 code
    private code : string = "/code";

    private resource: string = "/map/theme"
    constructor(private auth: HttpClient) { }

    // 테마구분(관광지도, 정책지도.. 등)
    getcode(){
        return this.auth.get(`${API}${this.code}/1004`);
    }

    // 지도관리 - 리스트
    getlist(queryString) {
        return this.auth.get(`${API}${this.resource}/list${queryString}`); //
    }
    // 지도관리 세부내용
    getdetaillist(no) {
         return this.auth.get(`${API}${this.resource}/${no}`); //
     }

    //지도 그 자체
    //지도 등록 + 수정
    mappost(body?: any){
        return this.auth.post(`${API}${this.resource}`, body, {responseType:'json'});
    }
    
    // 지도 삭제
    mapdelete(map_no) {
        return this.auth.delete(`${API}${this.resource}/theme/${map_no}`);
    }

    // (지도안에 등록한) 테마(마커, 선, 면)
    // 테마지도 등록
    placePost(body?:any){
        return this.auth.post(`${API}${this.resource}/place`, body, {responseType:'text'});
    }

    // 테마리스트 삭제
    delete(body:any) {
        return this.auth.delete(`${API}${this.resource}/place`, body);
    }

    // 테마리스트 정렬
    sort(body?: any) {
        return this.auth.post(`${API}${this.resource}/disp`, body,{responseType:'text'});
    }
}

export class notice{
    private resource: string = "/map/board/notice"
    constructor(private auth: HttpClient) { }

    // 테마지도관리 - 리스트
    getlist(queryString) {
        return this.auth.get(`${API}${this.resource}/list${queryString}`); //
    }

    // 장소관리 리스트 클릭시 상세항목
    get(no)
    {
        return this.auth.get(`${API}${this.resource}/${no}`); //
    }
    
    // 장소 등록창 - 등록 + 수정
    post(body: any){
    return this.auth.post(`${API}${this.resource}`, body, {responseType:'json'});
    }

    // 첨부파일 추가
    private files : string = "/map/board/notice/attach";
    put(body: any){
        return this.auth.put(`${API}${this.files}`, body, { responseType: 'text' });
    }

    // 첨부파일 삭제
    delete(body: any){
        return this.auth.delete(`${API}${this.files}?notice_no=${body.notice_no}&add_seq=${body.add_seq}`, {responseType:'text'});
    }
}

export class faq{
    private resource: string = "/map/board/faq"
    constructor(private auth: HttpClient) { }

    // 테마지도관리 - 리스트
    getlist(queryString) {
        return this.auth.get(`${API}${this.resource}/list${queryString}`); //
    }

    // 장소관리 리스트 클릭시 상세항목
    get(no)
    {
        return this.auth.get(`${API}${this.resource}/${no}`); //
    }
    
    // 장소 등록창 - 등록 + 수정
    post(body?: any){
    return this.auth.post(`${API}${this.resource}`, body, {responseType:'json'});
    }
}

export class suggest{
    private resource: string = "/map/board/suggest"
    constructor(private auth: HttpClient) { }

    // 테마지도관리 - 리스트
    getlist(queryString) {
        return this.auth.get(`${API}${this.resource}/list${queryString}`); //
    }

    // 장소관리 리스트 클릭시 상세항목
    get(no)
    {
        return this.auth.get(`${API}${this.resource}/${no}`); //
    }
    
    // 장소 등록창 - 등록 + 수정
    post(body?: any){
    return this.auth.post(`${API}${this.resource}`, body, {responseType:'json'});
    }
}

