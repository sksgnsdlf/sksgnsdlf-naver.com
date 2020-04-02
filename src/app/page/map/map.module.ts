import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClsComponent } from './cls/cls.component';
import { RouterModule } from '@angular/router';
import { MapRoutes } from './map.routing';
import { ItsmUiModule } from '../../itsm-ui/public_api';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { PlaceComponent } from './place/place.component';
import { ThemeComponent } from './theme/theme.component';
import { NoticeComponent } from './notice/notice.component';
import { SuggestComponent } from './suggest/suggest.component';
import { EnrollmentComponent } from './enrollment/enrollment.component';
import { ThemeenrollmentComponent } from './themeenrollment/themeenrollment.component';
import { ReportComponent } from './report/report.component';
import { NoticeenrollmentComponent } from './noticeenrollment/noticeenrollment.component';
import { FaqComponent } from './faq/faq.component';
import { FaqenrollmentComponent } from './faqenrollment/faqenrollment.component';
import { SuggestenrollmentComponent } from './suggestenrollment/suggestenrollment.component';
import { ReportmanageComponent } from './reportmanage/reportmanage.component';
import { ReportbrokenComponent } from './reportbroken/reportbroken.component';
import { MomentModule, DateFormatPipe } from 'angular2-moment';
import { SafeHtmlPipeModule } from '../../pipe/safe-html/safe-html.module';
import { ThemeEditComponent } from './theme-edit/theme-edit.component';
@NgModule({
  declarations: [ClsComponent, PlaceComponent, ThemeComponent, NoticeComponent, SuggestComponent, EnrollmentComponent, ThemeenrollmentComponent, 
    ReportComponent, NoticeenrollmentComponent, FaqComponent, FaqenrollmentComponent, SuggestenrollmentComponent, ReportmanageComponent, ReportbrokenComponent, ThemeEditComponent],
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    ItsmUiModule,
    SafeHtmlPipeModule,
    MomentModule,
    RouterModule.forChild(MapRoutes),
  ],
  providers: [ DateFormatPipe ]
})
export class MapModule { }
