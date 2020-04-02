import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestenrollmentComponent } from './suggestenrollment.component';

describe('SuggestenrollmentComponent', () => {
  let component: SuggestenrollmentComponent;
  let fixture: ComponentFixture<SuggestenrollmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SuggestenrollmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestenrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
