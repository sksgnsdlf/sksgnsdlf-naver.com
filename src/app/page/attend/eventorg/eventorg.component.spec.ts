import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventorgComponent } from './eventorg.component';

describe('EventorgComponent', () => {
  let component: EventorgComponent;
  let fixture: ComponentFixture<EventorgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventorgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventorgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
