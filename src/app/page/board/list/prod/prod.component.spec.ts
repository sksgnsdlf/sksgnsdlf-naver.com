import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListProdComponent } from './prod.component';

describe('ListComponent', () => {
  let component: ListProdComponent;
  let fixture: ComponentFixture<ListProdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ListProdComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListProdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
