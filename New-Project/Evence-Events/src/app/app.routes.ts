import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page';
import { LoginComponent } from './pages/login.component/login.component';
import { FaqComponent } from './pages/faq.component/faq.component';
import { CarrinhoComponent } from './pages/carrinho.component/carrinho.component';

export const routes: Routes = [
    { path:'', component:LandingPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'carrinho', component: CarrinhoComponent },
    { path: 'faq', component: FaqComponent },
];
