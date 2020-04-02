import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqenrollmentComponent } from './faqenrollment.component';

describe('FaqenrollmentComponent', () => {
  let component: FaqenrollmentComponent;
  let fixture: ComponentFixture<FaqenrollmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FaqenrollmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqenrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
