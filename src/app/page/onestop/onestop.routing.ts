import { Routes } from '@angular/router';
import { ChildGuard } from '../../child.guard';
import { MyListComponent } from './my-list/list.component';
import { AddMenualComponent } from './add-menual/add-menual.component';
import { SearchMenualComponent } from './search-menual/search-menual.component';
import { DutyComponent } from './duty/duty.component';
import { TurnReportComponent } from './turn-report/turn-report.component';
import { OnestopListComponent } from './list/list.component';
import { UrbanComponent } from './urban/urban.component';
import { MyTurnReportComponent } from './my-turn-report/turn-report.component';

export const OnestopRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'menual/add',
        component: AddMenualComponent,
        data: {
          title: '당직 매뉴얼 관리',
          urls: [{ title: '바로응답' }, { title: '당직 매뉴얼 관리' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'menual',
        component: SearchMenualComponent,
        data: {
          title: '당직 매뉴얼 검색',
          urls: [{ title: '바로응답' }, { title: '당직 매뉴얼 검색' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'duty',
        component: DutyComponent,
        data: {
          title: '당직근무자',
          urls: [{ title: '바로응답' }, { title: '당직근무자' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'report',
        component: TurnReportComponent,
        data: {
          title: '바로응답접수',
          urls: [{ title: '바로응답' }, { title: '바로응답접수' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'list',
        component: OnestopListComponent,
        data: {
          title: '바로응답접수목록',
          urls: [{ title: '바로응답' }, { title: '바로응답접수목록' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'urban',
        component: UrbanComponent,
        data: {
          title: '도시재생참여목록',
          urls: [{ title: '바로응답' }, { title: '도시재생참여목록' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'mylist',
        component: MyListComponent,
        data: {
          title: '불편신고처리',
          urls: [{ title: '바로응답' }, { title: '불편신고처리' }]
        }
        ,canActivate: [ ChildGuard ]
      },
      {
        path: 'myreport',
        component: MyTurnReportComponent,
        data: {
          title: '불편신고처리',
          urls: [{ title: '바로응답' }, { title: '불편신고처리' }]
        }
        ,canActivate: [ ChildGuard ]
      }
    ]
  }
];
