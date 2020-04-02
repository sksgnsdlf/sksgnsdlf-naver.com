import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AttendRoutes } from './attend.routing';
import { ItsmUiModule } from '../../itsm-ui/public_api';
import { EventorgComponent } from './eventorg/eventorg.component';
import { EventorgenrollmentComponent } from './eventorgenrollment/eventorgenrollment.component';
import { DeviceorgComponent } from './deviceorg/deviceorg.component';
import { EventoffiComponent } from './eventoffi/eventoffi.component';
import { EventoffienrollmentComponent } from './eventoffienrollment/eventoffienrollment.component';
import { DeviceoffiComponent } from './deviceoffi/deviceoffi.component';
import { ChildComponent } from './child/child.component';
import { ChildenrollmentComponent } from './childenrollment/childenrollment.component';
import { ChildattendComponent } from './childattend/childattend.component';

@NgModule({
  declarations: [EventorgComponent, EventorgenrollmentComponent, DeviceorgComponent, EventoffiComponent, EventoffienrollmentComponent, DeviceoffiComponent, ChildComponent, ChildenrollmentComponent, ChildattendComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(AttendRoutes),
    ItsmUiModule,
    NgbModule,
    FormsModule,
  ]
})
export class AttendModule { }
