
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/agenda-lista/agenda-lista.component').then(m => m.AgendaListaComponent)
  },
  {
    path: 'novo-evento',
    loadComponent: () => import('./pages/agenda-form/agenda-form.component').then(m => m.AgendaFormComponent)
  },
  {
    path: 'evento/:id',
    loadComponent: () => import('./pages/evento-detalhes/evento-detalhes').then(m => m.EventoDetalhesComponent)
  },
  {
    path: 'usuario',
    loadComponent: () => import('./pages/usuario-form/usuario-form').then(m => m.UsuarioForm)
  },
  {
    path: 'carrinho',
    loadComponent: () => import('./pages/carrinho/carrinho').then(m => m.CarrinhoComponent)
  },
  {
    path: 'meus-alugueis',
    loadComponent: () => import('./pages/meus-alugueis/meus-alugueis').then(m => m.MeusAlugueisComponent)
  }
];
