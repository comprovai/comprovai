"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MoneyDisplay } from "@/components/ui/MoneyDisplay";
import { SignaturePad, type SignaturePadHandle } from "@/components/documentos/SignaturePad";
import { assinarRecibo } from "@/app/app/minhas-despesas/recibos/actions";

interface AssinarReciboModalProps {
  documentoId: string;
  numero: string;
  valorTotal: number;
  onFechar: () => void;
  onAssinado: (pdfUrl?: string) => void;
}

export function AssinarReciboModal({
  documentoId,
  numero,
  valorTotal,
  onFechar,
  onAssinado,
}: AssinarReciboModalProps) {
  const padRef = useRef<SignaturePadHandle>(null);
  const [pending, setPending] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function confirmar() {
    const dataUrl = padRef.current?.getDataUrl();
    if (!dataUrl) {
      setErro("Assine no campo acima antes de confirmar.");
      return;
    }

    setPending(true);
    setErro(null);

    const result = await assinarRecibo(documentoId, dataUrl);

    setPending(false);

    if (result.error) {
      setErro(result.error);
      return;
    }

    onAssinado(result.pdfUrl);
  }

  return (
    <Modal open onClose={onFechar} title={`Assinar Recibo Nº ${numero}`}>
      <p className="mb-3 text-sm text-text-default">
        Declaro que os valores abaixo referem-se a reembolso de despesas efetivamente incorridas
        em nome da empresa, não constituindo remuneração ou contraprestação de serviços.
      </p>
      <div className="mb-4">
        <MoneyDisplay value={valorTotal} size="lg" />
      </div>
      <p className="mb-2 text-xs text-text-subtle">Assine no campo abaixo:</p>
      <SignaturePad ref={padRef} />
      <button
        type="button"
        onClick={() => padRef.current?.clear()}
        className="mt-2 text-xs text-brand underline"
      >
        Limpar assinatura
      </button>

      {erro && (
        <p className="mt-3 text-sm text-danger" role="alert">
          {erro}
        </p>
      )}

      <div className="mt-4 flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onFechar}>
          Cancelar
        </Button>
        <Button variant="success" className="flex-1" disabled={pending} onClick={confirmar}>
          {pending ? "Assinando..." : "Confirmar assinatura"}
        </Button>
      </div>
    </Modal>
  );
}
