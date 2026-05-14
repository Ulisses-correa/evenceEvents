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
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page';
import { IanesComponent } from './pages/ianes.component/ianes.component';
import { PagamentoComponent } from './pages/pagamento.component/pagamento.component';

export const routes: Routes = [
    { path: 'sobre-nos', component: IanesComponent },
    { path:'', component:LandingPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'carrinho', component: CarrinhoComponent },
    { path: 'faq', component: FaqComponent },
    { path: 'eventos', component: ListaEventosComponent },
    { path: 'cadastro', component: CadastroComponent},
    { path: 'extra-infos', component: ExtraInfosComponent },
    { path: 'new-event', component: CriarEventoComponent},
    { path: 'edit-event/:id', component: CriarEventoComponent},
    { path: 'admin', component: AdminPageComponent },
    { path: 'perfil', component: ProfilePageComponent },
    { path: 'pagamento', component: PagamentoComponent },
    { path: 'admin/aprovacoes/:id', component: DetalhesComponent, data: { modoAdmin: true } },
    { path: 'eventos/:id', component: DetalhesComponent },
]
