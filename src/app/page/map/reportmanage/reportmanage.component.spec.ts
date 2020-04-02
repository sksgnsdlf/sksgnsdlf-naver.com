import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportmanageComponent } from './reportmanage.component';

describe('ReportmanageComponent', () => {
  let component: ReportmanageComponent;
  let fixture: ComponentFixture<ReportmanageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportmanageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportmanageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
