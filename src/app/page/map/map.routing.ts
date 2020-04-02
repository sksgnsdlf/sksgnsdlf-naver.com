import { Routes } from '@angular/router';
import { ChildGuard } from '../../child.guard';

import { ClsComponent } from './cls/cls.component';
import { ReportComponent } from './report/report.component';
import { PlaceComponent } from './place/place.component';
import { ThemeComponent } from './theme/theme.component';
import { NoticeComponent } from './notice/notice.component';
import { SuggestComponent } from './suggest/suggest.component';
import { EnrollmentComponent} from './enrollment/enrollment.component';
import { ThemeenrollmentComponent } from './themeenrollment/themeenrollment.component';
import { NoticeenrollmentComponent } from './noticeenrollment/noticeenrollment.component';
import { FaqComponent } from './faq/faq.component';
import { FaqenrollmentComponent} from './faqenrollment/faqenrollment.component';
import { SuggestenrollmentComponent } from './suggestenrollment/suggestenrollment.component';
import { ReportmanageComponent } from './reportmanage/reportmanage.component';
import { ReportbrokenComponent } from './reportbroken/reportbroken.component';
import { ThemeEditComponent } from './theme-edit/theme-edit.component';

export const MapRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'cls',
        component: ClsComponent, 
        data: {
          title: '분류관리', 
          urls: [{ title: '스마트지도' }, { title: '분류관리' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'report',
        component: ReportComponent, 
        data: {
          title: '오류신고 항목관리', 
          urls: [{ title: '스마트지도' }, { title: '오류신고 항목관리' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'reportbroken',
        component: ReportbrokenComponent, 
        data: {
          title: '오류신고내역', 
          urls: [{ title: '스마트지도' }, { title: '오류신고내역' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'place',
        component: PlaceComponent, 
        data: {
          title: '장소관리', 
          urls: [{ title: '스마트지도' }, { title: '장소관리' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'reportmanage',
        component: ReportmanageComponent, 
        data: {
          title: '오류신고관리', 
          urls: [{ title: '스마트지도' }, { title: '오류신고관리' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'theme',
        component: ThemeComponent, 
        data: {
          title: '테마지도관리', 
          urls: [{ title: '스마트지도' }, { title: '테마지도관리' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'notice',
        component: NoticeComponent, 
        data: {
          title: '공지사항목록', 
          urls: [{ title: '스마트지도' }, { title: '공지사항목록' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'suggest',
        component: SuggestComponent, 
        data: {
          title: '사용자의견관리', 
          urls: [{ title: '스마트지도' }, { title: '사용자의견관리' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'enrollment',
        component: EnrollmentComponent, 
        data: {
          title: '장소 등록 / 수정창', 
          urls: [{ title: '스마트지도' }, { title: '장소 등록 / 수정창' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'themeenrollment',
        component: ThemeenrollmentComponent, 
        data: {
          title: '테마지도등록', 
          urls: [{ title: '스마트지도' }, { title: '테마지도등록' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'noticeenrollment',
        component: NoticeenrollmentComponent, 
        data: {
          title: '공지사항 등록/수정', 
          urls: [{ title: '스마트지도' }, { title: '공지사항 등록/수정' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'faq',
        component: FaqComponent, 
        data: {
          title: 'FAQ 목록', 
          urls: [{ title: '스마트지도' }, { title: 'FAQ 목록' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'faqenrollment',
        component: FaqenrollmentComponent, 
        data: {
          title: 'FAQ 등록/수정창', 
          urls: [{ title: '스마트지도' }, { title: 'FAQ 등록/수정창' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'suggestenrollment',
        component: SuggestenrollmentComponent,
        data: {
          title: '사용자의견관리수정창',
          urls: [{ title: '스마트지도' }, { title: '사용자의견관리수정창' }]
        }
        ,canActivate: [ ChildGuard ]
      },      
      {
        path: 'themeedit',
        component: ThemeEditComponent, 
        data: {
          title: '테마지도 지도 수정',
          urls: [{ title: '스마트지도' }, { title: '테마지도' }]
        }
        ,canActivate: [ ChildGuard ]
      },
    ]
  }
];
