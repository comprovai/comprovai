import Dexie, { type Table } from "dexie";

export interface DespesaPendente {
  id?: number;
  valor: number;
  dataDespesa: string;
  categoriaId: string;
  fornecedor: string;
  projetoId: string | null;
  clienteId: string | null;
  tipo: "reembolso" | "nota_debito" | "ambos";
  enviar: boolean;
  fotoBlob: Blob | null;
  fotoNome: string;
  criadoEm: string;
}

class ComprovaiOfflineDB extends Dexie {
  despesasPendentes!: Table<DespesaPendente, number>;

  constructor() {
    super("comprovai-offline");
    this.version(1).stores({
      despesasPendentes: "++id, criadoEm",
    });
  }
}

export const offlineDb = new ComprovaiOfflineDB();
