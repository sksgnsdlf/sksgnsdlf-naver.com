import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventoffiComponent } from './eventoffi.component';

describe('EventoffiComponent', () => {
  let component: EventoffiComponent;
  let fixture: ComponentFixture<EventoffiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventoffiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventoffiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
