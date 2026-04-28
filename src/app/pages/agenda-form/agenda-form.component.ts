import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AgendaService } from '../../services/agenda.service';
import { Categoria } from '../../models/agenda.model';

@Component({
  selector: 'app-agenda-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agenda-form.component.html',
  styles: [`
    .container {
      max-width: 700px;
    }

    .invalid-feedback {
      display: block;
      font-size: 0.85rem;
    }
  `]
})
export class AgendaFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private agendaService = inject(AgendaService);
  private router = inject(Router);

  agendaForm!: FormGroup;
  categorias: Categoria[] = [];
  loading = false;
  fotoUrlCarregada: string = '';

  ngOnInit() {
    this.inicializarFormulario();
    this.carregarCategorias();
    this.observarMudancasFoto();
  }

  private inicializarFormulario() {
    this.agendaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      data: ['', Validators.required],
      local: ['', Validators.required],
      categoriaId: ['', Validators.required],
      descricao: ['', [Validators.required, Validators.maxLength(200)]],
      fotoUrl: ['']
    });
  }

  private carregarCategorias() {
    this.agendaService.getCategorias().subscribe({
      next: (res) => this.categorias = res,
      error: (err) => console.error('Erro ao carregar categorias:', err)
    });
  }

  private observarMudancasFoto() {
    this.agendaForm.get('fotoUrl')?.valueChanges.subscribe((url) => {
      if (url && this.isValidUrl(url)) {
        this.fotoUrlCarregada = url;
      } else {
        this.fotoUrlCarregada = '';
      }
    });
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // 🔎 Facilita o HTML (agendaForm.get vira f.titulo etc.)
  get f() {
    return this.agendaForm.controls;
  }

  salvar() {
    if (this.agendaForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.loading = true;

    this.agendaService.salvarEvento(this.agendaForm.value).subscribe({
      next: () => {
        this.loading = false;
        alert('Evento agendado com sucesso!');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erro ao salvar:', err);
        alert('Erro ao salvar evento.');
      }
    });
  }

  limparFormulario() {
    this.agendaForm.reset();
  }

  private marcarCamposComoTocados() {
    Object.values(this.agendaForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}