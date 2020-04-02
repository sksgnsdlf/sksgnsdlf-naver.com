import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildattendComponent } from './childattend.component';

describe('ChildattendComponent', () => {
  let component: ChildattendComponent;
  let fixture: ComponentFixture<ChildattendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildattendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildattendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
