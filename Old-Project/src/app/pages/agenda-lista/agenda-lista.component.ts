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
  styles: [`
    .container {
      padding: 20px;
    }
    .btn-danger {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-danger:hover {
      background-color: #c82333;
    }
    .btn-alugar-banner {
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      border: none;
    }
    .btn-alugar-card {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: none;
      font-weight: 700;
      padding: 0.9rem 1.25rem;
      border-radius: 999px;
      box-shadow: 0 18px 35px rgba(37, 99, 235, 0.18);
      transition: transform 0.25s ease, box-shadow 0.25s ease;
      letter-spacing: 0.02em;
    }
    .btn-alugar-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 22px 40px rgba(37, 99, 235, 0.24);
    }
    .btn-alugar-card {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: none;
      font-weight: 700;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.15);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: 0.02em;
      font-size: 0.95rem;
    }
    .btn-alugar-card:hover {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(37, 99, 235, 0.25);
    }
    .btn-alugar-card:active {
      transform: translateY(0);
      box-shadow: 0 5px 15px rgba(37, 99, 235, 0.2);
    }
    .btn-detalhes-card {
      background: linear-gradient(135deg, #06b6d4, #0891b2);
      color: white;
      border: none;
      font-weight: 600;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(6, 182, 212, 0.15);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 0.85rem;
      white-space: nowrap;
    }
    .btn-detalhes-card:hover {
      background: linear-gradient(135deg, #0891b2, #0e7490);
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(6, 182, 212, 0.25);
    }
    .btn-detalhes-card:active {
      transform: translateY(0);
      box-shadow: 0 5px 15px rgba(6, 182, 212, 0.2);
    }
    .btn-delete-card {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      border: none;
      font-weight: 700;
      padding: 0.75rem;
      border-radius: 8px;
      width: 44px;
      height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(239, 68, 68, 0.15);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-delete-card:hover {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(239, 68, 68, 0.25);
    }
    .btn-delete-card:active {
      transform: translateY(0);
      box-shadow: 0 5px 15px rgba(239, 68, 68, 0.2);
    }
    .search-box {
      margin-bottom: 20px;
    }
  `]
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