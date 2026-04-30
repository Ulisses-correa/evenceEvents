import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventoDetalhes } from './evento-detalhes';

describe('EventoDetalhes', () => {
  let component: EventoDetalhes;
  let fixture: ComponentFixture<EventoDetalhes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventoDetalhes],
    }).compileComponents();

    fixture = TestBed.createComponent(EventoDetalhes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
