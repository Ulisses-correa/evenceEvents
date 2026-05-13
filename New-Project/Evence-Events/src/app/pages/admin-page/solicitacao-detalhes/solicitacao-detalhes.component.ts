import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { EventosService } from '../../../services/services';
import { Evento } from '../../../interfaces/evento.interface';
import { Usuario } from '../../../interfaces/usuario.interface';
import { HeaderComponent } from '../../../componentes/header/header';

@Component({
  selector: 'app-solicitacao-detalhes',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  templateUrl: './solicitacao-detalhes.component.html',
  styleUrl: './solicitacao-detalhes.component.css'
})
export class SolicitacaoDetalhesComponent implements OnInit {
  solicitacao: Evento | null = null;
  produtor: Usuario | null = null;
  carregando = true;
  erro = false;
  processando = false;
  totalEventosProdutor = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.carregarSolicitacao(id);
      }
    });
  }

  carregarSolicitacao(id: string): void {
    this.carregando = true;
    this.eventosService.getSolicitacaoById(id).subscribe({
      next: (dados) => {
        this.solicitacao = dados;
        if (this.solicitacao?.produtorId) {
          this.eventosService.getUsuarioById(this.solicitacao.produtorId).subscribe({
            next: (u) => {
              this.produtor = u;
              
              // Buscar contagem real de eventos do produtor
              if (this.produtor && this.produtor.id) {
                this.eventosService.getEventosByProdutor(this.produtor.id).subscribe({
                  next: (eventos) => {
                    this.totalEventosProdutor = eventos.length;
                    this.carregando = false;
                    this.cdr.detectChanges();
                  },
                  error: () => {
                    this.carregando = false;
                    this.cdr.detectChanges();
                  }
                });
              } else {
                this.carregando = false;
                this.cdr.detectChanges();
              }
            },
            error: () => {
              this.carregando = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          this.carregando = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.erro = true;
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aprovar(): void {
    if (!this.solicitacao || this.processando) return;
    this.processando = true;
    
    this.eventosService.criarEvento(this.solicitacao).subscribe({
      next: () => {
        this.eventosService.deletarSolicitacao(this.solicitacao!.id).subscribe({
          next: () => this.router.navigate(['/admin'], { queryParams: { tab: 'aprovacoes', success: 'Evento aprovado com sucesso!' } }),
          error: () => this.processando = false
        });
      },
      error: () => this.processando = false
    });
  }

  reprovar(): void {
    if (!this.solicitacao || this.processando) return;
    if (!confirm('Tem certeza que deseja reprovar e excluir esta solicitação?')) return;
    
    this.processando = true;
    this.eventosService.deletarSolicitacao(this.solicitacao.id).subscribe({
      next: () => this.router.navigate(['/admin'], { queryParams: { tab: 'aprovacoes', success: 'Solicitação removida.' } }),
      error: () => this.processando = false
    });
  }

  formatarPreco(valor: number): string {
    if (valor === 0) return 'Gratuito';
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  }
}
