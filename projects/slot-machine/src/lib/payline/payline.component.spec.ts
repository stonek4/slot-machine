import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaylineComponent } from './payline.component';

describe('PaylineComponent', () => {
  let component: PaylineComponent;
  let fixture: ComponentFixture<PaylineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaylineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaylineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
