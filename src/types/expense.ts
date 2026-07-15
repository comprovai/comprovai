export type ExpenseStatus = "aprovado" | "reprovado" | "pendente" | "financeiro";

export interface Expense {
  id: string;
  valor: number;
  categoria: string;
  data: string | Date;
  fornecedor: string;
  status: ExpenseStatus;
}
