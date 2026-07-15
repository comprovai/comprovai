"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { salvarDespesa } from "@/app/app/minhas-despesas/actions";
import type { Json } from "@/types/database.types";

type Tipo = "reembolso" | "nota_debito" | "ambos";

interface Categoria {
  id: string;
  nome: string;
}

interface Projeto {
  id: string;
  nome: string;
  clienteId: string | null;
  clienteNome: string | null;
}

interface DespesaExistente {
  id: string;
  valor: number;
  dataDespesa: string;
  categoriaId: string | null;
  fornecedor: string;
  projetoId: string | null;
  clienteId: string | null;
  tipo: Tipo;
  motivoReprovacao: string | null;
  comprovanteUrl: string | null;
  comprovantePath: string | null;
  origemIa: Json | null;
}

interface DespesaFormProps {
  categorias: Categoria[];
  projetos: Projeto[];
  despesaExistente?: DespesaExistente;
}

interface Extracao {
  valor: number | null;
  data: string | null;
  fornecedor: string | null;
  cnpj_fornecedor: string | null;
  categoria_sugerida: string | null;
}

export function DespesaForm({ categorias, projetos, despesaExistente }: DespesaFormProps) {
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string | null>(
    despesaExistente?.comprovanteUrl ?? null
  );
  const [extracting, setExtracting] = useState(false);
  const [extractionRaw, setExtractionRaw] = useState<Json | null>(
    despesaExistente?.origemIa ?? null
  );
  const [comprovantePath, setComprovantePath] = useState<string | null>(
    despesaExistente?.comprovantePath ?? null
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [valor, setValor] = useState(
    despesaExistente?.valor ? String(despesaExistente.valor).replace(".", ",") : ""
  );
  const [dataDespesa, setDataDespesa] = useState(despesaExistente?.dataDespesa ?? "");
  const [categoriaId, setCategoriaId] = useState(despesaExistente?.categoriaId ?? "");
  const [fornecedor, setFornecedor] = useState(despesaExistente?.fornecedor ?? "");
  const [projetoId, setProjetoId] = useState(despesaExistente?.projetoId ?? "");
  const [tipo, setTipo] = useState<Tipo>(despesaExistente?.tipo ?? "reembolso");

  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const projetoSelecionado = projetos.find((p) => p.id === projetoId) ?? null;
  const clienteId = projetoSelecionado?.clienteId ?? null;

  const valorNumero = Number(valor.replace(",", "."));
  const valorInvalido = valor.trim() === "" || Number.isNaN(valorNumero) || valorNumero <= 0;
  const podeEnviar =
    !valorInvalido && dataDespesa.trim() !== "" && categoriaId !== "" && fornecedor.trim() !== "";

  async function handleFotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFotoPreviewUrl(URL.createObjectURL(file));
    setUploadError(null);
    setExtracting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/extrair-comprovante", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        setUploadError(json.error ?? "Não foi possível ler o comprovante.");
        if (json.comprovantePath) {
          setComprovantePath(json.comprovantePath);
        }
        return;
      }

      const extraction: Extracao = json.extraction;
      setExtractionRaw(extraction as unknown as Json);
      setComprovantePath(json.comprovantePath);

      setValor(extraction.valor != null ? String(extraction.valor) : "");
      setDataDespesa(extraction.data ?? "");
      setFornecedor(extraction.fornecedor ?? "");

      const categoriaEncontrada = categorias.find((c) => c.nome === extraction.categoria_sugerida);
      setCategoriaId(categoriaEncontrada?.id ?? "");
    } catch {
      setUploadError("Não foi possível ler o comprovante. Preencha os campos manualmente.");
    } finally {
      setExtracting(false);
    }
  }

  async function submeter(enviar: boolean) {
    setPending(true);
    setServerError(null);

    const result = await salvarDespesa({
      despesaId: despesaExistente?.id,
      valor: valor.trim() === "" ? 0 : valorNumero,
      dataDespesa: dataDespesa || new Date().toISOString().slice(0, 10),
      categoriaId,
      fornecedor,
      projetoId: projetoId || null,
      clienteId,
      tipo,
      comprovantePath,
      extracaoIa: extractionRaw,
      enviar,
    });

    if (result?.error) {
      setServerError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5">
      {despesaExistente?.motivoReprovacao && (
        <div className="flex items-start gap-3 rounded border border-danger bg-danger/10 p-4">
          <AlertTriangle size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-danger" />
          <div>
            <p className="text-sm font-bold text-danger">Despesa reprovada</p>
            <p className="text-sm text-danger">{despesaExistente.motivoReprovacao}</p>
          </div>
        </div>
      )}

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFotoChange}
          className="sr-only"
        />

        {fotoPreviewUrl ? (
          <div className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fotoPreviewUrl}
              alt="Comprovante"
              className="h-48 w-full rounded border border-border-default object-cover"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="self-start text-xs text-brand underline"
            >
              Trocar foto
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded border border-dashed border-border-default bg-surface py-8 text-text-subtle"
          >
            <Camera size={28} strokeWidth={1.5} />
            <span className="text-sm">Fotografar comprovante</span>
          </button>
        )}

        {extracting && <p className="mt-2 text-sm text-text-subtle">Lendo comprovante...</p>}
        {uploadError && (
          <p className="mt-2 text-sm text-danger" role="alert">
            {uploadError}
          </p>
        )}
      </div>

      {extractionRaw != null && (
        <p className="text-xs text-text-subtle">Confira os dados antes de enviar</p>
      )}

      <Input
        label="Valor"
        name="valor"
        inputMode="decimal"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className={valorInvalido ? "border-danger" : undefined}
        placeholder="0,00"
      />

      <Input
        label="Data"
        name="data"
        type="date"
        value={dataDespesa}
        onChange={(e) => setDataDespesa(e.target.value)}
      />

      <Select
        label="Categoria"
        name="categoria"
        value={categoriaId}
        onChange={(e) => setCategoriaId(e.target.value)}
      >
        <option value="">Selecione...</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </Select>

      <Input
        label="Fornecedor"
        name="fornecedor"
        value={fornecedor}
        onChange={(e) => setFornecedor(e.target.value)}
      />

      <Select
        label="Projeto/proposta (opcional)"
        name="projeto"
        value={projetoId}
        onChange={(e) => setProjetoId(e.target.value)}
      >
        <option value="">Nenhum</option>
        {projetos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </Select>

      {projetoSelecionado?.clienteNome && (
        <Input label="Cliente" name="cliente" value={projetoSelecionado.clienteNome} disabled />
      )}

      <Select
        label="Tipo"
        name="tipo"
        value={tipo}
        onChange={(e) => setTipo(e.target.value as Tipo)}
      >
        <option value="reembolso">Reembolso</option>
        <option value="nota_debito">Nota de débito</option>
        <option value="ambos">Ambos</option>
      </Select>

      {serverError && (
        <p className="text-sm text-danger" role="alert">
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          disabled={pending}
          onClick={() => submeter(false)}
        >
          Salvar rascunho
        </Button>
        <Button
          type="button"
          variant="primary"
          className="flex-1"
          disabled={pending || !podeEnviar}
          onClick={() => submeter(true)}
        >
          Enviar para aprovação
        </Button>
      </div>
    </div>
  );
}
