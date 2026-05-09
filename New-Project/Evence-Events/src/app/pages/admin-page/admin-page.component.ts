import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { EventosService } from '../../services/services';
import { Evento, Categoria } from '../../interfaces/evento.interface';
import { Usuario } from '../../interfaces/usuario.interface';
import { HeaderComponent } from '../../componentes/header/header';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, HeaderComponent],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPageComponent implements OnInit {
  // Estado geral
  usuarioLogado: Usuario | null = null;
  carregando = true;
  erroGeral = '';
  sucessoMensagem = '';
  abaAtiva: 'eventos' | 'admins' = 'eventos';

  // Eventos
  eventos: Evento[] = [];
  categorias: Categoria[] = [];
  buscaTermo = '';
  categoriaFiltro = 'todas';
  eventosFiltrados: Evento[] = [];

  // Modal de edição de evento
  modalAberto = false;
  eventoSelecionado: Evento | null = null;
  editarForm!: FormGroup;
  editarCarregando = false;

  // Confirmação de exclusão de evento
  confirmacaoAberta = false;
  eventoParaExcluir: Evento | null = null;
  excluindoEvento = false;

  // Usuários (Admins)
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  buscaUsuario = '';

  // Modal de criação de admin
  modalAdminAberto = false;
  criarAdminForm!: FormGroup;
  criandoAdmin = false;

  // Confirmação de exclusão de admin
  confirmacaoAdminAberta = false;
  adminParaExcluir: Usuario | null = null;
  excluindoAdmin = false;

  constructor(
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.editarForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      local: ['', [Validators.required, Validators.minLength(3)]],
      cidade: ['', [Validators.required]],
      data: ['', [Validators.required]],
      horario: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      precoMinimo: ['', [Validators.required, Validators.min(0)]],
      descricaoLonga: ['', [Validators.minLength(10)]],
      destaque: [false],
      esgotado: [false],
      totalIngressos: ['', [Validators.required, Validators.min(1)]],
      vendidos: ['', [Validators.required, Validators.min(0)]]
    });

    this.criarAdminForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [Validators.required]],
      dataNascimento: ['', [Validators.required]],
      celular: ['', [Validators.required]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.verificarAcesso();
    this.carregarDados();
  }

  verificarAcesso(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const usuarioStored = localStorage.getItem('usuarioLogado');
    if (!usuarioStored) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioLogado = JSON.parse(usuarioStored);
    if (!this.usuarioLogado?.isAdmin) {
      this.router.navigate(['/']);
    }
  }

  carregarDados(): void {
    this.carregando = true;

    this.eventosService.getCategorias().subscribe({
      next: (categorias) => {
        this.categorias = categorias || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar categorias:', err);
      }
    });

    this.eventosService.getEventos().subscribe({
      next: (eventos) => {
        this.eventos = eventos || [];
        this.aplicarFiltrosEventos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar eventos:', err);
        this.erroGeral = 'Erro ao carregar os eventos';
        this.cdr.detectChanges();
      }
    });

    this.eventosService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios || [];
        this.aplicarFiltrosUsuarios();
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
        this.carregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- EVENTOS ---

  aplicarFiltrosEventos(): void {
    let resultado = [...this.eventos];

    if (this.buscaTermo.trim()) {
      const termo = this.buscaTermo.toLowerCase().trim();
      resultado = resultado.filter(e =>
        e.titulo.toLowerCase().includes(termo) ||
        e.local.toLowerCase().includes(termo) ||
        e.cidade.toLowerCase().includes(termo)
      );
    }

    if (this.categoriaFiltro !== 'todas') {
      resultado = resultado.filter(e => e.categoria === this.categoriaFiltro);
    }

    this.eventosFiltrados = resultado;
  }

  onBuscaChange(): void {
    this.aplicarFiltrosEventos();
  }

  onCategoriaChange(): void {
    this.aplicarFiltrosEventos();
  }

  abrirModalEdicao(evento: Evento): void {
    this.eventoSelecionado = evento;
    this.editarForm.patchValue({
      titulo: evento.titulo,
      local: evento.local,
      cidade: evento.cidade,
      data: evento.dataISO,
      horario: evento.horario,
      categoria: evento.categoria,
      precoMinimo: evento.precoMinimo,
      descricaoLonga: evento.descricaoLonga || '',
      destaque: evento.destaque || false,
      esgotado: evento.esgotado || false,
      totalIngressos: evento.totalIngressos || 0,
      vendidos: evento.vendidos || 0
    });
    this.modalAberto = true;
  }

  fecharModalEdicao(): void {
    this.modalAberto = false;
    this.eventoSelecionado = null;
    this.editarForm.reset();
  }

  salvarEdicao(): void {
    if (this.editarForm.invalid || !this.eventoSelecionado) {
      this.editarForm.markAllAsTouched();
      return;
    }

    this.editarCarregando = true;
    this.erroGeral = '';
    this.sucessoMensagem = '';

    const eventoAtualizado: Evento = {
      ...this.eventoSelecionado,
      ...this.editarForm.value
    };

    this.eventosService.atualizarEvento(this.eventoSelecionado.id, eventoAtualizado).subscribe({
      next: () => {
        this.editarCarregando = false;
        this.sucessoMensagem = 'Evento atualizado com sucesso!';
        this.fecharModalEdicao();
        setTimeout(() => {
          this.carregarDados();
          this.sucessoMensagem = '';
        }, 1500);
      },
      error: (err) => {
        console.error('Erro ao atualizar evento:', err);
        this.erroGeral = 'Erro ao atualizar o evento';
        this.editarCarregando = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirConfirmacaoExclusao(evento: Evento): void {
    this.eventoParaExcluir = evento;
    this.confirmacaoAberta = true;
  }

  fecharConfirmacaoExclusao(): void {
    this.confirmacaoAberta = false;
    this.eventoParaExcluir = null;
  }

  confirmarExclusao(): void {
    if (!this.eventoParaExcluir) return;

    this.excluindoEvento = true;
    this.erroGeral = '';
    this.sucessoMensagem = '';

    this.eventosService.deletarEvento(this.eventoParaExcluir.id).subscribe({
      next: () => {
        this.excluindoEvento = false;
        this.sucessoMensagem = 'Evento deletado com sucesso!';
        this.fecharConfirmacaoExclusao();
        setTimeout(() => {
          this.carregarDados();
          this.sucessoMensagem = '';
        }, 1500);
      },
      error: (err) => {
        console.error('Erro ao deletar evento:', err);
        this.erroGeral = 'Erro ao deletar o evento';
        this.excluindoEvento = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- USUÁRIOS/ADMINS ---

  aplicarFiltrosUsuarios(): void {
    let resultado = this.usuarios.filter(u => u.isAdmin);

    if (this.buscaUsuario.trim()) {
      const termo = this.buscaUsuario.toLowerCase().trim();
      resultado = resultado.filter(u =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
      );
    }

    this.usuariosFiltrados = resultado;
  }

  onBuscaUsuarioChange(): void {
    this.aplicarFiltrosUsuarios();
  }

  abrirModalCriarAdmin(): void {
    this.criarAdminForm.reset();
    this.modalAdminAberto = true;
  }

  fecharModalAdmin(): void {
    this.modalAdminAberto = false;
    this.criarAdminForm.reset();
  }

  criarNovoAdmin(): void {
    if (this.criarAdminForm.invalid) {
      this.criarAdminForm.markAllAsTouched();
      return;
    }

    this.criandoAdmin = true;
    this.erroGeral = '';
    this.sucessoMensagem = '';

    const novoAdmin: Usuario = {
      ...this.criarAdminForm.value,
      isAdmin: true,
      aceitaTermos: true,
      aceitaNewsletter: false,
      isProdutor: false
    };

    this.eventosService.cadastro(novoAdmin).subscribe({
      next: () => {
        this.criandoAdmin = false;
        this.sucessoMensagem = 'Administrador criado com sucesso!';
        this.fecharModalAdmin();
        setTimeout(() => {
          this.carregarDados();
          this.sucessoMensagem = '';
        }, 1500);
      },
      error: (err) => {
        console.error('Erro ao criar administrador:', err);
        this.erroGeral = 'Erro ao criar o administrador';
        this.criandoAdmin = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirConfirmacaoExclusaoAdmin(admin: Usuario): void {
    this.adminParaExcluir = admin;
    this.confirmacaoAdminAberta = true;
  }

  fecharConfirmacaoAdmin(): void {
    this.confirmacaoAdminAberta = false;
    this.adminParaExcluir = null;
  }

  confirmarExclusaoAdmin(): void {
    if (!this.adminParaExcluir || !this.adminParaExcluir.id) return;

    // Não permitir deletar a si mesmo
    if (this.usuarioLogado && this.usuarioLogado.id === this.adminParaExcluir.id) {
      this.erroGeral = 'Você não pode deletar sua própria conta!';
      this.cdr.detectChanges();
      return;
    }

    this.excluindoAdmin = true;
    this.erroGeral = '';
    this.sucessoMensagem = '';

    this.eventosService.deletarUsuario(this.adminParaExcluir.id).subscribe({
      next: () => {
        this.excluindoAdmin = false;
        this.sucessoMensagem = 'Administrador deletado com sucesso!';
        this.fecharConfirmacaoAdmin();
        setTimeout(() => {
          this.carregarDados();
          this.sucessoMensagem = '';
        }, 1500);
      },
      error: (err) => {
        console.error('Erro ao deletar administrador:', err);
        this.erroGeral = 'Erro ao deletar o administrador';
        this.excluindoAdmin = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatarPreco(valor: number): string {
    if (valor === 0) return 'Gratuito';
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  }

  formatarData(data: string): string {
    try {
      const date = new Date(data + 'T00:00:00');
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch {
      return data;
    }
  }

  getNomeCategoriaExibicao(categoriaId: string): string {
    const categoria = this.categorias.find(c => c.id === categoriaId);
    return categoria ? categoria.nome : categoriaId;
  }

  trocarAba(aba: 'eventos' | 'admins'): void {
    this.abaAtiva = aba;
  }
}
