import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

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

  imagemPreview: string | null = null;

  lotes: Lote[] = [{ nome: '1º Lote', preco: 0, quantidade: 100 }];

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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
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
    const file = input.files?.[0];
    if (file) this.processarImagem(file);
  }

  onImagemDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) this.processarImagem(file);
  }

  private processarImagem(file: File): void {
    if (file.size > 5 * 1024 * 1024) {
      this.erroGeral = 'A imagem deve ter no máximo 5 MB.';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.imagemPreview = reader.result as string;
      this.erroGeral = '';
    };
    reader.readAsDataURL(file);
  }

  removerImagem(event: Event): void {
    event.stopPropagation();
    this.imagemPreview = null;
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

    if (!this.eventoForm.get('aceitaTermos')?.value) {
      return;
    }

    this.carregando = true;
    this.erroGeral = '';

    try {
      // Simula chamada à API
      await new Promise(res => setTimeout(res, 2000));
      this.eventoPublicado = true;
    } catch {
      this.erroGeral = 'Erro ao publicar o evento. Tente novamente.';
    } finally {
      this.carregando = false;
    }
  }
}
