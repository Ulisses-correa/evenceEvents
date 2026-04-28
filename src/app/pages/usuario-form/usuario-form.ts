import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../../models/agenda.model';
import { AgendaService } from '../../services/agenda.service';

@Component({
  selector: 'app-usuario-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css',
})
export class UsuarioForm {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private agendaService = inject(AgendaService);

  usuarioForm: FormGroup;
  isSubmitting = signal(false);

  constructor() {
    this.usuarioForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]]
    });
  }

  onSubmit() {
    if (this.usuarioForm.valid) {
      this.isSubmitting.set(true);

      const usuario: Usuario = {
        id: Date.now().toString(),
        ...this.usuarioForm.value,
        dataCadastro: new Date().toISOString()
      };

      // Salvar usuário no localStorage (simulando backend)
      const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
      usuarios.push(usuario);
      localStorage.setItem('usuarios', JSON.stringify(usuarios));

      // Salvar usuário atual
      localStorage.setItem('usuarioAtual', JSON.stringify(usuario));

      this.isSubmitting.set(false);
      this.router.navigate(['/carrinho']);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      control?.markAsTouched();
    });
  }

  voltarParaInicio() {
    this.router.navigate(['/']);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.usuarioForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    if (control?.hasError('email')) {
      return 'Email inválido';
    }
    if (control?.hasError('minlength')) {
      return 'Mínimo de 3 caracteres';
    }
    if (control?.hasError('pattern')) {
      if (fieldName === 'telefone') {
        return 'Formato: (11) 99999-9999';
      }
      if (fieldName === 'cpf') {
        return 'Formato: 999.999.999-99';
      }
    }
    return '';
  }
}
