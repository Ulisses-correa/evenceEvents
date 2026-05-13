import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventosService } from '../../services/services';
import { Evento } from '../../interfaces/evento.interface';

interface Lote {
  nome: string;
  preco: number;
  quantidade: number;
}

interface Categoria {
  valor: string;
  nome: string;
}

interface TipoOpcao {
  valor: string;
  nome: string;
  icone: string;
}

@Component({
  selector: 'app-criar-evento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './criar-evento.component.html',
  styleUrl: './criar-evento.component.css',
})
export class CriarEventoComponent implements OnInit {
  eventoForm!: FormGroup;
  carregando = false;
  erroGeral = '';
  eventoPublicado = false;
  tentouPublicar = false;

  etapaAtual = 0;
  etapas = ['Informações', 'Local & Data', 'Ingressos', 'Revisão'];

  imagensBase64: string[] = [];
  lotes: Lote[] = [{ nome: '1º Lote', preco: 0, quantidade: 100 }];

  modoEdicao = false;
  eventoEditId: number | string | null = null;
  produtorOriginalId: number | string | null = null;

  categorias: Categoria[] = [
    { valor: 'shows', nome: 'Shows e Música' },
    { valor: 'teatro', nome: 'Teatro e Espetáculos' },
    { valor: 'standup', nome: 'Stand Up Comedy' },
    { valor: 'esportes', nome: 'Esportes' },
    { valor: 'gastronomia', nome: 'Gastronomia' },
    { valor: 'arte_cultura', nome: 'Arte e Cultura' },
    { valor: 'festival', nome: 'Festival' },
    { valor: 'corporativo', nome: 'Corporativo' },
    { valor: 'infantil', nome: 'Infantil' },
    { valor: 'outro', nome: 'Outro' },
  ];

  tiposLocal: TipoOpcao[] = [
    { valor: 'presencial', nome: 'Presencial', icone: 'location_on' },
    { valor: 'online', nome: 'Online', icone: 'videocam' },
    { valor: 'hibrido', nome: 'Híbrido', icone: 'merge' },
  ];

  tiposIngresso: TipoOpcao[] = [
    { valor: 'pago', nome: 'Pago', icone: 'paid' },
    { valor: 'gratuito', nome: 'Gratuito', icone: 'card_giftcard' },
    { valor: 'doacao', nome: 'Doação', icone: 'volunteer_activism' },
  ];

  estados = [
    'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
    'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
    'SP','SE','TO',
  ];

  constructor(
    private fb: FormBuilder,
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ... mantendo o resto igual
    this.eventoForm = this.fb.group({
      // Etapa 1
      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      categoria: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(500)]],

      // Etapa 2
      dataInicio: ['', Validators.required],
      horaInicio: ['', Validators.required],
      dataFim: [''],
      horaFim: [''],
      tipoLocal: ['presencial', Validators.required],
      nomeLocal: [''],
      endereco: [''],
      cidade: [''],
      estado: [''],
      linkOnline: [''],

      // Etapa 3
      tipoIngresso: ['pago', Validators.required],
      capacidade: [null, [Validators.min(1)]],
      politicaReembolso: ['', Validators.required],

      // Etapa 4
      aceitaTermos: [false],
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.modoEdicao = true;
      this.eventoEditId = id;
      this.carregarEventoParaEdicao(id);
    }
  }

  private carregarEventoParaEdicao(id: string): void {
    this.carregando = true;
    this.eventosService.getSolicitacaoById(id).subscribe({
      next: (evento) => {
        this.eventoForm.patchValue({
          nome: evento.titulo,
          categoria: evento.categoria,
          descricao: evento.descricaoLonga,
          dataInicio: evento.dataISO,
          horaInicio: evento.horario,
          dataFim: evento.dataFim || '',
          horaFim: evento.horaFim || '',
          tipoLocal: evento.tipoLocal || (evento.local === 'Online' ? 'online' : 'presencial'),
          nomeLocal: evento.local !== 'Online' ? evento.local : '',
          endereco: '', // Not stored in Evento natively, mock it if needed
          cidade: evento.cidade !== 'Remoto' ? evento.cidade : '',
          estado: evento.estado !== '--' ? evento.estado : '',
          linkOnline: evento.linkOnline || '',
          tipoIngresso: evento.tipoIngresso || 'pago',
          capacidade: evento.totalIngressos,
          politicaReembolso: evento.politicaReembolso || '',
          aceitaTermos: true // Assume terms accepted
        });
        
        this.produtorOriginalId = evento.produtorId ?? null;

        if (evento.imagens && evento.imagens.length > 0) {
          this.imagensBase64 = [...evento.imagens];
        }

        if (evento.lotes && evento.lotes.length > 0) {
          this.lotes = [...evento.lotes];
        } else {
          this.lotes = [{ nome: '1º Lote', preco: evento.precoMinimo || 0, quantidade: evento.totalIngressos || 100 }];
        }

        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.carregando = false;
        this.erroGeral = 'Não foi possível carregar o evento para edição.';
      }
    });
  }

  // ----------------------------------------------------------------
  // Helpers de validação
  // ----------------------------------------------------------------
  campoInvalido(nome: string): boolean {
    const c = this.eventoForm.get(nome);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  campoValido(nome: string): boolean {
    const c = this.eventoForm.get(nome);
    return !!c && c.valid && c.touched;
  }

  getMensagem(nome: string): string {
    const c = this.eventoForm.get(nome);
    if (!c) return '';
    if (c.hasError('required')) return 'Este campo é obrigatório.';
    if (c.hasError('minlength')) {
      const min = c.errors?.['minlength']?.requiredLength;
      return `Mínimo de ${min} caracteres.`;
    }
    if (c.hasError('maxlength')) return 'Limite de caracteres excedido.';
    return '';
  }

  getNomeCategoria(): string {
    const valor = this.eventoForm.get('categoria')?.value;
    return this.categorias.find(c => c.valor === valor)?.nome || '';
  }

  // ----------------------------------------------------------------
  // Navegação entre etapas
  // ----------------------------------------------------------------
  private camposPorEtapa: Record<number, string[]> = {
    0: ['nome', 'categoria', 'descricao'],
    1: ['dataInicio', 'horaInicio', 'tipoLocal'],
    2: ['tipoIngresso', 'politicaReembolso'],
    3: ['aceitaTermos'],
  };

  proximaEtapa(): void {
    const campos = this.camposPorEtapa[this.etapaAtual] || [];
    campos.forEach(c => this.eventoForm.get(c)?.markAsTouched());

    const etapaValida = campos.every(c => {
      const ctrl = this.eventoForm.get(c);
      return ctrl ? ctrl.valid : true;
    });

    if (!etapaValida) return;

    this.etapaAtual = Math.min(this.etapaAtual + 1, this.etapas.length - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  etapaAnterior(): void {
    this.etapaAtual = Math.max(this.etapaAtual - 1, 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  irParaEtapa(index: number): void {
    this.etapaAtual = index;
  }

  // ----------------------------------------------------------------
  // Upload de imagem
  // ----------------------------------------------------------------
  onImagemSelecionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processarImagens(Array.from(input.files));
    }
    // Limpa o input para permitir selecionar a mesma imagem novamente se apagada
    input.value = '';
  }

  onImagemDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.processarImagens(Array.from(event.dataTransfer.files));
    }
  }

  private async processarImagens(files: File[]): Promise<void> {
    const imagensValidas = files.filter(f => f.type.startsWith('image/'));
    const novasImagens: string[] = [];

    for (const file of imagensValidas) {
      if (this.imagensBase64.length + novasImagens.length >= 10) {
        this.erroGeral = 'Você pode adicionar no máximo 10 imagens.';
        break;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        this.erroGeral = `A imagem ${file.name} excede o limite de 2MB.`;
        continue;
      }

      try {
        const base64 = await this.fileToBase64(file);
        novasImagens.push(base64);
      } catch (err) {
        console.error('Erro ao processar imagem:', err);
      }
    }

    if (novasImagens.length > 0) {
      this.imagensBase64 = [...this.imagensBase64, ...novasImagens];
      this.erroGeral = '';
      this.cdr.detectChanges();
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  removerImagem(index: number, event: Event): void {
    event.stopPropagation();
    this.imagensBase64.splice(index, 1);
    this.imagensBase64 = [...this.imagensBase64]; // Trigger change detection
    this.cdr.detectChanges();
  }

  // ----------------------------------------------------------------
  // Lotes
  // ----------------------------------------------------------------
  adicionarLote(): void {
    this.lotes.push({
      nome: `${this.lotes.length + 1}º Lote`,
      preco: 0,
      quantidade: 100,
    });
  }

  removerLote(index: number): void {
    this.lotes.splice(index, 1);
  }

  // ----------------------------------------------------------------
  // Submit
  // ----------------------------------------------------------------
  async onSubmit(): Promise<void> {
    this.tentouPublicar = true;

    if (this.eventoForm.invalid || !this.eventoForm.get('aceitaTermos')?.value) {
      this.eventoForm.markAllAsTouched();
      this.erroGeral = 'Por favor, preencha todos os campos obrigatórios e aceite os termos.';
      return;
    }

    if (this.imagensBase64.length === 0) {
      this.erroGeral = 'Você deve adicionar pelo menos 1 foto do evento.';
      return;
    }

    this.carregando = true;
    this.erroGeral = '';

    const form = this.eventoForm.value;
    
    // Pegar ID do produtor logado
    const userStr = localStorage.getItem('usuarioLogado');
    const user = userStr ? JSON.parse(userStr) : null;

    // Mapeamento para a interface Evento
    const novaSolicitacao: Evento = {
      id: Math.floor(Math.random() * 1000000),
      titulo: form.nome,
      local: form.nomeLocal || 'Online',
      cidade: form.cidade || 'Remoto',
      estado: form.estado || '--',
      data: this.formatarDataExibicao(form.dataInicio),
      dataISO: form.dataInicio,
      horario: form.horaInicio,
      categoria: form.categoria,
      precoMinimo: this.lotes[0]?.preco || 0,
      destaque: false,
      esgotado: false,
      totalIngressos: form.capacidade || 100,
      vendidos: 0,
      descricaoLonga: form.descricao,
      produtorId: this.produtorOriginalId ?? user?.id,
      imagens: this.imagensBase64,
      tipoLocal: form.tipoLocal,
      linkOnline: form.linkOnline,
      dataFim: form.dataFim,
      horaFim: form.horaFim,
      tipoIngresso: form.tipoIngresso,
      politicaReembolso: form.politicaReembolso,
      lotes: [...this.lotes]
    };

    if (this.modoEdicao && this.eventoEditId) {
      // Manter o mesmo ID (preservando tipo string ou number)
      if (typeof this.eventoEditId === 'string' && this.eventoEditId.startsWith('sol_')) {
        (novaSolicitacao as any).id = this.eventoEditId;
      } else if (!isNaN(Number(this.eventoEditId))) {
        novaSolicitacao.id = Number(this.eventoEditId);
      } else {
        (novaSolicitacao as any).id = this.eventoEditId;
      }

      this.eventosService.atualizarSolicitacao(this.eventoEditId, novaSolicitacao).subscribe({
        next: () => {
          this.carregando = false;
          this.eventoPublicado = true;
        },
        error: (err) => {
          console.error('Erro ao atualizar solicitação:', err);
          this.erroGeral = 'Ocorreu um erro ao atualizar seu evento. Tente novamente.';
          this.carregando = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.eventosService.enviarSolicitacao(novaSolicitacao).subscribe({
        next: () => {
          this.carregando = false;
          this.eventoPublicado = true;
        },
        error: (err) => {
          console.error('Erro ao enviar solicitação:', err);
          this.erroGeral = 'Ocorreu um erro ao enviar sua solicitação. Tente novamente.';
          this.carregando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  private formatarDataExibicao(data: string): string {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}
