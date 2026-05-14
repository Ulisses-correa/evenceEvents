import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../componentes/header/header';
import { FooterComponent } from '../../componentes/footer/footer';
import { ItemCarrinho } from '../../interfaces/carrinho.interface';
import { EventosService } from '../../services/services';
import { forkJoin, from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

type MetodoPagamento = 'pix' | 'cartao' | 'boleto';
type TipoCartao = 'credito' | 'debito';

@Component({
  selector: 'app-pagamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, FooterComponent],
  templateUrl: './pagamento.component.html',
  styleUrl: './pagamento.component.css',
})
export class PagamentoComponent implements OnInit {

  itens: ItemCarrinho[] = [];

  // Método de pagamento selecionado
  metodo: MetodoPagamento = 'pix';
  tipoCartao: TipoCartao = 'credito';

  // Dados do cartão
  cartao = {
    numero: '',
    nome: '',
    validade: '',
    cvv: '',
    parcelas: 1,
  };

  // Dados do boleto (apenas nome)
  nomeComprador = '';

  // Estados UI
  processando = false;
  sucesso = false;
  erro = '';

  // Campos com erro (validação visual)
  camposComErro: Set<string> = new Set();

  // Progresso do feedback visual
  progressoSucesso = 0;
  private progressoInterval: any;

  // Cupom (reaproveitado do carrinho)
  cupomDesconto = 0;

  readonly taxaServico = 0.1;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private eventosService: EventosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarCarrinho();
      this.carregarCupom();
    }
  }

  carregarCarrinho(): void {
    const storedUser = localStorage.getItem('usuarioLogado');
    if (!storedUser) {
      this.router.navigate(['/login']);
      return;
    }
    const usuario = JSON.parse(storedUser);

    this.eventosService.getCarrinho(usuario.id).subscribe({
      next: (res) => {
        this.itens = res.map((item: any) => ({
          id: item.id,
          eventoId: item.eventoId,
          evento: item.titulo,
          local: item.local,
          data: item.data,
          horario: item.horario,
          setor: item.setor || 'Ingresso Geral',
          quantidade: item.quantidade,
          precoUnitario: item.preco,
          imagem: item.imagem || '',
        }));
        this.cdr.detectChanges();

        if (this.itens.length === 0) {
          this.router.navigate(['/carrinho']);
        }
      },
      error: () => this.router.navigate(['/carrinho'])
    });
  }

  carregarCupom(): void {
    const cupomStr = sessionStorage.getItem('cupom_desconto');
    if (cupomStr) {
      this.cupomDesconto = parseFloat(cupomStr);
    }
  }

  get subtotal(): number {
    return this.itens.reduce((acc, item) => acc + item.precoUnitario * item.quantidade, 0);
  }

  get valorDesconto(): number {
    return this.subtotal * this.cupomDesconto;
  }

  get valorTaxa(): number {
    return this.subtotal * this.taxaServico;
  }

  get total(): number {
    return this.subtotal - this.valorDesconto + this.valorTaxa;
  }

  get totalItens(): number {
    return this.itens.reduce((acc, item) => acc + item.quantidade, 0);
  }

  get opcoesParcelas(): { valor: number; label: string }[] {
    const opcoes = [];
    const maxParcelas = this.tipoCartao === 'credito' ? 12 : 1;
    for (let i = 1; i <= maxParcelas; i++) {
      const valorParcela = this.total / i;
      opcoes.push({
        valor: i,
        label: i === 1 ? `À vista — ${this.formatarPreco(valorParcela)}` : `${i}x de ${this.formatarPreco(valorParcela)} sem juros`,
      });
    }
    return opcoes;
  }

  selecionarMetodo(m: MetodoPagamento): void {
    this.metodo = m;
    this.erro = '';
    this.camposComErro.clear();
  }

  selecionarTipoCartao(tipo: TipoCartao): void {
    this.tipoCartao = tipo;
    this.cartao.parcelas = 1;
  }

  formatarNumeroCartao(): void {
    let val = this.cartao.numero.replace(/\D/g, '').substring(0, 16);
    this.cartao.numero = val.replace(/(.{4})/g, '$1 ').trim();
    this.camposComErro.delete('numero');
  }

  formatarValidade(): void {
    let val = this.cartao.validade.replace(/\D/g, '').substring(0, 4);
    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
    this.cartao.validade = val;
    this.camposComErro.delete('validade');
  }

  onNomeChange(): void { this.camposComErro.delete('nome'); }
  onCvvChange(): void { this.camposComErro.delete('cvv'); }

  temErro(campo: string): boolean {
    return this.camposComErro.has(campo);
  }

  validarFormulario(): boolean {
    this.camposComErro.clear();
    this.erro = '';

    if (this.metodo === 'cartao') {
      const numLimpo = this.cartao.numero.replace(/\s/g, '');
      if (numLimpo.length < 16) {
        this.camposComErro.add('numero');
        this.erro = 'Preencha todos os dados do cartão corretamente.';
      }
      if (!this.cartao.nome.trim()) {
        this.camposComErro.add('nome');
        this.erro = 'Preencha todos os dados do cartão corretamente.';
      }
      if (this.cartao.validade.length < 5) {
        this.camposComErro.add('validade');
        this.erro = 'Preencha todos os dados do cartão corretamente.';
      }
      if (this.cartao.cvv.length < 3) {
        this.camposComErro.add('cvv');
        this.erro = 'Preencha todos os dados do cartão corretamente.';
      }
      if (this.camposComErro.size > 0) return false;
    }

    if (this.metodo === 'boleto' && !this.nomeComprador.trim()) {
      this.erro = 'Nome do comprador é obrigatório para boleto.';
      return false;
    }
    return true;
  }

  async confirmarPagamento(): Promise<void> {
    this.erro = '';
    if (!this.validarFormulario()) return;

    this.processando = true;

    // Simula processamento do gateway de pagamento (2s)
    await new Promise(r => setTimeout(r, 2000));

    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('usuarioLogado');
      if (storedUser) {
        const usuario = JSON.parse(storedUser);

        // 1. Gera um ingresso no banco para cada item do carrinho
        const dataCompra = new Date().toLocaleDateString('pt-BR');
        const metodoPagamentoLabel =
          this.metodo === 'pix' ? 'PIX' :
          this.metodo === 'boleto' ? 'Boleto' :
          this.tipoCartao === 'credito' ? `Cartão de Crédito (${this.cartao.parcelas}x)` : 'Cartão de Débito';

        const salvamentos = this.itens.map(item => {
          const codigo = 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
          const ingresso = {
            usuarioId: usuario.id,
            eventoId: item.eventoId,
            eventoNome: item.evento,
            data: item.data,
            horario: item.horario,
            local: item.local,
            quantidade: item.quantidade,
            valorUnitario: item.precoUnitario,
            valorTotal: item.precoUnitario * item.quantidade,
            setor: item.setor || 'Ingresso Geral',
            imagem: item.imagem || '',
            codigo,
            status: 'Ativo',
            dataCompra,
            metodoPagamento: metodoPagamentoLabel,
          };
          return this.eventosService.salvarIngresso(ingresso).toPromise();
        });

        await Promise.all(salvamentos);

        // 2. Decrementa os ingressos vendidos de cada evento
        const eventosAgrupados = new Map<number | string, number>();
        for (const item of this.itens) {
          const qtdAtual = eventosAgrupados.get(item.eventoId) ?? 0;
          eventosAgrupados.set(item.eventoId, qtdAtual + item.quantidade);
        }

        const atualizacoesEventos = Array.from(eventosAgrupados.entries()).map(async ([eventoId, qtdComprada]) => {
          try {
            const evento = await this.eventosService.getEventoById(eventoId).toPromise();
            if (evento) {
              const novosVendidos = Math.min(
                (evento.vendidos ?? 0) + qtdComprada,
                evento.totalIngressos ?? Infinity
              );
              const esgotado = novosVendidos >= (evento.totalIngressos ?? Infinity);
              await this.eventosService.patchEvento(eventoId, {
                vendidos: novosVendidos,
                esgotado
              }).toPromise();
            }
          } catch (e) {
            console.warn('Não foi possível atualizar estoque do evento', eventoId, e);
          }
        });

        await Promise.all(atualizacoesEventos);

        // 3. Remove todos os itens do carrinho
        const remocoes = this.itens.map(item =>
          this.eventosService.removerItemCarrinho(item.id).toPromise()
        );
        await Promise.all(remocoes);
      }
      sessionStorage.removeItem('cupom_desconto');
    }

    this.processando = false;
    this.sucesso = true;
    this.iniciarProgressoSucesso();

    // Redireciona para os ingressos do perfil após 3.5s
    setTimeout(() => this.router.navigate(['/perfil'], { queryParams: { tab: 'ingressos' } }), 3500);
  }

  private iniciarProgressoSucesso(): void {
    this.progressoSucesso = 0;
    const duracao = 3500;
    const intervalo = 50;
    const incremento = (intervalo / duracao) * 100;

    this.progressoInterval = setInterval(() => {
      this.progressoSucesso = Math.min(this.progressoSucesso + incremento, 100);
      this.cdr.detectChanges();
      if (this.progressoSucesso >= 100) {
        clearInterval(this.progressoInterval);
      }
    }, intervalo);
  }

  formatarPreco(valor: number): string {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  get pixExpiracaoMinutos(): number { return 30; }
}
