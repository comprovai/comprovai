"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { atualizarUsuario, resetarSenha } from "@/app/app/admin/usuarios/actions";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: string;
  gestorId: string | null;
  ativo: boolean;
}

interface UsuariosTableProps {
  usuarios: Usuario[];
  aprovadores: { id: string; nome: string }[];
}

const ROLES = [
  { value: "colaborador", label: "Colaborador" },
  { value: "aprovador", label: "Aprovador" },
  { value: "financeiro", label: "Financeiro" },
  { value: "admin", label: "Admin" },
];

function LinhaUsuario({
  usuario,
  aprovadores,
}: {
  usuario: Usuario;
  aprovadores: { id: string; nome: string }[];
}) {
  const [role, setRole] = useState(usuario.role);
  const [gestorId, setGestorId] = useState(usuario.gestorId ?? "");
  const [ativo, setAtivo] = useState(usuario.ativo);
  const [novaSenha, setNovaSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function salvar() {
    setPending(true);
    setErro(null);
    setMensagem(null);
    const result = await atualizarUsuario(usuario.id, {
      role,
      gestorId: gestorId || null,
      ativo,
    });
    setPending(false);
    if (result.error) {
      setErro(result.error);
      return;
    }
    setMensagem("Salvo.");
  }

  async function trocarSenha() {
    if (!novaSenha) return;
    setPending(true);
    setErro(null);
    setMensagem(null);
    const result = await resetarSenha(usuario.id, novaSenha);
    setPending(false);
    if (result.error) {
      setErro(result.error);
      return;
    }
    setNovaSenha("");
    setMensagem("Senha atualizada.");
  }

  return (
    <tr className="border-b border-border-default last:border-0 align-top">
      <td className="px-3 py-2">
        <p className="font-bold">{usuario.nome}</p>
        <p className="text-xs text-text-subtle">{usuario.email}</p>
        {erro && <p className="mt-1 text-xs text-danger">{erro}</p>}
        {mensagem && <p className="mt-1 text-xs text-success">{mensagem}</p>}
      </td>
      <td className="px-3 py-2">
        <Select label="" value={role} onChange={(e) => setRole(e.target.value)} className="min-w-[9rem]">
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </td>
      <td className="px-3 py-2">
        <Select
          label=""
          value={gestorId}
          onChange={(e) => setGestorId(e.target.value)}
          className="min-w-[9rem]"
        >
          <option value="">Sem gestor</option>
          {aprovadores.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </Select>
      </td>
      <td className="px-3 py-2 text-center">
        <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
      </td>
      <td className="whitespace-nowrap px-3 py-2">
        <Button variant="secondary" className="px-3 py-1 text-xs" disabled={pending} onClick={salvar}>
          Salvar
        </Button>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <Input
            label=""
            type="password"
            placeholder="Nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            className="w-32 py-1 text-xs"
          />
          <Button
            variant="secondary"
            className="whitespace-nowrap px-3 py-1 text-xs"
            disabled={pending || !novaSenha}
            onClick={trocarSenha}
          >
            Trocar
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function UsuariosTable({ usuarios, aprovadores }: UsuariosTableProps) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-border-default text-left text-xs uppercase tracking-wide text-text-subtle">
          <th className="px-3 py-2 font-bold">Usuário</th>
          <th className="px-3 py-2 font-bold">Papel</th>
          <th className="px-3 py-2 font-bold">Gestor</th>
          <th className="px-3 py-2 font-bold">Ativo</th>
          <th className="px-3 py-2 font-bold"></th>
          <th className="px-3 py-2 font-bold">Senha</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((u) => (
          <LinhaUsuario key={u.id} usuario={u} aprovadores={aprovadores} />
        ))}
      </tbody>
    </table>
  );
}
