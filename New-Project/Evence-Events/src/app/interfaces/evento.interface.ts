export interface Evento {
  id: number;
  titulo: string;
  local: string;
  cidade: string;
  estado: string;
  data: string;
  dataISO: string;
  horario: string;
  categoria: string;
  precoMinimo: number;
  destaque: boolean;
  esgotado: boolean;
  totalIngressos: number;
  vendidos: number;
  descricaoLonga?: string;
  produtorId?: number | string;
  imagens?: string[];
  tipoLocal?: string;
  linkOnline?: string;
  dataFim?: string;
  horaFim?: string;
  tipoIngresso?: string;
  politicaReembolso?: string;
  lotes?: any[];
  _status?: 'aprovado' | 'em_analise';
}

export interface Categoria {
  id: string;
  nome: string;
  icone: string;
}

export interface OpcaoOrdenacao {
  valor: string;
  label: string;
}
