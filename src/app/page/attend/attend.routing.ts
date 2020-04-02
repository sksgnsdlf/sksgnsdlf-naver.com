import { Routes } from '@angular/router';
import { ChildGuard } from '../../child.guard';

import { EventorgComponent } from './eventorg/eventorg.component';
import { EventorgenrollmentComponent } from './eventorgenrollment/eventorgenrollment.component';
import { DeviceorgComponent } from './deviceorg/deviceorg.component';
import { ChildComponent } from './child/child.component';
import { ChildattendComponent } from './childattend/childattend.component';
import { ChildenrollmentComponent } from './childenrollment/childenrollment.component';
import { DeviceoffiComponent } from './deviceoffi/deviceoffi.component';
import { EventoffiComponent } from './eventoffi/eventoffi.component';
import { EventoffienrollmentComponent } from './eventoffienrollment/eventoffienrollment.component';

export const AttendRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'eventorg',
        component: EventorgComponent,
        data: {
          title: '행사목록-기관단체',
          urls: [{ title: '출결관리' }, { title: '행사목록-기관단체' }]
        }
        , canActivate: [ ChildGuard ]
      },
      {
        path: 'eventorgenrollment',
        component: EventorgenrollmentComponent,
        data: {
          title: '행사목록-기관단체 등록/수정창',
          urls: [{ title: '출결관리' }, { title: '행사목록-기관단체 등록/수정창' }]
        }
        , canActivate: [ ChildGuard ]
      },
      {
        path: 'deviceorg',
        component: DeviceorgComponent,
        data: {
          title: '장치관리-기관단체',
          urls: [{ title: '출결관리' }, { title: '장치관리-기관단체' }]
        }
        , canActivate: [ ChildGuard ]
      },
      {
        path: 'eventoffi',
        component: EventoffiComponent,
        data: {
          title: '행사목록-공무원',
          urls: [{ title: '출결관리' }, { title: '행사목록-공무원' }]
        }
        , canActivate: [ ChildGuard ]
      },
      {
        path: 'eventoffienrollment',
        component: EventoffienrollmentComponent,
        data: {
          title: '행사목록-공무원 등록/수정창',
          urls: [{ title: '출결관리' }, { title: '행사목록-공무원 등록/수정창' }]
        }
        , canActivate: [ ChildGuard ]
      },
      {
        path: 'deviceoffi',
        component: DeviceoffiComponent,
        data: {
          title: '장치관리-공무원',
          urls: [{ title: '출결관리' }, { title: '장치관리-공무원' }]
        }
        , canActivate: [ ChildGuard ]
      },
      {
        path: 'child',
        component: ChildComponent,
        data: {
          title: '어린이집목록',
          urls: [{ title: '출결관리' }, { title: '어린이집목록' }]
        }
        , canActivate: [ ChildGuard ]
      },
      {
        path: 'childenrollment',
        component: ChildenrollmentComponent,
        data: {
          title: '어린이집목록 등록/수정창',
          urls: [{ title: '출결관리' }, { title: '어린이집목록 등록/수정창' }]
        }
        , canActivate: [ ChildGuard ]
      },
      {
        path: 'childattend',
        component: ChildattendComponent,
        data: {
          title: '어린이집 출결관리',
          urls: [{ title: '출결관리' }, { title: '어린이집 출결관리' }]
        }
        , canActivate: [ ChildGuard ]
      },
      // {
      //   path: 'childattendenrollment',
      //   component: ChildattendenrollmentComponent,
      //   data: {
      //     title: '어린이집 출결관리 등록창',
      //     urls: [{ title: '출결관리' }, { title: '어린이집 출결관리 등록창' }]
      //   }
      //   , canActivate: [ ChildGuard ]
      // },
    ]
  }
];
