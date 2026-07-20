import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import {
  CONTROLES_INTERNOS,
  DEFINICOES,
  DISPOSICOES_FINAIS,
  ESCOPO,
  MANUAL_META,
  OBJETIVO,
  PAPEIS,
  PROCEDIMENTO_OPERACIONAL,
} from "@/lib/manual/conteudo-manual";

const ROLE_LABEL: Record<string, string> = {
  colaborador: "Colaborador",
  aprovador: "Aprovador",
  financeiro: "Financeiro",
  admin: "Admin",
};

export default async function ManualPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: usuarioAtual } = await supabase
    .from("usuarios")
    .select("empresa_id")
    .eq("id", user.id)
    .single();

  if (!usuarioAtual) {
    redirect("/login");
  }

  const { data: empresa } = await supabase
    .from("empresas")
    .select("nome, logo_url")
    .eq("id", usuarioAtual.empresa_id)
    .single();

  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("nome, email, role, ativo")
    .eq("empresa_id", usuarioAtual.empresa_id)
    .order("nome");

  return (
    <>
      {/* CSS injetado via dangerouslySetInnerHTML pra evitar mismatch de hidratação. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .manual-body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
        .manual-sidebar { position: fixed; left: 0; top: 100px; width: 280px; height: calc(100vh - 100px); background: white; box-shadow: 2px 0 10px rgba(0,0,0,0.1); overflow-y: auto; z-index: 1000; padding: 20px; }
        .manual-sidebar h2 { color: #1e3a8a; font-size: 18px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #3b82f6; }
        .manual-sidebar ul { list-style: none; padding: 0; margin: 0; }
        .manual-sidebar li { margin-bottom: 8px; }
        .manual-sidebar a { color: #3b82f6; text-decoration: none; display: block; padding: 8px 12px; border-radius: 4px; font-size: 14px; }
        .manual-sidebar a:hover { background-color: #f0f7ff; }
        .manual-back-to-top { position: fixed; bottom: 30px; right: 30px; background: #3b82f6; color: white; width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(59,130,246,0.4); text-decoration: none; font-size: 24px; font-weight: bold; z-index: 1000; }
        .manual-back-to-top:hover { background: #1e3a8a; }
        .manual-header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .manual-header-content { max-width: 1400px; margin: 0 auto; padding: 0 20px 0 5px; display: flex; align-items: center; gap: 20px; }
        .manual-logo { height: 60px; }
        .manual-header-title { flex: 1; text-align: center; }
        .manual-header-title h1 { font-size: 24px; font-weight: 600; margin-bottom: 5px; }
        .manual-header-title p { font-size: 14px; opacity: 0.9; }
        .manual-container { max-width: 1200px; margin: 30px auto 30px 300px; padding: 0 20px; }
        .manual-info-box { background: white; border-radius: 8px; padding: 25px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .manual-info-table { width: 100%; border-collapse: collapse; }
        .manual-info-table td { padding: 10px; border: 1px solid #ddd; }
        .manual-info-table td:first-child { background-color: #f8f9fa; font-weight: 600; width: 180px; }
        .manual-section { background: white; border-radius: 8px; padding: 30px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); scroll-margin-top: 110px; }
        .manual-section h2 { color: #1e3a8a; font-size: 24px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 3px solid #3b82f6; }
        .manual-section h3 { color: #1e3a8a; font-size: 18px; margin-top: 25px; margin-bottom: 15px; }
        .manual-section p { margin-bottom: 15px; text-align: justify; }
        .manual-section ul { margin-left: 30px; margin-bottom: 15px; }
        .manual-section li { margin-bottom: 8px; }
        .manual-checkmark { color: #10b981; margin-right: 5px; }
        .manual-table-container { overflow-x: auto; margin: 20px 0; }
        .manual-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .manual-table th { background-color: #1e3a8a; color: white; padding: 12px; text-align: left; font-weight: 600; }
        .manual-table td { padding: 12px; border: 1px solid #ddd; }
        .manual-table tr:nth-child(even) { background-color: #f8f9fa; }
        .manual-inactive { color: #9ca3af; font-style: italic; }
        .manual-footer { background-color: #1e293b; color: #94a3b8; padding: 20px; margin-top: 50px; margin-left: 280px; font-size: 12px; text-align: center; }
        .manual-footer p { margin: 5px 0; }
        html { scroll-behavior: smooth; }
        @media print {
          .manual-sidebar, .manual-back-to-top { display: none; }
          .manual-section { page-break-inside: avoid; }
          .manual-container, .manual-footer { margin-left: auto; }
        }
        @media (max-width: 768px) {
          .manual-header-content { flex-direction: column; text-align: center; }
          .manual-section { padding: 20px; }
          .manual-sidebar { display: none; }
          .manual-container, .manual-footer { margin-left: auto; }
        }
      `,
        }}
      />

      <div className="manual-body" id="top">
        <nav className="manual-sidebar">
          <h2>SUMÁRIO</h2>
          <ul>
            <li><a href="#info">Informações do Documento</a></li>
            <li><a href="#objetivo">1 Objetivo</a></li>
            <li><a href="#escopo">2 Escopo</a></li>
            <li><a href="#definicoes">3 Definições Operacionais</a></li>
            <li><a href="#papeis">4 Papéis e Responsabilidades</a></li>
            <li><a href="#procedimento">5 Procedimento Operacional</a></li>
            <li><a href="#responsaveis">6 Responsáveis e Aprovadores</a></li>
            <li><a href="#controles">7 Controles Internos</a></li>
            <li><a href="#disposicoes">8 Disposições Finais</a></li>
          </ul>
        </nav>

        <header className="manual-header">
          <div className="manual-header-content">
            {empresa?.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={empresa.logo_url} alt={empresa.nome} className="manual-logo" />
            )}
            <div className="manual-header-title">
              <h1>{MANUAL_META.titulo}</h1>
              <p>Versão {MANUAL_META.versaoRevisao} – {formatDate(MANUAL_META.dataElaboracao)}</p>
            </div>
          </div>
        </header>

        <main className="manual-container">
          <section className="manual-info-box" id="info">
            <table className="manual-info-table">
              <tbody>
                <tr><td>Tipo:</td><td>{MANUAL_META.tipo}</td></tr>
                <tr><td>Código:</td><td>{MANUAL_META.codigo}</td></tr>
                <tr><td>Data Elaboração:</td><td>{formatDate(MANUAL_META.dataElaboracao)}</td></tr>
                <tr><td>Autor(a):</td><td>{MANUAL_META.autor.nome} - {MANUAL_META.autor.cargo}</td></tr>
                <tr><td>Versão da Revisão:</td><td>{MANUAL_META.versaoRevisao}</td></tr>
                <tr><td>Revisor(a):</td><td>{MANUAL_META.revisor.nome} - {MANUAL_META.revisor.cargo}</td></tr>
                <tr><td>Data Revisão:</td><td>{formatDate(MANUAL_META.dataRevisao)}</td></tr>
                <tr><td>Aprovação:</td><td>{MANUAL_META.aprovacao.nome} - {MANUAL_META.aprovacao.cargo}</td></tr>
                <tr><td>Data Aprovação:</td><td>{formatDate(MANUAL_META.dataAprovacao)}</td></tr>
              </tbody>
            </table>
          </section>

          <section className="manual-section" id="objetivo">
            <h2>1. OBJETIVO</h2>
            <p>{OBJETIVO}</p>
          </section>

          <section className="manual-section" id="escopo">
            <h2>2. ESCOPO</h2>
            <p>{ESCOPO}</p>
          </section>

          <section className="manual-section" id="definicoes">
            <h2>3. DEFINIÇÕES OPERACIONAIS</h2>
            {DEFINICOES.map((d) => (
              <div key={d.titulo}>
                <h3>{d.titulo}</h3>
                <p>{d.texto}</p>
              </div>
            ))}
          </section>

          <section className="manual-section" id="papeis">
            <h2>4. PAPÉIS E RESPONSABILIDADES</h2>
            <div className="manual-table-container">
              <table className="manual-table">
                <thead>
                  <tr><th>Papel</th><th>Atribuições</th></tr>
                </thead>
                <tbody>
                  {PAPEIS.map((p) => (
                    <tr key={p.papel}><td>{p.papel}</td><td>{p.texto}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="manual-section" id="procedimento">
            <h2>5. PROCEDIMENTO OPERACIONAL</h2>
            {PROCEDIMENTO_OPERACIONAL.map((p) => (
              <div key={p.titulo}>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </div>
            ))}
          </section>

          <section className="manual-section" id="responsaveis">
            <h2>6. RESPONSÁVEIS E APROVADORES</h2>
            <p>Lista viva de usuários com acesso ao Comprovai em {empresa?.nome ?? "ConsulData"} — atualizada automaticamente conforme cadastro em Admin &gt; Usuários.</p>
            <div className="manual-table-container">
              <table className="manual-table">
                <thead>
                  <tr><th>Nome</th><th>Papel</th><th>E-mail</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {(usuarios ?? []).map((u) => (
                    <tr key={u.email}>
                      <td>{u.nome}</td>
                      <td>{ROLE_LABEL[u.role] ?? u.role}</td>
                      <td>{u.email}</td>
                      <td className={u.ativo ? undefined : "manual-inactive"}>
                        {u.ativo ? "Ativo" : "Inativo"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="manual-section" id="controles">
            <h2>7. CONTROLES INTERNOS</h2>
            <ul>
              {CONTROLES_INTERNOS.map((c) => (
                <li key={c}><span className="manual-checkmark">✓</span>{c}</li>
              ))}
            </ul>
          </section>

          <section className="manual-section" id="disposicoes">
            <h2>8. DISPOSIÇÕES FINAIS</h2>
            <p>{DISPOSICOES_FINAIS}</p>
          </section>
        </main>

        <a href="#top" className="manual-back-to-top" title="Voltar ao topo">↑</a>

        <footer className="manual-footer">
          <p>
            Código: {MANUAL_META.codigo} | Data de Emissão: {formatDate(MANUAL_META.dataElaboracao)} | Versão: {MANUAL_META.versaoRevisao}
          </p>
          <p>ConsulData Teleprocessamento Comércio e Serviços — Documento interno, uso restrito.</p>
        </footer>
      </div>
    </>
  );
}
