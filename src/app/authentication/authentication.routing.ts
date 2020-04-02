import { Routes } from '@angular/router';

import { NotFoundComponent } from './404/not-found.component';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { UnauthorizedComponent } from './401/unauthorized.component';
import { ChildhomeapplyComponent } from './childhomeapply/childhomeapply.component'

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '404',
        component: NotFoundComponent
      },
      {
        path: 'lock',
        component: LockComponent
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'signup',
        component: SignupComponent
      },
      {
        path: '401',
        component: UnauthorizedComponent
      },
      {
        path: 'childhomeapply',
        component: ChildhomeapplyComponent
      }
    ]
  }
];
