import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { EventosService } from '../../services/services';

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

  constructor(
    private fb: FormBuilder,
    private eventosService: EventosService,
    private router: Router
  ) {}

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

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.carregando = true;
    this.erroGeral = '';

    const { email, senha } = this.loginForm.value;

    this.eventosService.login(email, senha).subscribe({
      next: (usuario) => {
        this.carregando = false;
        if (usuario) {
          this.loginSucesso = true;
          // Salva no localStorage para simular sessão
          localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        } else {
          this.erroGeral = 'E-mail ou senha incorretos.';
        }
      },
      error: (err) => {
        this.carregando = false;
        this.erroGeral = 'Erro inesperado ao conectar no servidor.';
        console.error(err);
      }
    });
  }
}
