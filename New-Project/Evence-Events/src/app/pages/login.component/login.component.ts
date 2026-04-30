import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  senhaVisivel = false;
  carregando = false;
  erroGeral = '';
  loginSucesso = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(100),
        ],
      ],
      senha: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(50),
        ],
      ],
      lembrar: [false],
    });
  }

  get email(): AbstractControl {
    return this.loginForm.get('email')!;
  }

  get senha(): AbstractControl {
    return this.loginForm.get('senha')!;
  }

  get emailInvalido(): boolean {
    return this.email.invalid && (this.email.dirty || this.email.touched);
  }

  get senhaInvalida(): boolean {
    return this.senha.invalid && (this.senha.dirty || this.senha.touched);
  }

  getMensagemEmail(): string {
    if (this.email.hasError('required')) return 'E-mail é obrigatório.';
    if (this.email.hasError('email')) return 'Informe um e-mail válido.';
    if (this.email.hasError('maxlength')) return 'E-mail muito longo.';
    return '';
  }

  getMensagemSenha(): string {
    if (this.senha.hasError('required')) return 'Senha é obrigatória.';
    if (this.senha.hasError('minlength')) return 'Mínimo de 6 caracteres.';
    if (this.senha.hasError('maxlength')) return 'Senha muito longa.';
    return '';
  }

  toggleSenha(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.carregando = true;
    this.erroGeral = '';

    // Simula chamada à API
    try {
      await new Promise((res) => setTimeout(res, 1800));

      const { email } = this.loginForm.value;

      // Simulação: só aceita um e-mail específico para demo
      if (email === 'erro@teste.com') {
        throw new Error('E-mail ou senha incorretos.');
      }

      this.loginSucesso = true;
    } catch (err: any) {
      this.erroGeral = err.message || 'Erro inesperado. Tente novamente.';
    } finally {
      this.carregando = false;
    }
  }

  loginComGoogle(): void {
    console.log('Login com Google iniciado');
  }

  loginComFacebook(): void {
    console.log('Login com Facebook iniciado');
  }
}
