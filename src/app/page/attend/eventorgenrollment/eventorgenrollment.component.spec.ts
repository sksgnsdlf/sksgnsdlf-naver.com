import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventorgenrollmentComponent } from './eventorgenrollment.component';

describe('EventorgenrollmentComponent', () => {
  let component: EventorgenrollmentComponent;
  let fixture: ComponentFixture<EventorgenrollmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventorgenrollmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventorgenrollmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
