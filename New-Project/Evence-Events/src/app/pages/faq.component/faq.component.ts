import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../componentes/header/header';
import { FooterComponent } from '../../componentes/footer/footer';

export interface PerguntaFaq {
  id: number;
  pergunta: string;
  resposta: string;
  categoria: string;
  aberta: boolean;
}

export interface CategoriaFaq {
  id: string;
  nome: string;
  icone: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
})
export class FaqComponent implements OnInit {
  buscaTermo = '';
  categoriaAtiva = 'todas';

  categorias: CategoriaFaq[] = [
    { id: 'todas', nome: 'Todas', icone: 'apps' },
    { id: 'ingressos', nome: 'Ingressos', icone: 'confirmation_number' },
    { id: 'pagamento', nome: 'Pagamento', icone: 'credit_card' },
    { id: 'eventos', nome: 'Eventos', icone: 'event' },
    { id: 'conta', nome: 'Minha Conta', icone: 'manage_accounts' },
    { id: 'cancelamento', nome: 'Cancelamento', icone: 'cancel' },
  ];

  perguntas: PerguntaFaq[] = [
    {
      id: 1,
      categoria: 'ingressos',
      pergunta: 'Como recebo meu ingresso após a compra?',
      resposta: 'Após a confirmação do pagamento, seu ingresso é enviado automaticamente para o e-mail cadastrado em até 5 minutos. Você também pode acessá-lo na seção "Meus Ingressos" da sua conta. O ingresso estará em formato PDF com QR Code para apresentação na entrada do evento.',
      aberta: true,
    },
    {
      id: 2,
      categoria: 'ingressos',
      pergunta: 'Posso transferir meu ingresso para outra pessoa?',
      resposta: 'Sim! A transferência de ingressos é permitida para a maioria dos eventos. Acesse "Meus Ingressos", selecione o ingresso desejado e clique em "Transferir". Informe o e-mail do destinatário e confirme. A transferência é gratuita e instantânea. Alguns eventos exclusivos podem ter restrições de transferência indicadas na página do evento.',
      aberta: false,
    },
    {
      id: 3,
      categoria: 'ingressos',
      pergunta: 'Quantos ingressos posso comprar por evento?',
      resposta: 'O limite varia por evento, mas geralmente é de até 10 ingressos por CPF por compra. Eventos de alta demanda podem ter limites menores (2 ou 4 ingressos) para evitar revenda. O limite específico de cada evento é exibido na página de compra antes de você adicionar ao carrinho.',
      aberta: false,
    },
    {
      id: 4,
      categoria: 'pagamento',
      pergunta: 'Quais formas de pagamento são aceitas?',
      resposta: 'Aceitamos as principais formas de pagamento: cartões de crédito Visa, Mastercard, Elo e American Express (parcelamento em até 12x sem juros); PIX com confirmação instantânea; boleto bancário (compensação em até 3 dias úteis). Para boleto, o ingresso só é emitido após a confirmação do pagamento.',
      aberta: false,
    },
    {
      id: 5,
      categoria: 'pagamento',
      pergunta: 'O parcelamento tem juros?',
      resposta: 'Não! Todos os nossos parcelamentos em cartão de crédito são sem juros para o comprador, em até 12 vezes. O valor total da compra é dividido igualmente pelas parcelas escolhidas. A taxa de serviço da plataforma já está incluída no valor exibido, sem cobranças adicionais surpresa.',
      aberta: false,
    },
    {
      id: 6,
      categoria: 'pagamento',
      pergunta: 'Como funciona o pagamento via PIX?',
      resposta: 'Ao escolher PIX, um QR Code é gerado com validade de 30 minutos. Abra o app do seu banco, escaneie o código ou copie a chave PIX, confirme o pagamento e pronto! A confirmação é instantânea e o ingresso é enviado para seu e-mail em segundos. Não feche a página antes de confirmar o pagamento.',
      aberta: false,
    },
    {
      id: 7,
      categoria: 'eventos',
      pergunta: 'Como saber se um evento foi cancelado ou adiado?',
      resposta: 'Em caso de cancelamento ou adiamento, você será notificado por e-mail e notificação no app. Também publicamos atualizações na página do evento e em nossas redes sociais. Se o evento for cancelado, o reembolso é automático em até 5 dias úteis no mesmo método de pagamento utilizado.',
      aberta: false,
    },
    {
      id: 8,
      categoria: 'eventos',
      pergunta: 'Posso levar crianças para eventos?',
      resposta: 'Depende da classificação etária do evento, indicada sempre na página de compra. Eventos classificados como livre ou infantil permitem a entrada de crianças. Para eventos com classificação indicativa, menores só entram acompanhados de responsável legal. Verifique sempre a classificação antes de comprar.',
      aberta: false,
    },
    {
      id: 9,
      categoria: 'conta',
      pergunta: 'Esqueci minha senha. Como recupero?',
      resposta: 'Na tela de login, clique em "Esqueceu a senha?". Informe o e-mail cadastrado e enviaremos um link de recuperação válido por 1 hora. Verifique também a caixa de spam. Se o problema persistir, entre em contato com nosso suporte pelo chat disponível 24h.',
      aberta: false,
    },
    {
      id: 10,
      categoria: 'conta',
      pergunta: 'Como atualizo meus dados cadastrais?',
      resposta: 'Acesse sua conta, clique no seu nome no canto superior direito e selecione "Meu Perfil". Lá você pode atualizar nome, e-mail, telefone, endereço e preferências de notificação. Para alterar o CPF, entre em contato com nosso suporte, pois é um dado sensível que requer verificação de identidade.',
      aberta: false,
    },
    {
      id: 11,
      categoria: 'cancelamento',
      pergunta: 'Posso cancelar minha compra e receber reembolso?',
      resposta: 'Sim, de acordo com o Código de Defesa do Consumidor, você tem até 7 dias após a compra para solicitar cancelamento (desde que o evento não tenha ocorrido). Acesse "Meus Ingressos", selecione o ingresso e clique em "Solicitar Reembolso". O estorno é feito em até 10 dias úteis no cartão ou 3 dias para PIX/boleto.',
      aberta: false,
    },
    {
      id: 12,
      categoria: 'cancelamento',
      pergunta: 'E se o evento for cancelado pelo organizador?',
      resposta: 'Se o organizador cancelar o evento, você recebe reembolso integral e automático, sem precisar solicitar. O valor é devolvido no mesmo método de pagamento em até 5 dias úteis para cartão de crédito e até 3 dias para PIX. Você será notificado por e-mail assim que o cancelamento for processado.',
      aberta: false,
    },
  ];

  ngOnInit(): void {}

  get perguntasFiltradas(): PerguntaFaq[] {
    let resultado = this.perguntas;

    if (this.categoriaAtiva !== 'todas') {
      resultado = resultado.filter((p) => p.categoria === this.categoriaAtiva);
    }

    if (this.buscaTermo.trim()) {
      const termo = this.buscaTermo.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.pergunta.toLowerCase().includes(termo) ||
          p.resposta.toLowerCase().includes(termo)
      );
    }

    return resultado;
  }

  get totalResultados(): number {
    return this.perguntasFiltradas.length;
  }

  togglePergunta(id: number): void {
    this.perguntas = this.perguntas.map((p) => ({
      ...p,
      aberta: p.id === id ? !p.aberta : false,
    }));
  }

  isPerguntaAberta(id: number): boolean {
    return this.perguntas.find((p) => p.id === id)?.aberta ?? false;
  }

  selecionarCategoria(id: string): void {
    this.categoriaAtiva = id;
    // Fecha todas ao mudar de categoria
    this.perguntas = this.perguntas.map((p) => ({ ...p, aberta: false }));
  }

  limparBusca(): void {
    this.buscaTermo = '';
  }
}
