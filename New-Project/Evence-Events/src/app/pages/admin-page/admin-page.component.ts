import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
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
  abaAtiva: 'dashboard' | 'eventos' | 'admins' | 'aprovacoes' = 'dashboard';

  // Estatísticas
  stats = {
    totalEventos: 0,
    totalAdmins: 0,
    totalVendas: 0,
    receitaEstimada: 0,
    pendentes: 0
  };

  // Eventos
  eventos: Evento[] = [];
  categorias: Categoria[] = [];
  buscaTermo = '';
  categoriaFiltro = 'todas';
  eventosFiltrados: Evento[] = [];
  
  // Solicitações (Aprovações)
  solicitacoes: Evento[] = [];

  // Modal de edição/criação de evento
  modalAberto = false;
  modoEdicao = false;
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
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.editarForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      local: ['', [Validators.required, Validators.minLength(3)]],
      cidade: ['', [Validators.required]],
      data: ['', [Validators.required]],
      horario: ['', [Validators.required]],
      categoria: ['', [Validators.required]],
      precoMinimo: [0, [Validators.required, Validators.min(0)]],
      descricaoLonga: ['', [Validators.minLength(10)]],
      destaque: [false],
      esgotado: [false],
      totalIngressos: [100, [Validators.required, Validators.min(1)]],
      vendidos: [0, [Validators.required, Validators.min(0)]]
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

    // Checar parâmetros de sucesso ou troca de aba vindo de redirecionamentos
    this.route.queryParamMap.subscribe(params => {
      const success = params.get('success');
      const tab = params.get('tab');

      if (success) {
        this.sucessoMensagem = success;
        setTimeout(() => this.sucessoMensagem = '', 5000);
      }

      if (tab && (tab === 'aprovacoes' || tab === 'eventos' || tab === 'admins' || tab === 'dashboard')) {
        this.abaAtiva = tab as any;
      }
    });
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
        this.calcularStats();
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
        this.calcularStats();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar usuários:', err);
      }
    });

    this.eventosService.getSolicitacoes().subscribe({
      next: (solicitacoes) => {
        this.solicitacoes = solicitacoes || [];
        this.calcularStats();
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar solicitações:', err);
        this.carregando = false;
      }
    });
  }

  calcularStats(): void {
    this.stats.totalEventos = this.eventos.length;
    this.stats.totalAdmins = this.usuarios.filter(u => u.isAdmin).length;
    this.stats.totalVendas = this.eventos.reduce((acc, e) => acc + (e.vendidos || 0), 0);
    this.stats.receitaEstimada = this.eventos.reduce((acc, e) => acc + ((e.vendidos || 0) * (e.precoMinimo || 0)), 0);
    this.stats.pendentes = this.solicitacoes.length;
  }

  // --- CURADORIA (APROVAÇÕES) ---

  aprovarEvento(evento: Evento): void {
    this.carregando = true;
    this.eventosService.criarEvento(evento).subscribe({
      next: () => {
        this.eventosService.deletarSolicitacao(evento.id).subscribe({
          next: () => {
            this.sucessoMensagem = 'Evento aprovado e publicado com sucesso!';
            this.carregarDados();
            setTimeout(() => this.sucessoMensagem = '', 3000);
          }
        });
      },
      error: (err) => {
        this.erroGeral = 'Erro ao aprovar evento';
        this.carregando = false;
      }
    });
  }

  reprovarEvento(id: number): void {
    if (!confirm('Tem certeza que deseja reprovar e deletar esta solicitação?')) return;
    
    this.carregando = true;
    this.eventosService.deletarSolicitacao(id).subscribe({
      next: () => {
        this.sucessoMensagem = 'Solicitação removida.';
        this.carregarDados();
        setTimeout(() => this.sucessoMensagem = '', 3000);
      },
      error: (err) => {
        this.erroGeral = 'Erro ao reprovar';
        this.carregando = false;
      }
    });
  }

  trocarAba(aba: 'dashboard' | 'eventos' | 'admins' | 'aprovacoes'): void {
    this.abaAtiva = aba;
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

  abrirModalCriacao(): void {
    this.modoEdicao = false;
    this.eventoSelecionado = null;
    this.editarForm.reset({
      precoMinimo: 0,
      totalIngressos: 100,
      vendidos: 0,
      destaque: false,
      esgotado: false
    });
    this.modalAberto = true;
  }

  abrirModalEdicao(evento: Evento): void {
    this.modoEdicao = true;
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

  salvarEvento(): void {
    if (this.editarForm.invalid) {
      this.editarForm.markAllAsTouched();
      return;
    }

    this.editarCarregando = true;
    this.erroGeral = '';
    this.sucessoMensagem = '';

    const dadosForm = this.editarForm.value;
    
    if (this.modoEdicao && this.eventoSelecionado) {
      // Atualizar
      const eventoAtualizado: Evento = {
        ...this.eventoSelecionado,
        ...dadosForm
      };

      this.eventosService.atualizarEvento(this.eventoSelecionado.id, eventoAtualizado).subscribe({
        next: () => this.finalizarSucesso('Evento atualizado com sucesso!'),
        error: (err) => this.finalizarErro('Erro ao atualizar o evento', err)
      });
    } else {
      // Criar
      const novoEvento: Evento = {
        ...dadosForm,
        id: Math.floor(Math.random() * 1000000), // Simulação de ID
        dataISO: dadosForm.data, // Garantir consistência
        estado: 'SP' // Valor padrão se não houver no form
      };

      this.eventosService.criarEvento(novoEvento).subscribe({
        next: () => this.finalizarSucesso('Evento criado com sucesso!'),
        error: (err) => this.finalizarErro('Erro ao criar o evento', err)
      });
    }
  }

  private finalizarSucesso(msg: string): void {
    this.editarCarregando = false;
    this.sucessoMensagem = msg;
    this.fecharModalEdicao();
    setTimeout(() => {
      this.carregarDados();
      this.sucessoMensagem = '';
    }, 1500);
  }

  private finalizarErro(msg: string, err: any): void {
    console.error(msg, err);
    this.erroGeral = msg;
    this.editarCarregando = false;
    this.cdr.detectChanges();
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

}
