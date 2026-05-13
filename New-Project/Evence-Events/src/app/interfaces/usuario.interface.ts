export interface Usuario {
  id?: number | string;
  nome: string;
  email: string;
  cpf?: string;
  cnpj?: string;
  nomeEmpresa?: string;
  tipoPessoa: 'fisica' | 'juridica';
  dataNascimento: string;
  celular: string;
  senha?: string;
  aceitaTermos?: boolean;
  aceitaNewsletter?: boolean;
  isProdutor?: boolean;
  isAdmin?: boolean;
  verificado?: boolean;
  estaSuspenso?: boolean;
  foto?: string;
}
