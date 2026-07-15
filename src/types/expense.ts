export type ExpenseStatus =
  | "rascunho"
  | "enviada"
  | "aprovada"
  | "reprovada"
  | "financeiro"
  | "lancada"
  | "nota_gerada";

export interface Expense {
  id: string;
  valor: number;
  categoria: string;
  data: string | Date;
  fornecedor: string;
  status: ExpenseStatus;
}
