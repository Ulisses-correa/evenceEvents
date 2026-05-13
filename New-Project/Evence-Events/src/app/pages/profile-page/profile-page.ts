import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../interfaces/usuario.interface';
import { EventosService } from '../../services/services';
import { HeaderComponent } from '../../componentes/header/header';
import { Evento } from '../../interfaces/evento.interface';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HeaderComponent],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css'
})
export class ProfilePageComponent implements OnInit {
  usuario: Usuario | null = null;
  usuarioOriginal: Usuario | null = null;

  // Controle de Abas
  abaAtiva: string = 'perfil';
  meusEventos: Evento[] = [];
  meusIngressos: any[] = [];

  sucessoMensagem = '';
  erroGeral = '';
  salvando = false;
  editMode = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private eventosService: EventosService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.carregarUsuario();
        this.carregarDadosAbas();

        // Checa se veio do link do banner para autocompletar
        if (this.router.url.includes('edit=true')) {
          this.editMode = true;
          this.abaAtiva = 'perfil';
        }

        this.route.queryParams.subscribe(params => {
          if (params['edit'] === 'true') {
            this.editMode = true;
            this.abaAtiva = 'perfil';
          }
        });
      }, 0);
    }
  }

  carregarUsuario(): void {
    try {
      const stored = localStorage.getItem('usuarioLogado');
      if (stored) {
        this.usuarioOriginal = JSON.parse(stored);
        this.usuario = JSON.parse(stored);
      } else {
        this.router.navigate(['/login']);
      }
    } catch (e) {
      console.error('Erro ao carregar usuário:', e);
      this.router.navigate(['/login']);
    }
  }

  carregarDadosAbas(): void {
    if (!this.usuario) return;

    // Carrega eventos se for produtor
    this.eventosService.getEventos().subscribe({
      next: (eventos) => {
        this.meusEventos = eventos.filter(e => e.produtorId === this.usuario?.id);
      }
    });

    // Mock de ingressos para demonstração
    this.meusIngressos = [
      {
        id: 'TKT-9982',
        eventoNome: 'Rock in Evence 2026',
        data: '10/10/2026',
        local: 'Arena Central',
        status: 'Ativo'
      }
    ];
  }

  trocarAba(aba: string): void {
    console.log('Trocando para aba:', aba);
    this.abaAtiva = aba;
    this.editMode = false;
  }

  toggleEdit(): void {
    if (this.editMode && this.usuarioOriginal) {
      this.usuario = JSON.parse(JSON.stringify(this.usuarioOriginal));
    }
    this.editMode = !this.editMode;
  }

  salvarPerfil(): void {
    if (!this.usuario || this.usuario.id === undefined) return;

    this.salvando = true;
    const userId = this.usuario.id;

    this.eventosService.atualizarUsuario(userId, this.usuario).subscribe({
      next: (usuarioAtualizado) => {
        this.salvando = false;
        this.editMode = false;
        this.sucessoMensagem = 'Perfil atualizado com sucesso!';

        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
        this.usuarioOriginal = JSON.parse(JSON.stringify(usuarioAtualizado));
        this.usuario = JSON.parse(JSON.stringify(usuarioAtualizado));

        setTimeout(() => this.sucessoMensagem = '', 3000);
      },
      error: () => {
        this.salvando = false;
        this.erroGeral = 'Erro ao atualizar perfil. Tente novamente.';
        setTimeout(() => this.erroGeral = '', 3000);
      }
    });
  }

  voltar(): void {
    console.log('Botão voltar clicado');
    if (isPlatformBrowser(this.platformId)) {
      window.history.back();
    } else {
      this.location.back();
    }
  }

  get labelConta(): string {
    if (!this.usuario) return 'Minha Conta';
    return this.usuario.tipoPessoa === 'juridica' ? 'Minha Empresa' : 'Minha Conta';
  }

  get iniciais(): string {
    if (!this.usuario) return '??';
    const nome = this.usuario.nomeEmpresa || this.usuario.nome;
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
