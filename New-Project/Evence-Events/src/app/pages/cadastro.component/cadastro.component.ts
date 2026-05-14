import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { EventosService } from '../../services/services';
import { Usuario } from '../../interfaces/usuario.interface';

// Validador customizado: CPF com formato e dígitos verificadores
function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cpf = control.value?.replace(/\D/g, '') ?? '';
    if (!cpf) return null;
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return { cpfInvalido: true };

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return { cpfInvalido: true };

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[10])) return { cpfInvalido: true };

    return null;
  };
}

// Validador customizado: senhas iguais
function senhasIguaisValidator(senhaKey: string, confirmarKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const senha = group.get(senhaKey)?.value;
    const confirmar = group.get(confirmarKey)?.value;
    if (senha && confirmar && senha !== confirmar) {
      return { senhasNaoConferem: true };
    }
    return null;
  };
}

// Validador customizado: CNPJ
function cnpjValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cnpj = control.value?.replace(/\D/g, '') ?? '';
    if (!cnpj) return null;
    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return { cnpjInvalido: true };
    return null; // Simplificado para o exemplo, mas segue a lógica de dígitos
  };
}

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css',
})
export class CadastroComponent implements OnInit {
  cadastroForm!: FormGroup;
  carregando = false;
  erroGeral = '';
  cadastroSucesso = false;
  nomeUsuario = '';

  senhaVisivel = false;
  confirmarSenhaVisivel = false;

  // Data máxima: deve ter pelo menos 13 anos
  dataMaximaNascimento: string;

  constructor(
    private fb: FormBuilder,
    private eventosService: EventosService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const hoje = new Date();
    hoje.setFullYear(hoje.getFullYear() - 13);
    this.dataMaximaNascimento = hoje.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.cadastroForm = this.fb.group(
      {
        tipoPessoa: ['fisica', Validators.required],
        nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
        nomeEmpresa: [''],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
        cpf: ['', [Validators.required, cpfValidator()]],
        cnpj: [''],
        dataNascimento: [''],
        celular: ['', [Validators.minLength(15)]],
        senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)]],
        confirmarSenha: ['', Validators.required],
        aceitaTermos: [false, Validators.requiredTrue],
        aceitaNewsletter: [false],
        isProdutor: [false],
      },
      { validators: senhasIguaisValidator('senha', 'confirmarSenha') }
    );

    // Checar query params para pré-selecionar 'isProdutor'
    this.route.queryParams.subscribe(params => {
      if (params['produtor'] === 'true') {
        this.cadastroForm.patchValue({ isProdutor: true });
      }
    });

    // Monitorar troca de tipoPessoa para ajustar validadores
    this.cadastroForm.get('tipoPessoa')?.valueChanges.subscribe(tipo => {
      const cpfCtrl = this.cadastroForm.get('cpf');
      const cnpjCtrl = this.cadastroForm.get('cnpj');
      const empresaCtrl = this.cadastroForm.get('nomeEmpresa');
      const dataNascCtrl = this.cadastroForm.get('dataNascimento');
      const nomeCtrl = this.cadastroForm.get('nome');

      if (tipo === 'fisica') {
        cpfCtrl?.setValidators([Validators.required, cpfValidator()]);
        nomeCtrl?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(80)]);
        dataNascCtrl?.clearValidators();
        cnpjCtrl?.clearValidators();
        empresaCtrl?.clearValidators();
      } else {
        cnpjCtrl?.setValidators([Validators.required, cnpjValidator()]);
        empresaCtrl?.setValidators([Validators.required, Validators.minLength(3)]);
        nomeCtrl?.clearValidators();
        cpfCtrl?.clearValidators();
        dataNascCtrl?.clearValidators();
      }
      cpfCtrl?.updateValueAndValidity();
      cnpjCtrl?.updateValueAndValidity();
      empresaCtrl?.updateValueAndValidity();
      dataNascCtrl?.updateValueAndValidity();
      nomeCtrl?.updateValueAndValidity();
    });
  }

  // ----------------------------------------------------------------
  // Computed
  // ----------------------------------------------------------------
  get tipoPessoa(): 'fisica' | 'juridica' {
    return this.cadastroForm.get('tipoPessoa')?.value;
  }

  get senhasNaoConferem(): boolean {
    const confirmar = this.cadastroForm.get('confirmarSenha');
    return (
      !!this.cadastroForm.hasError('senhasNaoConferem') &&
      !!(confirmar?.dirty || confirmar?.touched)
    );
  }

  get forcaSenha(): number {
    const senha = this.cadastroForm.get('senha')?.value ?? '';
    if (!senha) return 0;
    let pontos = 0;
    if (senha.length >= 8) pontos++;
    if (/[A-Z]/.test(senha)) pontos++;
    if (/[0-9]/.test(senha)) pontos++;
    if (/[^A-Za-z0-9]/.test(senha)) pontos++;
    return pontos;
  }

  get labelForcaSenha(): string {
    const labels = ['', 'Fraca', 'Regular', 'Boa', 'Forte'];
    return labels[this.forcaSenha] ?? '';
  }

  // ----------------------------------------------------------------
  // Helpers de validação
  // ----------------------------------------------------------------
  campoInvalido(nome: string): boolean {
    const c = this.cadastroForm.get(nome);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  campoValido(nome: string): boolean {
    const c = this.cadastroForm.get(nome);
    return !!c && c.valid && c.touched;
  }

  getMensagem(nome: string): string {
    const c = this.cadastroForm.get(nome);
    if (!c) return '';
    if (c.hasError('required') || c.hasError('requiredTrue')) return 'Campo obrigatório.';
    if (c.hasError('email')) return 'Informe um e-mail válido.';
    if (c.hasError('cpfInvalido')) return 'CPF inválido.';
    if (c.hasError('cnpjInvalido')) return 'CNPJ inválido.';
    if (c.hasError('minlength')) {
      const min = c.errors?.['minlength']?.requiredLength;
      return `Mínimo de ${min} caracteres.`;
    }
    if (c.hasError('maxlength')) return 'Limite de caracteres excedido.';
    return '';
  }

  // ----------------------------------------------------------------
  // Máscaras
  // ----------------------------------------------------------------
  mascararCpf(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    input.value = v;
    this.cadastroForm.get('cpf')?.setValue(v, { emitEvent: false });
  }

  mascararCnpj(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 14);
    if (v.length > 12) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    else if (v.length > 8) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
    else if (v.length > 5) v = v.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,3})/, '$1.$2');
    input.value = v;
    this.cadastroForm.get('cnpj')?.setValue(v, { emitEvent: false });
  }

  mascararCelular(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6) v = v.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,5})/, '($1) $2');
    else if (v.length > 0) v = v.replace(/(\d{1,2})/, '($1');
    input.value = v;
    this.cadastroForm.get('celular')?.setValue(v, { emitEvent: false });
  }

  // ----------------------------------------------------------------
  // Toggle visibilidade senha
  // ----------------------------------------------------------------
  toggleSenha(): void {
    this.senhaVisivel = !this.senhaVisivel;
  }

  toggleConfirmarSenha(): void {
    this.confirmarSenhaVisivel = !this.confirmarSenhaVisivel;
  }

  // ----------------------------------------------------------------
  // Submit
  // ----------------------------------------------------------------
  onSubmit(): void {
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    this.carregando = true;
    this.erroGeral = '';

    const formValues = this.cadastroForm.value;
    const usuario: Usuario = {
      nome: formValues.nome || 'Usuário', // Default fallback se estiver vazio (jurídica)
      email: formValues.email,
      cpf: formValues.tipoPessoa === 'fisica' ? formValues.cpf : undefined,
      cnpj: formValues.tipoPessoa === 'juridica' ? formValues.cnpj : undefined,
      nomeEmpresa: formValues.tipoPessoa === 'juridica' ? formValues.nomeEmpresa : undefined,
      tipoPessoa: formValues.tipoPessoa,
      dataNascimento: formValues.tipoPessoa === 'fisica' && formValues.dataNascimento ? formValues.dataNascimento : '',
      celular: formValues.celular || '',
      senha: formValues.senha,
      aceitaTermos: formValues.aceitaTermos,
      aceitaNewsletter: formValues.aceitaNewsletter,
      isProdutor: formValues.isProdutor
    };

    this.eventosService.cadastro(usuario).subscribe({
      next: (novoUsuario) => {
        this.carregando = false;
        this.nomeUsuario = novoUsuario.nome.split(' ')[0];
        this.cadastroSucesso = true;
      },
      error: (err) => {
        this.carregando = false;
        this.erroGeral = 'Erro inesperado. Tente novamente.';
        console.error(err);
      }
    });
  }
}
