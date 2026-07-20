"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ReceiptCard } from "@/components/ui/ReceiptCard";
import { StatusStamp } from "@/components/ui/StatusStamp";
import { excluirDespesa } from "@/app/app/minhas-despesas/actions";
import type { ExpenseStatus } from "@/types/expense";

export interface DespesaLista {
  id: string;
  valor: number;
  data_despesa: string;
  fornecedor: string | null;
  status: string;
  categorias_despesa: { nome: string } | null;
}

const ORDEM_STATUS: ExpenseStatus[] = [
  "rascunho",
  "reprovada",
  "enviada",
  "aprovada",
  "financeiro",
  "lancada",
  "nota_gerada",
];

// Precisa bater com a política despesas_delete_colaborador (rascunho/enviada).
const STATUS_EXCLUIVEL: ExpenseStatus[] = ["rascunho", "enviada"];

export function MinhasDespesasList({ despesasIniciais }: { despesasIniciais: DespesaLista[] }) {
  const [despesas, setDespesas] = useState(despesasIniciais);
  const [excluirAlvo, setExcluirAlvo] = useState<DespesaLista | null>(null);
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const grupos = new Map<ExpenseStatus, DespesaLista[]>();
  for (const despesa of despesas) {
    const status = despesa.status as ExpenseStatus;
    const lista = grupos.get(status) ?? [];
    lista.push(despesa);
    grupos.set(status, lista);
  }

  async function confirmarExcluir() {
    if (!excluirAlvo) return;
    setPending(true);
    setErro(null);

    const result = await excluirDespesa(excluirAlvo.id);

    setPending(false);
    if (result.error) {
      setErro(result.error);
      return;
    }

    setDespesas((atual) => atual.filter((d) => d.id !== excluirAlvo.id));
    setExcluirAlvo(null);
  }

  return (
    <div>
      {despesas.length === 0 && (
        <p className="text-sm text-text-subtle">
          Você ainda não lançou nenhuma despesa. Toque no + para começar.
        </p>
      )}

      <div className="flex flex-col gap-8">
        {ORDEM_STATUS.filter((status) => grupos.has(status)).map((status) => (
          <section key={status}>
            <div className="mb-3">
              <StatusStamp status={status} />
            </div>
            <div className="flex flex-col gap-3">
              {grupos.get(status)?.map((despesa) => {
                const conteudo = (
                  <ReceiptCard
                    valor={despesa.valor}
                    categoria={despesa.categorias_despesa?.nome ?? "Sem categoria"}
                    data={despesa.data_despesa}
                    fornecedor={despesa.fornecedor ?? "—"}
                    status={status}
                  />
                );

                const podeExcluir = STATUS_EXCLUIVEL.includes(status);
                const podeEditar = status === "reprovada" || status === "rascunho";

                return (
                  <div key={despesa.id} className="flex items-start gap-2">
                    <div className="flex-1">
                      {podeEditar ? (
                        <Link href={`/app/minhas-despesas/${despesa.id}`}>{conteudo}</Link>
                      ) : (
                        conteudo
                      )}
                    </div>
                    {podeExcluir && (
                      <button
                        type="button"
                        aria-label="Excluir despesa"
                        onClick={() => {
                          setErro(null);
                          setExcluirAlvo(despesa);
                        }}
                        className="mt-1 rounded p-2 text-text-subtle hover:text-danger"
                      >
                        <Trash2 size={18} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <Modal
        open={excluirAlvo != null}
        onClose={() => setExcluirAlvo(null)}
        title="Excluir despesa"
      >
        <p className="mb-4 text-sm text-text-default">
          Tem certeza que deseja excluir a despesa de {excluirAlvo?.fornecedor}? Essa ação não pode
          ser desfeita.
        </p>
        {erro && (
          <p className="mb-3 text-sm text-danger" role="alert">
            {erro}
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setExcluirAlvo(null)}>
            Não
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={pending}
            onClick={confirmarExcluir}
          >
            Sim, excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}
