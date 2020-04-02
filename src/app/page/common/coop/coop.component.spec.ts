import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoopComponent } from './coop.component';

describe('CoopComponent', () => {
  let component: CoopComponent;
  let fixture: ComponentFixture<CoopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoopComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
