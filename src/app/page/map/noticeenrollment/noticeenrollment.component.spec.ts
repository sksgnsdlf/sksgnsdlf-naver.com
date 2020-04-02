import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticeenrollmentComponent } from './noticeenrollment.component';

describe('NoticeenrollmentComponent', () => {
  let component: NoticeenrollmentComponent;
  let fixture: ComponentFixture<NoticeenrollmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoticeenrollmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoticeenrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
