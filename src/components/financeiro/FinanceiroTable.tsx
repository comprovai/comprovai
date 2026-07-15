"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StatusStamp } from "@/components/ui/StatusStamp";
import { formatCurrency, formatDate } from "@/lib/format";
import { moverParaFinanceiro, marcarComoReembolsado } from "@/app/app/financeiro/actions";
import type { ExpenseStatus } from "@/types/expense";

export interface DespesaFinanceiro {
  id: string;
  dataDespesa: string;
  colaboradorNome: string;
  categoriaNome: string;
  fornecedor: string;
  valor: number;
  tipo: "reembolso" | "nota_debito" | "ambos";
  status: ExpenseStatus;
  projetoNome: string | null;
  clienteNome: string | null;
}

const TIPO_LABEL: Record<DespesaFinanceiro["tipo"], string> = {
  reembolso: "Reembolso",
  nota_debito: "Nota de débito",
  ambos: "Ambos",
};

interface FinanceiroTableProps {
  despesasIniciais: DespesaFinanceiro[];
  statusFiltro: string | null;
}

function exportarCsv(despesas: DespesaFinanceiro[]) {
  const cabecalho = [
    "Data",
    "Colaborador",
    "Categoria",
    "Fornecedor",
    "Valor",
    "Projeto/Cliente",
    "Tipo",
    "Status",
  ];

  const linhas = despesas.map((d) => [
    formatDate(d.dataDespesa),
    d.colaboradorNome,
    d.categoriaNome,
    d.fornecedor,
    d.valor.toFixed(2).replace(".", ","),
    [d.projetoNome, d.clienteNome].filter(Boolean).join(" / ") || "—",
    TIPO_LABEL[d.tipo],
    d.status,
  ]);

  const csv = [cabecalho, ...linhas]
    .map((linha) => linha.map((valor) => `"${String(valor).replace(/"/g, '""')}"`).join(";"))
    .join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `despesas-financeiro-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function FinanceiroTable({ despesasIniciais, statusFiltro }: FinanceiroTableProps) {
  const [despesas, setDespesas] = useState(despesasIniciais);
  const [reembolsarAlvo, setReembolsarAlvo] = useState<DespesaFinanceiro | null>(null);
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().slice(0, 10));
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function atualizarLinha(id: string, novoStatus: ExpenseStatus) {
    setDespesas((atual) =>
      atual
        .map((d) => (d.id === id ? { ...d, status: novoStatus } : d))
        .filter((d) => !statusFiltro || d.status === statusFiltro)
    );
  }

  async function handleMoverParaFinanceiro(despesa: DespesaFinanceiro) {
    setPendingId(despesa.id);
    setErro(null);

    const result = await moverParaFinanceiro(despesa.id);

    setPendingId(null);
    if (result.error) {
      setErro(result.error);
      return;
    }

    atualizarLinha(despesa.id, "financeiro");
  }

  async function confirmarReembolso() {
    if (!reembolsarAlvo) return;

    setPendingId(reembolsarAlvo.id);
    setErro(null);

    const result = await marcarComoReembolsado(reembolsarAlvo.id, dataPagamento);

    setPendingId(null);
    if (result.error) {
      setErro(result.error);
      return;
    }

    atualizarLinha(reembolsarAlvo.id, "lancada");
    setReembolsarAlvo(null);
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Button variant="secondary" onClick={() => exportarCsv(despesas)}>
          <span className="flex items-center gap-2">
            <Download size={16} strokeWidth={1.5} />
            Exportar CSV
          </span>
        </Button>
      </div>

      {erro && (
        <p className="mb-3 text-sm text-danger" role="alert">
          {erro}
        </p>
      )}

      <div className="overflow-x-auto rounded border border-border-default bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default text-left text-xs uppercase tracking-wide text-text-subtle">
              <th className="px-3 py-2 font-bold">Data</th>
              <th className="px-3 py-2 font-bold">Colaborador</th>
              <th className="px-3 py-2 font-bold">Categoria</th>
              <th className="px-3 py-2 font-bold">Fornecedor</th>
              <th className="px-3 py-2 text-right font-bold">Valor</th>
              <th className="px-3 py-2 font-bold">Projeto/Cliente</th>
              <th className="px-3 py-2 font-bold">Tipo</th>
              <th className="px-3 py-2 font-bold">Status</th>
              <th className="px-3 py-2 font-bold">Ação</th>
            </tr>
          </thead>
          <tbody>
            {despesas.map((d) => (
              <tr key={d.id} className="border-b border-border-default last:border-0">
                <td className="whitespace-nowrap px-3 py-2">{formatDate(d.dataDespesa)}</td>
                <td className="px-3 py-2">{d.colaboradorNome}</td>
                <td className="px-3 py-2">{d.categoriaNome}</td>
                <td className="px-3 py-2">{d.fornecedor}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right font-bold [font-variant-numeric:tabular-nums]">
                  {formatCurrency(d.valor)}
                </td>
                <td className="px-3 py-2">
                  {[d.projetoNome, d.clienteNome].filter(Boolean).join(" / ") || "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-2">{TIPO_LABEL[d.tipo]}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  <StatusStamp status={d.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  {d.status === "aprovada" && (
                    <Button
                      variant="secondary"
                      className="px-3 py-1 text-xs"
                      disabled={pendingId === d.id}
                      onClick={() => handleMoverParaFinanceiro(d)}
                    >
                      Mover para financeiro
                    </Button>
                  )}
                  {d.status === "financeiro" && d.tipo === "reembolso" && (
                    <Button
                      variant="success"
                      className="px-3 py-1 text-xs"
                      disabled={pendingId === d.id}
                      onClick={() => {
                        setErro(null);
                        setDataPagamento(new Date().toISOString().slice(0, 10));
                        setReembolsarAlvo(d);
                      }}
                    >
                      Marcar como reembolsado
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {despesas.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-text-subtle">
                  Nenhuma despesa encontrada para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={reembolsarAlvo != null}
        onClose={() => setReembolsarAlvo(null)}
        title="Marcar como reembolsado"
      >
        <p className="mb-4 text-sm text-text-default">
          Informe a data de pagamento da despesa de {reembolsarAlvo?.fornecedor}:
        </p>
        <Input
          label="Data de pagamento"
          type="date"
          value={dataPagamento}
          onChange={(e) => setDataPagamento(e.target.value)}
        />
        {erro && (
          <p className="mt-3 text-sm text-danger" role="alert">
            {erro}
          </p>
        )}
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setReembolsarAlvo(null)}>
            Cancelar
          </Button>
          <Button
            variant="success"
            className="flex-1"
            disabled={pendingId === reembolsarAlvo?.id}
            onClick={confirmarReembolso}
          >
            Confirmar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
