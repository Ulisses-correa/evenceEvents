import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgendaService } from '../../services/agenda.service';
import { CarrinhoService } from '../../services/carrinho';
import { Evento, Categoria, Disponibilidade } from '../../models/agenda.model';

@Component({
  selector: 'app-evento-detalhes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './evento-detalhes.html',
  styles: [`
    .container {
      max-width: 800px;
    }

    .invalid-feedback {
      display: block;
      font-size: 0.85rem;
    }

    .card-image {
      width: 100%;
      height: 400px;
      object-fit: cover;
      border-radius: 8px;
    }

    .card-image-placeholder {
      width: 100%;
      height: 400px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      border-radius: 8px;
    }

    .card-image-placeholder i {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    /* Estilos modernos para os cards de detalhes */
    .card {
      background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
      border: 1px solid rgba(148, 163, 184, 0.2);
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.2);
      transition: all 0.3s ease;
      color: #f1f5f9;
    }

    .card:hover {
      background: linear-gradient(135deg, #1e293b 0%, #334155 70%, #475569 100%);
      border-color: rgba(37, 99, 235, 0.3);
      box-shadow: 0 15px 35px rgba(15, 23, 42, 0.3);
    }

    .card-header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
      border-bottom: 1px solid rgba(148, 163, 184, 0.2);
      color: white !important;
    }

    .card-header h4 {
      color: white !important;
      font-weight: 700;
    }

    .card-body {
      background: transparent;
    }

    .card-body h5 {
      color: #f1f5f9;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .card-body .text-white {
      color: #f1f5f9 !important;
    }

    .card-body .text-info {
      color: #06b6d4 !important;
      font-weight: 500;
    }

    .card-body strong {
      color: #f1f5f9;
      font-weight: 600;
    }

    .card-body p {
      color: #cbd5e1;
      line-height: 1.6;
    }

    .badge {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
      color: white;
      font-weight: 600;
      border-radius: 20px;
      padding: 0.375rem 0.875rem;
      font-size: 0.8rem;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }

    hr {
      border-color: rgba(148, 163, 184, 0.3);
      margin: 1.5rem 0;
    }

    /* Formulário de edição */
    .card-form-body {
      background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
    }

    .form-label {
      color: #f1f5f9 !important;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .form-control {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.3);
      color: #f1f5f9;
      border-radius: 0.5rem;
    }

    .form-control:focus {
      background: rgba(15, 23, 42, 0.7);
      border-color: #2563eb;
      color: #f1f5f9;
      box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.25);
    }

    .form-control::placeholder {
      color: #64748b;
    }

    .input-group-text {
      background: rgba(37, 99, 235, 0.1);
      border: 1px solid rgba(148, 163, 184, 0.3);
      color: #06b6d4;
    }

    .btn-alugar {
      background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%) !important;
      color: #ffffff !important;
      border: none !important;
      font-weight: 700;
      box-shadow: 0 12px 25px rgba(16, 185, 129, 0.25);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .btn-alugar:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 35px rgba(16, 185, 129, 0.35);
    }

    .btn-alugar-hour {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
      color: #ffffff !important;
      border: none !important;
      font-weight: 700;
      box-shadow: 0 12px 25px rgba(245, 158, 11, 0.25);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .btn-alugar-hour:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 35px rgba(245, 158, 11, 0.35);
    }

    .form-select {
      background: rgba(15, 23, 42, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.3);
      color: #f1f5f9;
      border-radius: 0.5rem;
    }

    .form-select:focus {
      background: rgba(15, 23, 42, 0.7);
      border-color: #2563eb;
      color: #f1f5f9;
    }

    .form-select option {
      background: #1e293b;
      color: #f1f5f9;
    }

    .text-muted {
      color: #64748b !important;
    }

    .invalid-feedback {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .is-invalid {
      border-color: #ef4444 !important;
    }

    .is-invalid:focus {
      border-color: #ef4444 !important;
      box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.25) !important;
    }
  `]
})
export class EventoDetalhesComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private agendaService = inject(AgendaService);
  private carrinhoService = inject(CarrinhoService);

  evento = signal<Evento | null>(null);
  categorias = signal<Categoria[]>([]);
  loading = signal(false);
  editando = signal(false);
  erro = signal('');
  quantidadeCarrinho = signal(0);

  // Propriedades para disponibilidade
  disponibilidade = signal<Disponibilidade[]>([]);
  dataSelecionada = signal<string>('');
  horarioSelecionado = signal<string>('');
  horariosDisponiveis = signal<string[]>([]);
  disponibilidadeSelecionada = signal<Disponibilidade | null>(null);

  eventoForm!: FormGroup;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarEvento(id);
      this.carregarCategorias();
    }
    this.atualizarQuantidadeCarrinho();
  }

  private carregarDisponibilidade(eventoId: string) {
    // Simulando carregamento de disponibilidade (normalmente viria da API)
    const todasDisponibilidades = JSON.parse(localStorage.getItem('disponibilidade') || '[]');
    const dispEvento = todasDisponibilidades.filter((d: Disponibilidade) => d.eventoId === eventoId);
    this.disponibilidade.set(dispEvento);
  }

  onDataChange(event: any) {
    const dataSelecionada = event.target.value;
    this.dataSelecionada.set(dataSelecionada);

    // Gerar todos os horários de hora em hora das 09:00 às 18:00
    const horarios = [];
    for (let hora = 9; hora <= 18; hora++) {
      const horarioFormatado = `${hora.toString().padStart(2, '0')}:00`;
      horarios.push(horarioFormatado);
    }

    this.horariosDisponiveis.set(horarios);
    this.horarioSelecionado.set('');
    this.disponibilidadeSelecionada.set(null);
  }

  onHorarioChange(event: any) {
    const horarioSelecionado = event.target.value;
    this.horarioSelecionado.set(horarioSelecionado);

    // Criar uma disponibilidade mockada para o horário selecionado
    // Como todos os horários estão sempre disponíveis, não precisamos verificar disponibilidade específica
    const dispMockada: Disponibilidade = {
      id: `disp-${this.evento()?.id}-${this.dataSelecionada()}-${horarioSelecionado}`,
      eventoId: this.evento()?.id || '',
      data: this.dataSelecionada(),
      horario: horarioSelecionado,
      quantidadeTotal: 5, // Sempre disponível
      quantidadeDisponivel: 5
    };

    this.disponibilidadeSelecionada.set(dispMockada);
  }

  private carregarEvento(id: string) {
    this.loading.set(true);
    this.agendaService.getEventoById(id).subscribe({
      next: (evento) => {
        this.evento.set(evento);
        this.inicializarFormulario(evento);
        this.carregarDisponibilidade(id);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Erro ao carregar evento:', err);
        this.erro.set('Evento não encontrado.');
        this.loading.set(false);
      }
    });
  }

  private carregarCategorias() {
    this.agendaService.getCategorias().subscribe({
      next: (categorias) => this.categorias.set(categorias),
      error: (err) => console.error('Erro ao carregar categorias:', err)
    });
  }

  private inicializarFormulario(evento: Evento) {
    this.eventoForm = this.fb.group({
      titulo: [evento.titulo, [Validators.required, Validators.minLength(5)]],
      data: [evento.data, Validators.required],
      local: [evento.local, Validators.required],
      categoriaId: [evento.categoriaId, Validators.required],
      descricao: [evento.descricao, [Validators.required, Validators.maxLength(200)]],
      fotoUrl: [evento.fotoUrl || '']
    });
  }

  toggleEdicao() {
    this.editando.set(!this.editando());
  }

  salvarAlteracoes() {
    if (this.eventoForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.loading.set(true);
    const eventoAtualizado = {
      ...this.evento(),
      ...this.eventoForm.value
    };

    this.agendaService.atualizarEvento(eventoAtualizado).subscribe({
      next: () => {
        this.evento.set(eventoAtualizado);
        this.editando.set(false);
        this.loading.set(false);
        alert('Evento atualizado com sucesso!');
      },
      error: (err: any) => {
        console.error('Erro ao atualizar evento:', err);
        this.erro.set('Erro ao atualizar evento.');
        this.loading.set(false);
      }
    });
  }

  excluirEvento() {
    if (!this.evento()) return;

    const confirmar = confirm('Tem certeza que deseja excluir este evento?');
    if (!confirmar) return;

    this.loading.set(true);
    this.agendaService.excluirEvento(this.evento()!.id).subscribe({
      next: () => {
        this.loading.set(false);
        alert('Evento excluído com sucesso!');
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        console.error('Erro ao excluir evento:', err);
        this.erro.set('Erro ao excluir evento.');
        this.loading.set(false);
      }
    });
  }

  private marcarCamposComoTocados() {
    Object.values(this.eventoForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  get f() {
    return this.eventoForm.controls;
  }

  getNomeCategoria(categoriaId: string | undefined): string {
    if (!categoriaId) return 'Categoria não definida';
    const categoria = this.categorias().find(cat => cat.id === categoriaId);
    return categoria ? categoria.nome : 'Categoria não encontrada';
  }

  adicionarAoCarrinho(tipoAluguel: '30min' | '1hora') {
    if (!this.evento()) return;

    // Verificar se data e horário foram selecionados
    if (!this.dataSelecionada() || !this.horarioSelecionado()) {
      alert('Por favor, selecione uma data e horário.');
      return;
    }

    const preco = tipoAluguel === '30min' ? this.evento()!.preco30min : this.evento()!.preco1hora;
    if (!preco) {
      alert('Preço não definido para este tipo de aluguel.');
      return;
    }

    // Como todos os horários estão sempre disponíveis, não precisamos verificar disponibilidade
    this.carrinhoService.adicionarItemComDisponibilidade(
      this.evento()!,
      tipoAluguel,
      1,
      this.dataSelecionada(),
      this.horarioSelecionado(),
      this.disponibilidadeSelecionada()?.id || `disp-${this.evento()!.id}-${this.dataSelecionada()}-${this.horarioSelecionado()}`
    );

    this.atualizarQuantidadeCarrinho();

    alert(`Carro adicionado ao carrinho!\nTipo: ${tipoAluguel === '30min' ? '30 minutos' : '1 hora'}\nData: ${this.formatarData(this.dataSelecionada())}\nHorário: ${this.horarioSelecionado()}\nPreço: R$ ${preco.toFixed(2)}`);
  }

  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  getDataMinima(): string {
    const hoje = new Date();
    return hoje.toISOString().split('T')[0];
  }

  private atualizarQuantidadeCarrinho() {
    this.quantidadeCarrinho.set(this.carrinhoService.getQuantidadeTotal());
  }
}
