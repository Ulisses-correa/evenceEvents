import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeusAlugueis } from './meus-alugueis';

describe('MeusAlugueis', () => {
  let component: MeusAlugueis;
  let fixture: ComponentFixture<MeusAlugueis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeusAlugueis],
    }).compileComponents();

    fixture = TestBed.createComponent(MeusAlugueis);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
