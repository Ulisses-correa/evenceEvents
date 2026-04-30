export interface Categoria {
  id: string;
  nome: string;
}

export interface Evento {
  id: string;
  titulo: string;
  data: string;
  local: string;
  categoriaId: string;
  descricao: string;
  fotoUrl?: string;
  preco30min?: number;
  preco1hora?: number;
  disponibilidade?: Disponibilidade[];
}

export interface Disponibilidade {
  id: string;
  eventoId: string;
  data: string; // formato YYYY-MM-DD
  horario: string; // formato HH:mm
  quantidadeTotal: number;
  quantidadeDisponivel: number;
}

export interface ItemCarrinho {
  evento: Evento;
  quantidade: number;
  tipoAluguel: '30min' | '1hora';
  precoUnitario: number;
  subtotal: number;
  dataSelecionada?: string;
  horarioSelecionado?: string;
  disponibilidadeId?: string;
}

export interface Carrinho {
  itens: ItemCarrinho[];
  total: number;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataCadastro: string;
}

export interface Aluguel {
  id: string;
  usuarioId: string;
  carro: Evento; // referência completa ao carro/evento
  tipoAluguel: '30min' | '1hora';
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  valorTotal: number;
  data: string; // formato YYYY-MM-DD
  horario: string; // formato HH:mm
  duracao: number; // em horas
  dataAluguel: string;
  status: 'ativo' | 'finalizado';
}

