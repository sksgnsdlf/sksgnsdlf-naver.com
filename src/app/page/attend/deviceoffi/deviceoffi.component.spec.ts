import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceoffiComponent } from './deviceoffi.component';

describe('DeviceoffiComponent', () => {
  let component: DeviceoffiComponent;
  let fixture: ComponentFixture<DeviceoffiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceoffiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceoffiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
