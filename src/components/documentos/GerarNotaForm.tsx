"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { formatDate } from "@/lib/format";
import { gerarNotaDebito } from "@/app/app/financeiro/gerar-documento/actions";

export interface DespesaElegivel {
  id: string;
  dataDespesa: string;
  fornecedor: string;
  categoriaNome: string;
  valor: number;
}

interface GerarNotaFormProps {
  clienteId: string;
  projetoId: string;
  despesas: DespesaElegivel[];
}

export function GerarNotaForm({ clienteId, projetoId, despesas }: GerarNotaFormProps) {
  const [selecionadas, setSelecionadas] = useState<Set<string>>(
    new Set(despesas.map((d) => d.id))
  );
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ numero: string; pdfUrl?: string } | null>(null);

  function alternar(id: string) {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  async function gerar() {
    setPending(true);
    setErro(null);

    const result = await gerarNotaDebito(clienteId, projetoId, Array.from(selecionadas));

    setPending(false);

    if (result.error) {
      setErro(result.error);
      return;
    }

    setResultado({ numero: result.numero ?? "", pdfUrl: result.pdfUrl });
  }

  const total = despesas
    .filter((d) => selecionadas.has(d.id))
    .reduce((soma, d) => soma + d.valor, 0);

  if (resultado) {
    return (
      <div className="rounded border border-success bg-success/10 p-6">
        <p className="mb-2 text-sm font-bold text-success">
          Nota de Débito Nº {resultado.numero} gerada com sucesso.
        </p>
        {resultado.pdfUrl && (
          <a
            href={resultado.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-brand underline"
          >
            Abrir PDF
          </a>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded border border-border-default bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-default text-left text-xs uppercase tracking-wide text-text-subtle">
              <th className="px-3 py-2" />
              <th className="px-3 py-2 font-bold">Data</th>
              <th className="px-3 py-2 font-bold">Fornecedor</th>
              <th className="px-3 py-2 font-bold">Categoria</th>
              <th className="px-3 py-2 text-right font-bold">Valor</th>
            </tr>
          </thead>
          <tbody>
            {despesas.map((d) => (
              <tr key={d.id} className="border-b border-border-default last:border-0">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selecionadas.has(d.id)}
                    onChange={() => alternar(d.id)}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-2">{formatDate(d.dataDespesa)}</td>
                <td className="px-3 py-2">{d.fornecedor}</td>
                <td className="px-3 py-2">{d.categoriaNome}</td>
                <td className="whitespace-nowrap px-3 py-2 text-right font-bold [font-variant-numeric:tabular-nums]">
                  <MoneyDisplay value={d.valor} size="sm" />
                </td>
              </tr>
            ))}
            {despesas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-text-subtle">
                  Nenhuma despesa elegível para este cliente/projeto (status &quot;Em
                  financeiro&quot; e tipo nota de débito/ambos).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {despesas.length > 0 && (
        <div className="mt-4 flex items-center justify-between rounded border border-border-default bg-surface p-4">
          <div>
            <p className="text-xs text-text-subtle">Total selecionado</p>
            <MoneyDisplay value={total} size="lg" />
          </div>
          <Button
            variant="primary"
            disabled={pending || selecionadas.size === 0}
            onClick={gerar}
          >
            {pending ? "Gerando..." : "Gerar Nota de Débito"}
          </Button>
        </div>
      )}

      {erro && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {erro}
        </p>
      )}
    </div>
  );
}
