"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { formatDate } from "@/lib/format";
import { AssinarReciboModal } from "@/components/documentos/AssinarReciboModal";

export interface Recibo {
  id: string;
  numero: string;
  dataEmissao: string;
  valorTotal: number;
  pdfUrl: string | null;
}

interface RecibosListProps {
  pendentes: Recibo[];
  assinados: Recibo[];
}

export function RecibosList({ pendentes: pendentesIniciais, assinados: assinadosIniciais }: RecibosListProps) {
  const [pendentes, setPendentes] = useState(pendentesIniciais);
  const [assinados, setAssinados] = useState(assinadosIniciais);
  const [alvo, setAlvo] = useState<Recibo | null>(null);

  function handleAssinado(pdfUrl: string | undefined) {
    if (!alvo) return;
    setPendentes((atual) => atual.filter((r) => r.id !== alvo.id));
    setAssinados((atual) => [{ ...alvo, pdfUrl: pdfUrl ?? null }, ...atual]);
    setAlvo(null);
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand">
          Aguardando sua assinatura
        </h2>
        {pendentes.length === 0 && (
          <p className="text-sm text-text-subtle">Nenhum recibo aguardando assinatura.</p>
        )}
        <div className="flex flex-col gap-3">
          {pendentes.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded border border-border-default bg-surface p-4"
            >
              <div>
                <p className="font-bold">Recibo Nº {r.numero}</p>
                <p className="text-xs text-text-subtle">{formatDate(r.dataEmissao)}</p>
              </div>
              <MoneyDisplay value={r.valorTotal} size="md" />
              <Button variant="primary" className="px-3 py-1 text-xs" onClick={() => setAlvo(r)}>
                Assinar
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-brand">Assinados</h2>
        {assinados.length === 0 && <p className="text-sm text-text-subtle">Nenhum recibo assinado ainda.</p>}
        <div className="flex flex-col gap-3">
          {assinados.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded border border-border-default bg-surface p-4"
            >
              <div>
                <p className="font-bold">Recibo Nº {r.numero}</p>
                <p className="text-xs text-text-subtle">{formatDate(r.dataEmissao)}</p>
              </div>
              <MoneyDisplay value={r.valorTotal} size="md" />
              {r.pdfUrl && (
                <a href={r.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-brand underline">
                  Abrir PDF
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {alvo && (
        <AssinarReciboModal
          documentoId={alvo.id}
          numero={alvo.numero}
          valorTotal={alvo.valorTotal}
          onFechar={() => setAlvo(null)}
          onAssinado={handleAssinado}
        />
      )}
    </div>
  );
}
