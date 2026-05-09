export interface Usuario {
  id?: number | string;
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string;
  celular: string;
  senha?: string;
  aceitaTermos?: boolean;
  aceitaNewsletter?: boolean;
  isProdutor?: boolean;
  isAdmin?: boolean;
}
