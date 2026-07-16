"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { offlineDb } from "@/lib/offline-db";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { salvarDespesa } from "@/app/app/minhas-despesas/actions";

// Lock em nível de módulo (não de componente): sobrevive ao Strict Mode do
// React re-invocando o efeito duas vezes em dev, e a qualquer remontagem do
// componente, evitando que a mesma despesa pendente seja sincronizada em
// duplicidade quando duas execuções tentam ler o Dexie ao mesmo tempo.
let sincronizacaoEmAndamento = false;

export function SincronizarPendentes() {
  const online = useOnlineStatus();
  const router = useRouter();
  const [pendentes, setPendentes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const [erros, setErros] = useState(0);

  useEffect(() => {
    offlineDb.despesasPendentes.count().then(setPendentes);
  }, []);

  useEffect(() => {
    if (!online) return;

    let cancelado = false;

    async function sincronizar() {
      if (sincronizacaoEmAndamento) return;
      sincronizacaoEmAndamento = true;

      try {
        const registros = await offlineDb.despesasPendentes.toArray();
        if (registros.length === 0) return;

        setSincronizando(true);
        let falhas = 0;

        for (const registro of registros) {
          try {
            // Reivindica o registro antes de sincronizar: se outra aba/execução
            // tentar o mesmo registro, ele já não estará mais lá pra pegar.
            if (registro.id == null) continue;
            const aindaExiste = await offlineDb.despesasPendentes.get(registro.id);
            if (!aindaExiste) continue;
            await offlineDb.despesasPendentes.delete(registro.id);

            let comprovantePath: string | null = null;

            if (registro.fotoBlob) {
              const formData = new FormData();
              formData.append("file", new File([registro.fotoBlob], registro.fotoNome));
              const response = await fetch("/api/upload-comprovante", {
                method: "POST",
                body: formData,
              });
              const json = await response.json();
              if (response.ok) {
                comprovantePath = json.comprovantePath;
              }
            }

            const result = await salvarDespesa({
              valor: registro.valor,
              dataDespesa: registro.dataDespesa,
              categoriaId: registro.categoriaId,
              fornecedor: registro.fornecedor,
              projetoId: registro.projetoId,
              clienteId: registro.clienteId,
              tipo: registro.tipo,
              comprovantePath,
              criadoOffline: true,
              skipRedirect: true,
              enviar: registro.enviar,
            });

            if (result.error) {
              // Não conseguiu salvar no servidor: devolve o registro pra
              // tentar de novo na próxima sincronização.
              falhas += 1;
              await offlineDb.despesasPendentes.add(registro);
            }
          } catch {
            falhas += 1;
            await offlineDb.despesasPendentes.add(registro);
          }
        }

        if (cancelado) return;

        setSincronizando(false);
        setErros(falhas);
        const restantes = await offlineDb.despesasPendentes.count();
        setPendentes(restantes);

        if (restantes < registros.length) {
          router.refresh();
        }
      } finally {
        sincronizacaoEmAndamento = false;
      }
    }

    sincronizar();

    return () => {
      cancelado = true;
    };
  }, [online, router]);

  if (pendentes === 0) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded border border-primary bg-primary/10 p-3 text-sm text-primary">
      <RefreshCw size={16} strokeWidth={1.5} className={sincronizando ? "animate-spin" : ""} />
      {sincronizando
        ? `Sincronizando ${pendentes} despesa(s) pendente(s)...`
        : erros > 0
          ? `${pendentes} despesa(s) ainda pendente(s) de sincronização (falha na última tentativa).`
          : `${pendentes} despesa(s) aguardando conexão para sincronizar.`}
    </div>
  );
}
