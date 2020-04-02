import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { OnestopRoutes } from './onestop.routing';
import { MyListComponent } from './my-list/list.component';
import { AddMenualComponent } from './add-menual/add-menual.component';
import { SearchMenualComponent } from './search-menual/search-menual.component';
import { DutyComponent } from './duty/duty.component';
import { TurnReportComponent } from './turn-report/turn-report.component';
import { OnestopListComponent } from './list/list.component';
import { UrbanComponent } from './urban/urban.component';
import { ItsmUiModule } from '../../itsm-ui/public_api';
import { EndConsultComponent } from './end-consult/end-consult.component';
import { MyTurnReportComponent } from './my-turn-report/turn-report.component';
import { ReceiptComponent } from './receipt/receipt.component';

import { SafeHtmlPipeModule } from '../../pipe/safe-html/safe-html.module';
import { MomentModule, DateFormatPipe } from 'angular2-moment';
@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ItsmUiModule,
    SafeHtmlPipeModule, 
    MomentModule, 
    RouterModule.forChild(OnestopRoutes)
  ],
  declarations: [MyListComponent, AddMenualComponent, SearchMenualComponent, DutyComponent, TurnReportComponent, OnestopListComponent, UrbanComponent, 
                EndConsultComponent, MyTurnReportComponent, ReceiptComponent],
  providers: [ DateFormatPipe ]
})
export class OnestopModule { }
