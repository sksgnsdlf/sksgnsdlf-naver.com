import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventoffienrollmentComponent } from './eventoffienrollment.component';

describe('EventoffienrollmentComponent', () => {
  let component: EventoffienrollmentComponent;
  let fixture: ComponentFixture<EventoffienrollmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventoffienrollmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventoffienrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
