import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styles: [`
    .active-link {
      font-weight: bold;
      border-bottom: 2px solid white;
    }
    .navbar-brand { font-weight: 800; letter-spacing: -1px; }
  `]
})
export class NavbarComponent implements OnInit {

  private carrinhoService = inject(CarrinhoService);
  quantidadeCarrinho = signal(0);

  ngOnInit() {
    this.atualizarQuantidadeCarrinho();
    // Atualizar a cada 1 segundo para refletir mudanças em tempo real
    setInterval(() => this.atualizarQuantidadeCarrinho(), 1000);
  }

  private atualizarQuantidadeCarrinho() {
    this.quantidadeCarrinho.set(this.carrinhoService.getQuantidadeTotal());
  }
}
