"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ReceiptCard } from "@/components/ui/ReceiptCard";
import { Textarea } from "@/components/ui/Textarea";
import { aprovarDespesa, reprovarDespesa } from "@/app/app/aprovacoes/actions";

export interface DespesaAprovacao {
  id: string;
  valor: number;
  dataDespesa: string;
  fornecedor: string;
  categoriaNome: string;
  colaboradorNome: string;
  comprovanteUrl: string | null;
}

interface AprovacoesListProps {
  despesasIniciais: DespesaAprovacao[];
}

export function AprovacoesList({ despesasIniciais }: AprovacoesListProps) {
  const [despesas, setDespesas] = useState(despesasIniciais);
  const [imagemAberta, setImagemAberta] = useState<string | null>(null);
  const [aprovarAlvo, setAprovarAlvo] = useState<DespesaAprovacao | null>(null);
  const [reprovarAlvo, setReprovarAlvo] = useState<DespesaAprovacao | null>(null);
  const [motivo, setMotivo] = useState("");
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function removerDaLista(id: string) {
    setDespesas((atual) => atual.filter((d) => d.id !== id));
  }

  async function confirmarAprovar() {
    if (!aprovarAlvo) return;
    setPending(true);
    setErro(null);

    const result = await aprovarDespesa(aprovarAlvo.id);

    setPending(false);
    if (result.error) {
      setErro(result.error);
      return;
    }

    removerDaLista(aprovarAlvo.id);
    setAprovarAlvo(null);
  }

  async function confirmarReprovar() {
    if (!reprovarAlvo) return;
    if (!motivo.trim()) return;

    setPending(true);
    setErro(null);

    const result = await reprovarDespesa(reprovarAlvo.id, motivo);

    setPending(false);
    if (result.error) {
      setErro(result.error);
      return;
    }

    removerDaLista(reprovarAlvo.id);
    setReprovarAlvo(null);
    setMotivo("");
  }

  return (
    <div>
      <p className="mb-6 text-lg font-bold text-brand">
        {despesas.length} {despesas.length === 1 ? "despesa" : "despesas"} aguardando aprovação
      </p>

      {despesas.length === 0 && (
        <p className="text-sm text-text-subtle">Nenhuma despesa aguardando sua aprovação.</p>
      )}

      <div className="flex flex-col gap-4">
        {despesas.map((despesa) => (
          <div
            key={despesa.id}
            className="flex flex-col gap-3 rounded border border-border-default bg-surface p-4 sm:flex-row"
          >
            {despesa.comprovanteUrl && (
              <button
                type="button"
                onClick={() => setImagemAberta(despesa.comprovanteUrl)}
                className="shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={despesa.comprovanteUrl}
                  alt="Comprovante"
                  className="h-20 w-20 rounded border border-border-default object-cover"
                />
              </button>
            )}

            <div className="flex-1">
              <ReceiptCard
                valor={despesa.valor}
                categoria={despesa.categoriaNome}
                data={despesa.dataDespesa}
                fornecedor={despesa.fornecedor}
                status="enviada"
              />
              <p className="mt-2 text-xs text-text-subtle">
                Colaborador: {despesa.colaboradorNome}
              </p>
            </div>

            <div className="flex gap-3 sm:flex-col sm:justify-center">
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => {
                  setErro(null);
                  setMotivo("");
                  setReprovarAlvo(despesa);
                }}
              >
                Reprovar
              </Button>
              <Button
                variant="success"
                className="flex-1"
                onClick={() => {
                  setErro(null);
                  setAprovarAlvo(despesa);
                }}
              >
                Aprovar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={imagemAberta != null} onClose={() => setImagemAberta(null)} title="Comprovante">
        {imagemAberta && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagemAberta} alt="Comprovante em tamanho maior" className="w-full rounded" />
        )}
      </Modal>

      <Modal
        open={aprovarAlvo != null}
        onClose={() => setAprovarAlvo(null)}
        title="Aprovar despesa"
      >
        <p className="mb-4 text-sm text-text-default">
          Confirma a aprovação da despesa de {aprovarAlvo?.fornecedor}?
        </p>
        {erro && (
          <p className="mb-3 text-sm text-danger" role="alert">
            {erro}
          </p>
        )}
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setAprovarAlvo(null)}>
            Cancelar
          </Button>
          <Button variant="success" className="flex-1" disabled={pending} onClick={confirmarAprovar}>
            Confirmar
          </Button>
        </div>
      </Modal>

      <Modal
        open={reprovarAlvo != null}
        onClose={() => setReprovarAlvo(null)}
        title="Reprovar despesa"
      >
        <p className="mb-3 text-sm text-text-default">
          Descreva o motivo da reprovação da despesa de {reprovarAlvo?.fornecedor}:
        </p>
        <Textarea
          label="Motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          required
        />
        {erro && (
          <p className="mt-3 text-sm text-danger" role="alert">
            {erro}
          </p>
        )}
        <div className="mt-4 flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setReprovarAlvo(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            disabled={pending || !motivo.trim()}
            onClick={confirmarReprovar}
          >
            Confirmar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
