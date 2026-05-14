import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Usuario } from '../../interfaces/usuario.interface';
import { EventosService } from '../../services/services';
import { HeaderComponent } from '../../componentes/header/header';
import { FooterComponent } from '../../componentes/footer/footer';
import { Evento } from '../../interfaces/evento.interface';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css'
})
export class ProfilePageComponent implements OnInit {
  usuario: Usuario | null = null;
  usuarioOriginal: Usuario | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Controle de Abas
  abaAtiva: string = 'perfil';
  meusEventos: Evento[] = [];
  meusIngressos: any[] = [];

  sucessoMensagem = '';
  erroGeral = '';
  salvando = false;
  editMode = false;
  mostrarMenuFoto = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private eventosService: EventosService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private eRef: ElementRef
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.carregarUsuario();

        this.route.queryParams.subscribe(params => {
          if (params['edit'] === 'true') {
            this.editMode = true;
            this.abaAtiva = 'perfil';
          }
          if (params['tab']) {
            this.abaAtiva = params['tab'];
          }
          this.cdr.detectChanges();
        });

        this.cdr.detectChanges();
      }, 0);
    }
  }

  carregarUsuario(): void {
    const userStr = localStorage.getItem('usuarioLogado');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        this.usuarioOriginal = JSON.parse(JSON.stringify(userData));
        this.usuario = JSON.parse(JSON.stringify(userData));

        if (this.usuario?.id !== undefined && this.usuario?.id !== null) {
          this.carregarIngressos(this.usuario.id);
        }

        if (this.usuario?.isProdutor && this.usuario?.id !== undefined && this.usuario?.id !== null) {
          this.carregarEventosProdutor(this.usuario.id);
        }
      } catch (e) {
        console.error('Erro ao fazer parse do usuário:', e);
      }
    }
  }

  private carregarEventosProdutor(produtorId: string | number): void {
    forkJoin({
      aprovados: this.eventosService.getEventosByProdutor(produtorId),
      pendentes: this.eventosService.getSolicitacoesByProdutor(produtorId)
    }).subscribe({
      next: ({ aprovados, pendentes }) => {
        // Garantir que os aprovados venham com status aprovado
        const listaAprovados = aprovados.map(e => ({ 
          ...e, 
          _status: 'aprovado' as const 
        }));
        
        // Garantir que as solicitações venham com status em análise
        const listaPendentes = pendentes.map(e => ({ 
          ...e, 
          _status: 'em_analise' as const 
        }));

        this.meusEventos = [...listaAprovados, ...listaPendentes];
      },
      error: (err) => console.error('Erro ao carregar eventos do produtor', err)
    });
  }

  carregarIngressos(usuarioId: string | number): void {
    this.eventosService.getIngressos(usuarioId).subscribe({
      next: (ingressos) => {
        this.meusIngressos = ingressos;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar ingressos:', err)
    });
  }

  carregarDadosAbas(): void {}

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

  toggleFotoMenu(): void {
    this.mostrarMenuFoto = !this.mostrarMenuFoto;
  }

  alterarFoto(): void {
    this.mostrarMenuFoto = false;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        if (this.usuario) {
          this.usuario.foto = e.target.result;
          // Salvando direto no Local Storage ou chamando API
          localStorage.setItem('usuarioLogado', JSON.stringify(this.usuario));
          
          if (this.usuario.id !== undefined) {
             this.eventosService.atualizarUsuario(this.usuario.id, this.usuario).subscribe({
               next: () => this.sucessoMensagem = 'Foto atualizada com sucesso!',
               error: () => this.erroGeral = 'Erro ao atualizar foto.'
             });
             setTimeout(() => { this.sucessoMensagem = ''; this.erroGeral = ''; }, 3000);
          }
          this.cdr.detectChanges();
        }
      };

      reader.readAsDataURL(file);
    }
  }

  removerFoto(): void {
    if (this.usuario) {
      this.usuario.foto = undefined;
      // Atualizando localStorage para efeito imediato (apenas simulando)
      localStorage.setItem('usuarioLogado', JSON.stringify(this.usuario));
      
      if (this.usuario.id !== undefined) {
          this.eventosService.atualizarUsuario(this.usuario.id, this.usuario).subscribe();
      }
      this.cdr.detectChanges();
    }
    this.mostrarMenuFoto = false;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.mostrarMenuFoto && !this.eRef.nativeElement.querySelector('.profile-avatar-container')?.contains(event.target)) {
      this.mostrarMenuFoto = false;
    }
  }

  formatarPreco(valor: number): string {
    if (!valor && valor !== 0) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
