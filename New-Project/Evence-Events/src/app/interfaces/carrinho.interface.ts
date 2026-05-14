export interface ItemCarrinho {
  id: number | string; // ID do item no banco (carrinho)
  eventoId: number | string;
  evento: string;
  local: string;
  data: string;
  horario: string;
  setor: string;
  quantidade: number;
  precoUnitario: number;
  imagem: string;
  esgotado?: boolean;
}
