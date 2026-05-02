import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraInfosComponent } from './extra-infos.component';

describe('ExtraInfosComponent', () => {
  let component: ExtraInfosComponent;
  let fixture: ComponentFixture<ExtraInfosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtraInfosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExtraInfosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
