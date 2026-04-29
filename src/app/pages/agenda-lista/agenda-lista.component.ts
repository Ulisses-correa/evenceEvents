import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgendaService } from '../../services/agenda.service';
import { Evento } from '../../models/agenda.model';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-agenda-lista',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './agenda-lista.component.html',
  styles: [``]
})
export class AgendaListaComponent implements OnInit {

  private agendaService = inject(AgendaService);
  private router = inject(Router);

  eventos = signal<Evento[]>([]);
  termoBusca = signal('');
  loading = signal(false);
  erro = signal('');

  // Filtro computado para buscar no título e local
  eventosFiltrados = computed(() => {
    const termo = this.termoBusca().toLowerCase();

    if (!termo) {
      return this.eventos();
    }

    return this.eventos().filter(evento =>
      evento.titulo.toLowerCase().includes(termo) ||
      evento.local.toLowerCase().includes(termo)
    );
  });

  eventoDestaqueId = computed(() => {
    return this.eventos().length > 0 ? this.eventos()[0].id : '';
  });

  ngOnInit(): void {
    this.carregarEventos();
  }

  // Carrega eventos do serviço
  carregarEventos(): void {
    this.loading.set(true);
    this.erro.set('');

    this.agendaService.getEventos().subscribe({
      next: (res: Evento[]) => {
        this.eventos.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar eventos:', err);
        this.erro.set('Erro ao carregar eventos. Tente novamente.');
        this.loading.set(false);
      }
    });
  }

  // Atualiza termo de busca
  filtrar(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.termoBusca.set(input.value);
  }

  // Navega para detalhes do evento
  verDetalhes(evento: Evento): void {
    if (evento.id) {
      this.router.navigate(['/evento', evento.id]);
    } else {
      console.warn('Evento sem ID:', evento);
    }
  }

  // Abre página de edição do evento
  abrirDetalhes(evento: Evento): void {
    if (evento.id) {
      this.router.navigate(['/evento', evento.id]);
    } else {
      console.warn('Evento sem ID:', evento);
    }
  }

  // TrackBy para reduzir re-renderizações
  trackByEventoId(index: number, evento: Evento): string {
    return evento.id;
  }

  // Remove evento com confirmação
  remover(id: string): void {
    const confirmar = confirm('Deseja excluir este evento?');
    if (!confirmar) return;

    this.agendaService.excluirEvento(id).subscribe({
      next: () => {
        // Atualiza lista local removendo evento excluído
        this.eventos.update(lista => lista.filter(e => e.id !== id));
        alert('Evento excluído com sucesso!');
      },
      error: (err: any) => {
        console.error('Erro ao excluir evento:', err);
        alert('Erro ao excluir evento. Tente novamente.');
      }
    });
  }

  // Recarrega lista de eventos
  recarregar(): void {
    this.carregarEventos();
  }

}