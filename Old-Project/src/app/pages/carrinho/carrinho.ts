import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho';
import { ItemCarrinho, Usuario, Aluguel } from '../../models/agenda.model';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrinho.html',
  styleUrls: ['./carrinho.css']
})
export class CarrinhoComponent implements OnInit {
  private carrinhoService = inject(CarrinhoService);
  private router = inject(Router);

  itensCarrinho: ItemCarrinho[] = [];
  total = 0;
  quantidadeTotal = 0;
  usuarioAtual: Usuario | null = null;

  ngOnInit() {
    this.atualizarCarrinho();
    this.verificarUsuario();
  }

  private verificarUsuario() {
    const usuarioStr = localStorage.getItem('usuarioAtual');
    if (usuarioStr) {
      this.usuarioAtual = JSON.parse(usuarioStr);
    }
  }

  private atualizarCarrinho() {
    this.itensCarrinho = this.carrinhoService.getCarrinho();
    this.total = this.carrinhoService.getTotal();
    this.quantidadeTotal = this.carrinhoService.getQuantidadeTotal();
  }

  atualizarQuantidade(eventoId: string, tipoAluguel: '30min' | '1hora', quantidade: number) {
    this.carrinhoService.atualizarQuantidade(eventoId, tipoAluguel, quantidade);
    this.atualizarCarrinho();
  }

  removerItem(eventoId: string, tipoAluguel: '30min' | '1hora') {
    this.carrinhoService.removerItem(eventoId, tipoAluguel);
    this.atualizarCarrinho();
  }

  limparCarrinho() {
    if (confirm('Tem certeza que deseja esvaziar o carrinho?')) {
      this.carrinhoService.limparCarrinho();
      this.atualizarCarrinho();
    }
  }

  finalizarCompra() {
    if (this.itensCarrinho.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    // Verificar se usuário está logado
    if (!this.usuarioAtual) {
      this.router.navigate(['/usuario']);
      return;
    }

    // Registrar aluguéis e atualizar disponibilidade
    const alugueis: any[] = [];
    let disponibilidadeAtualizada = false;

    for (const item of this.itensCarrinho) {
      if (item.disponibilidadeId) {
        // Atualizar disponibilidade
        const disponibilidades = JSON.parse(localStorage.getItem('disponibilidade') || '[]');
        const dispIndex = disponibilidades.findIndex((d: any) => d.id === item.disponibilidadeId);

        if (dispIndex !== -1) {
          disponibilidades[dispIndex].quantidadeDisponivel -= item.quantidade;
          if (disponibilidades[dispIndex].quantidadeDisponivel < 0) {
            disponibilidades[dispIndex].quantidadeDisponivel = 0;
          }
          localStorage.setItem('disponibilidade', JSON.stringify(disponibilidades));
          disponibilidadeAtualizada = true;
        }

        // Registrar aluguel
        alugueis.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          usuarioId: this.usuarioAtual!.id,
          eventoId: item.evento.id,
          tipoAluguel: item.tipoAluguel,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          subtotal: item.subtotal,
          dataAluguel: item.dataSelecionada || new Date().toISOString(),
          horarioAluguel: item.horarioSelecionado || '',
          status: 'ativo'
        });
      }
    }

    // Salvar aluguéis no localStorage
    const alugueisExistentes = JSON.parse(localStorage.getItem('alugueis') || '[]');
    const novosAlugueis = [...alugueisExistentes, ...alugueis];
    localStorage.setItem('alugueis', JSON.stringify(novosAlugueis));

    alert(`Compra finalizada com sucesso!\nTotal: R$ ${this.total.toFixed(2)}\n\nObrigado por alugar conosco, ${this.usuarioAtual.nome}!${disponibilidadeAtualizada ? '\n\nAs vagas foram reservadas no sistema.' : ''}`);
    this.carrinhoService.limparCarrinho();
    this.atualizarCarrinho();
  }

  getTipoAluguelLabel(tipo: '30min' | '1hora'): string {
    return tipo === '30min' ? '30 minutos' : '1 hora';
  }

  formatarData(data: string): string {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}
