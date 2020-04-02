import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceorgComponent } from './deviceorg.component';

describe('DeviceorgComponent', () => {
  let component: DeviceorgComponent;
  let fixture: ComponentFixture<DeviceorgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceorgComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceorgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
