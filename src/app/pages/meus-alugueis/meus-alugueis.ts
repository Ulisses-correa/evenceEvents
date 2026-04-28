import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Usuario, Aluguel } from '../../models/agenda.model';

@Component({
  selector: 'app-meus-alugueis',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './meus-alugueis.html',
  styleUrl: './meus-alugueis.css'
})
export class MeusAlugueisComponent implements OnInit {
  usuarioAtual = signal<Usuario | null>(null);
  alugueis = signal<Aluguel[]>([]);

  constructor(private router: Router) {}

  ngOnInit() {
    this.carregarUsuarioAtual();
    this.carregarAlugueis();
  }

  private carregarUsuarioAtual() {
    const usuarioStr = localStorage.getItem('usuarioAtual');
    if (usuarioStr) {
      this.usuarioAtual.set(JSON.parse(usuarioStr));
    } else {
      // Redirecionar para login se não estiver logado
      this.router.navigate(['/agenda-lista']);
    }
  }

  private carregarAlugueis() {
    const usuario = this.usuarioAtual();
    if (!usuario) return;

    const alugueisStr = localStorage.getItem('alugueis');
    if (alugueisStr) {
      const todosAlugueis: Aluguel[] = JSON.parse(alugueisStr);
      // Filtrar apenas os aluguéis do usuário atual
      const alugueisUsuario = todosAlugueis.filter(aluguel => aluguel.usuarioId === usuario.id);
      // Ordenar por data (mais recentes primeiro)
      alugueisUsuario.sort((a, b) => {
        const dataA = new Date(a.data + ' ' + a.horario);
        const dataB = new Date(b.data + ' ' + b.horario);
        return dataB.getTime() - dataA.getTime();
      });
      this.alugueis.set(alugueisUsuario);
    }
  }

  formatarData(data: string): string {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getStatusText(aluguel: Aluguel): string {
    const dataHora = new Date(aluguel.data + ' ' + aluguel.horario);
    const agora = new Date();

    if (dataHora > agora) {
      return 'Ativo';
    } else {
      return 'Concluído';
    }
  }

  getStatusClass(aluguel: Aluguel): string {
    const status = this.getStatusText(aluguel);
    return status === 'Ativo' ? 'bg-success' : 'bg-secondary';
  }

  trackById(index: number, aluguel: Aluguel): string {
    return aluguel.id;
  }

  excluirPerfil() {
    const usuario = this.usuarioAtual();
    if (!usuario) return;

    const usuarios: Usuario[] = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const novosUsuarios = usuarios.filter(u => u.id !== usuario.id);
    localStorage.setItem('usuarios', JSON.stringify(novosUsuarios));

    const alugueis: Aluguel[] = JSON.parse(localStorage.getItem('alugueis') || '[]');
    const novosAlugueis = alugueis.filter(a => a.usuarioId !== usuario.id);
    localStorage.setItem('alugueis', JSON.stringify(novosAlugueis));

    localStorage.removeItem('usuarioAtual');
    this.usuarioAtual.set(null);
    alert('Perfil excluído com sucesso. Faça login ou cadastre um novo usuário.');
    this.router.navigate(['/usuario']);
  }

  getAlugueisAtivosCount(): number {
    return this.alugueis().filter(a => new Date(a.data + ' ' + a.horario) > new Date()).length;
  }

  imprimirRecibo(aluguel: Aluguel) {
    // Criar uma janela de impressão simples
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo de Aluguel - ${aluguel.carro.titulo}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .info { margin-bottom: 20px; }
          .info div { margin-bottom: 5px; }
          .carro { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
          .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RECIBO DE ALUGUEL</h1>
          <h2>Correa Automóveis</h2>
        </div>

        <div class="info">
          <div><strong>Cliente:</strong> ${this.usuarioAtual()?.nome}</div>
          <div><strong>Email:</strong> ${this.usuarioAtual()?.email}</div>
          <div><strong>Data de Emissão:</strong> ${new Date().toLocaleDateString('pt-BR')}</div>
        </div>

        <div class="carro">
          <h3>Detalhes do Aluguel</h3>
          <div><strong>Carro:</strong> ${aluguel.carro.titulo} (Carro clássico)</div>
          <div><strong>Data:</strong> ${this.formatarData(aluguel.data)}</div>
          <div><strong>Horário:</strong> ${aluguel.horario}</div>
          <div><strong>Duração:</strong> ${aluguel.duracao} horas</div>
          <div><strong>Valor Total:</strong> R$ ${aluguel.valorTotal.toFixed(2)}</div>
        </div>

        <div class="total">
          Valor Total: R$ ${aluguel.valorTotal.toFixed(2)}
        </div>

        <div style="margin-top: 40px; text-align: center; border-top: 1px solid #ddd; padding-top: 20px;">
          <p>Obrigado por escolher Correa Automóveis!</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}
