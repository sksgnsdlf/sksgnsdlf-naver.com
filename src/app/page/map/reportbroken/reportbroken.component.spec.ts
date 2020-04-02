import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportbrokenComponent } from './reportbroken.component';

describe('ReportbrokenComponent', () => {
  let component: ReportbrokenComponent;
  let fixture: ComponentFixture<ReportbrokenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportbrokenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportbrokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
