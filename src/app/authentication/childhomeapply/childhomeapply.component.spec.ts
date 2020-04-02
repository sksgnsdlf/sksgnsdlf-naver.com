import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildhomeapplyComponent } from './childhomeapply.component';

describe('ChildhomeapplyComponent', () => {
  let component: ChildhomeapplyComponent;
  let fixture: ComponentFixture<ChildhomeapplyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildhomeapplyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildhomeapplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
