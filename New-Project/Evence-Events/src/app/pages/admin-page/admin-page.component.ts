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
  abaAtiva: 'dashboard' | 'eventos' | 'admins' | 'aprovacoes' | 'produtores' = 'dashboard';

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
  tipoCadastroAdmin: 'novo' | 'existente' = 'novo';
  usuariosNaoAdmins: Usuario[] = [];
  idsSelecionadosParaAdmin: (string | number)[] = [];
  buscaExistente = '';

  // Filtros da aba Usuários/Produtores
  filtroTipoUsuario: 'todos' | 'produtor' | 'usuario' = 'todos';
  filtroTipoPessoa: 'todos' | 'fisica' | 'juridica' = 'todos';
  criarAdminForm!: FormGroup;
  criandoAdmin = false;

  // Suspensão e Exclusão
  confirmacaoAdminAberta = false;
  confirmacaoSuspensaoAberta = false;
  adminParaExcluir: Usuario | null = null;
  usuarioParaSuspender: Usuario | null = null;
  excluindoAdmin = false;
  suspendendoUsuario = false;

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

      console.log('AdminPage: Aba detectada na URL:', tab);

      if (success) {
        this.sucessoMensagem = success;
        setTimeout(() => this.sucessoMensagem = '', 5000);
      }

      if (tab && ['aprovacoes', 'eventos', 'admins', 'dashboard', 'produtores'].includes(tab)) {
        this.abaAtiva = tab as any;
        this.aplicarFiltrosUsuarios();
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
        // Apenas pessoas físicas que não são admins
        this.usuariosNaoAdmins = this.usuarios.filter(u => !u.isAdmin && u.tipoPessoa === 'fisica');
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

  // --- MODAL ADMIN ---
  
  abrirModalCriarAdmin(): void {
    this.modalAdminAberto = true;
    this.tipoCadastroAdmin = 'novo';
    this.idsSelecionadosParaAdmin = [];
    this.buscaExistente = '';
    this.criarAdminForm.reset();
  }

  fecharModalCriarAdmin(): void {
    this.modalAdminAberto = false;
  }

  setTipoCadastro(tipo: 'novo' | 'existente'): void {
    this.tipoCadastroAdmin = tipo;
  }

  toggleSelecaoUsuario(id: string | number | undefined): void {
    if (id === undefined) return;
    const index = this.idsSelecionadosParaAdmin.indexOf(id);
    if (index === -1) {
      this.idsSelecionadosParaAdmin.push(id);
    } else {
      this.idsSelecionadosParaAdmin.splice(index, 1);
    }
  }

  isUsuarioSelecionado(id: string | number | undefined): boolean {
    if (id === undefined) return false;
    return this.idsSelecionadosParaAdmin.includes(id);
  }

  criarNovoAdmin(): void {
    if (this.criarAdminForm.invalid || this.criandoAdmin) return;

    this.criandoAdmin = true;
    const novoAdmin: Usuario = {
      ...this.criarAdminForm.value,
      isAdmin: true,
      isProdutor: false,
      tipoPessoa: 'fisica'
    };

    this.eventosService.cadastro(novoAdmin).subscribe({
      next: () => {
        this.sucessoMensagem = 'Novo administrador criado com sucesso!';
        this.fecharModalCriarAdmin();
        this.carregarDados();
        setTimeout(() => this.sucessoMensagem = '', 3000);
        this.criandoAdmin = false;
      },
      error: () => {
        this.erroGeral = 'Erro ao criar administrador';
        this.criandoAdmin = false;
      }
    });
  }

  promoverParaAdmin(): void {
    if (this.idsSelecionadosParaAdmin.length === 0 || this.criandoAdmin) return;
    
    this.criandoAdmin = true;
    let processados = 0;
    const total = this.idsSelecionadosParaAdmin.length;

    this.idsSelecionadosParaAdmin.forEach(id => {
      const user = this.usuarios.find(u => u.id === id);
      if (user) {
        const userAtualizado = { ...user, isAdmin: true };
        this.eventosService.atualizarUsuario(user.id!, userAtualizado).subscribe({
          next: () => {
            processados++;
            if (processados === total) {
              this.sucessoMensagem = `${total} usuário(s) promovido(s) com sucesso!`;
              this.finalizarPromocao();
            }
          },
          error: () => {
            processados++;
            this.erroGeral = 'Erro ao promover alguns usuários';
            if (processados === total) this.finalizarPromocao();
          }
        });
      } else {
        processados++;
        if (processados === total) this.finalizarPromocao();
      }
    });
  }

  private finalizarPromocao(): void {
    this.fecharModalCriarAdmin();
    this.carregarDados();
    setTimeout(() => {
      this.sucessoMensagem = '';
      this.erroGeral = '';
    }, 3000);
    this.criandoAdmin = false;
  }

  get usuariosFiltradosParaPromo(): Usuario[] {
    if (!this.buscaExistente.trim()) return this.usuariosNaoAdmins;
    const termo = this.buscaExistente.toLowerCase();
    return this.usuariosNaoAdmins.filter(u => 
      u.nome.toLowerCase().includes(termo) || 
      u.email.toLowerCase().includes(termo)
    );
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

  trocarAba(aba: 'dashboard' | 'eventos' | 'admins' | 'aprovacoes' | 'produtores'): void {
    this.abaAtiva = aba;
    // Atualizar a URL para que o F5 mantenha a aba correta
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: aba },
      queryParamsHandling: 'merge'
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

  // --- USUÁRIOS/PRODUTORES ---

  aplicarFiltrosUsuarios(): void {
    // Filtrar por tipo dependendo da aba ativa
    let resultado = [];
    if (this.abaAtiva === 'admins') {
      resultado = this.usuarios.filter(u => u.isAdmin);
    } else {
      // Aba Usuários/Produtores: Mostra todos que NÃO são administradores
      resultado = this.usuarios.filter(u => !u.isAdmin);

      // Filtro por Tipo de Usuário (Produtor ou Usuário Comum)
      if (this.filtroTipoUsuario === 'produtor') {
        resultado = resultado.filter(u => u.isProdutor);
      } else if (this.filtroTipoUsuario === 'usuario') {
        resultado = resultado.filter(u => !u.isProdutor);
      }

      // Filtro por Tipo de Pessoa (Física ou Jurídica)
      if (this.filtroTipoPessoa === 'fisica') {
        resultado = resultado.filter(u => u.tipoPessoa === 'fisica');
      } else if (this.filtroTipoPessoa === 'juridica') {
        resultado = resultado.filter(u => u.tipoPessoa === 'juridica');
      }
    }

    if (this.buscaUsuario.trim()) {
      const termo = this.buscaUsuario.toLowerCase().trim();
      resultado = resultado.filter(u =>
        u.nome.toLowerCase().includes(termo) ||
        (u.nomeEmpresa && u.nomeEmpresa.toLowerCase().includes(termo)) ||
        u.email.toLowerCase().includes(termo)
      );
    }

    this.usuariosFiltrados = resultado;
  }

  alternarVerificacao(usuario: Usuario): void {
    if (!usuario.id) return;
    
    const novoStatus = !usuario.verificado;
    const usuarioAtualizado = { ...usuario, verificado: novoStatus };

    this.eventosService.atualizarUsuario(usuario.id, usuarioAtualizado).subscribe({
      next: () => {
        usuario.verificado = novoStatus;
        this.sucessoMensagem = `Status de verificação de "${usuario.nomeEmpresa || usuario.nome}" atualizado!`;
        setTimeout(() => this.sucessoMensagem = '', 3000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao atualizar verificação:', err);
        this.erroGeral = 'Erro ao atualizar verificação';
      }
    });
  }

  onBuscaUsuarioChange(): void {
    this.aplicarFiltrosUsuarios();
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

    // Não permitir remover a si mesmo
    if (this.usuarioLogado && this.usuarioLogado.id === this.adminParaExcluir.id) {
      this.erroGeral = 'Você não pode remover seu próprio acesso administrativo!';
      this.cdr.detectChanges();
      return;
    }

    this.excluindoAdmin = true;
    this.erroGeral = '';
    this.sucessoMensagem = '';

    // Em vez de deletar, apenas removemos o cargo de admin
    const usuarioAtualizado = { ...this.adminParaExcluir, isAdmin: false };

    this.eventosService.atualizarUsuario(this.adminParaExcluir.id, usuarioAtualizado).subscribe({
      next: () => {
        this.excluindoAdmin = false;
        this.sucessoMensagem = 'Acesso administrativo removido com sucesso!';
        this.fecharConfirmacaoAdmin();
        setTimeout(() => {
          this.carregarDados();
          this.sucessoMensagem = '';
        }, 1500);
      },
      error: (err) => {
        console.error('Erro ao remover acesso:', err);
        this.erroGeral = 'Erro ao remover o acesso administrativo';
        this.excluindoAdmin = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirConfirmacaoSuspensao(usuario: Usuario): void {
    this.usuarioParaSuspender = usuario;
    this.confirmacaoSuspensaoAberta = true;
  }

  fecharConfirmacaoSuspensao(): void {
    this.confirmacaoSuspensaoAberta = false;
    this.usuarioParaSuspender = null;
  }

  confirmarSuspensaoUsuario(): void {
    if (!this.usuarioParaSuspender || !this.usuarioParaSuspender.id) return;

    this.suspendendoUsuario = true;
    const novoStatus = !this.usuarioParaSuspender.estaSuspenso;
    const usuarioAtualizado = { ...this.usuarioParaSuspender, estaSuspenso: novoStatus };

    this.eventosService.atualizarUsuario(this.usuarioParaSuspender.id, usuarioAtualizado).subscribe({
      next: () => {
        this.suspendendoUsuario = false;
        this.sucessoMensagem = `Usuário ${novoStatus ? 'suspenso' : 'reativado'} com sucesso!`;
        this.fecharConfirmacaoSuspensao();
        setTimeout(() => {
          this.carregarDados();
          this.sucessoMensagem = '';
        }, 1500);
      },
      error: (err) => {
        console.error('Erro ao alternar suspensão:', err);
        this.erroGeral = 'Erro ao processar suspensão';
        this.suspendendoUsuario = false;
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
