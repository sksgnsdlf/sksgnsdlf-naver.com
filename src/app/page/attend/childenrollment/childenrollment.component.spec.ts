import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildenrollmentComponent } from './childenrollment.component';

describe('ChildenrollmentComponent', () => {
  let component: ChildenrollmentComponent;
  let fixture: ComponentFixture<ChildenrollmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildenrollmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildenrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
