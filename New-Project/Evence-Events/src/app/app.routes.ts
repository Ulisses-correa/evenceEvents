import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page';
import { LoginComponent } from './pages/login.component/login.component';
import { FaqComponent } from './pages/faq.component/faq.component';
import { CarrinhoComponent } from './pages/carrinho.component/carrinho.component';
import { ListaEventosComponent } from './pages/lista-eventos.component/lista-eventos.component';
import { CadastroComponent } from './pages/cadastro.component/cadastro.component';
import { ExtraInfosComponent } from './pages/extra-infos.component/extra-infos.component';
import { CriarEventoComponent } from './pages/criar-evento.component/criar-evento.component';
import { DetalhesComponent } from './pages/detalhes/detalhes';
import path from 'path';

export const routes: Routes = [
    { path:'', component:LandingPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'carrinho', component: CarrinhoComponent },
    { path: 'faq', component: FaqComponent },
    { path: 'eventos', component: ListaEventosComponent },
    { path: 'cadastro', component: CadastroComponent},
    { path: 'extra-infos', component: ExtraInfosComponent },
    { path: 'new-event', component: CriarEventoComponent},
    { path: 'eventos/:id', component: DetalhesComponent }
]
