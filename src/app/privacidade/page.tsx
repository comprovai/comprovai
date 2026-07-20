import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade — Comprovai",
};

export default function PrivacidadePage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-6 py-6 sm:px-12">
        <Link href="/" className="text-xl font-bold text-brand">
          Comprovai
        </Link>
        <Link
          href="/login"
          className="rounded border border-brand px-4 py-2 text-sm font-bold text-brand hover:bg-brand/5"
        >
          Área do Cliente
        </Link>
      </header>

      <article className="mx-auto w-full max-w-3xl flex-1 px-6 pb-16 sm:px-12">
        <h1 className="mb-2 text-2xl font-bold text-brand">Política de Privacidade</h1>
        <p className="mb-8 text-xs text-text-subtle">Última atualização: 20 de julho de 2026</p>

        <div className="flex flex-col gap-6 text-sm leading-relaxed text-text-default">
          <section>
            <p>
              Esta Política de Privacidade descreve como o Comprovai coleta, usa, armazena e
              protege dados pessoais no contexto do sistema de lançamento, aprovação e
              reembolso de despesas corporativas, em conformidade com a Lei Geral de Proteção
              de Dados (Lei nº 13.709/2018 — LGPD).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">1. Controlador dos dados</h2>
            <p>
              O Comprovai é o controlador dos dados pessoais tratados na plataforma. Contato:
              comprovai.app@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">2. Dados que coletamos</h2>
            <ul className="ml-5 list-disc">
              <li>
                <strong>Dados de conta:</strong> nome, e-mail corporativo, cargo/papel no
                sistema (colaborador, aprovador, financeiro ou admin);
              </li>
              <li>
                <strong>Dados de despesas:</strong> valor, data, fornecedor, categoria, projeto
                ou cliente relacionado, e a imagem do comprovante fotografado — que pode conter
                dados de terceiros (ex: CNPJ do estabelecimento);
              </li>
              <li>
                <strong>Dados de assinatura:</strong> ao assinar digitalmente um recibo de
                reembolso, capturamos a imagem da assinatura, endereço IP, navegador utilizado
                e data/hora, como evidência de autenticidade;
              </li>
              <li>
                <strong>Dados de contato (leads):</strong> quando alguém solicita acesso pelo
                site público, coletamos nome, e-mail, empresa, telefone e mensagem opcional.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">3. Finalidade do tratamento</h2>
            <p>
              Os dados são usados exclusivamente para operar o sistema: autenticar usuários,
              processar o fluxo de lançamento/aprovação/reembolso de despesas, gerar
              automaticamente os documentos de nota de débito e recibo de reembolso, e
              responder a solicitações de contato recebidas pelo site.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">4. Base legal</h2>
            <p>
              O tratamento de dados de usuários da plataforma se baseia na execução de
              contrato firmado entre o Comprovai e a empresa contratante (art. 7º, V, LGPD) e
              no cumprimento de obrigações legais e regulatórias relacionadas a documentos
              fiscais e contábeis, quando aplicável. O tratamento de dados de leads da landing
              page se baseia no legítimo interesse em responder a uma solicitação de contato
              iniciada voluntariamente pelo titular.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">5. Compartilhamento de dados</h2>
            <p>Os dados podem ser processados pelos seguintes operadores, exclusivamente para viabilizar o serviço:</p>
            <ul className="ml-5 mt-2 list-disc">
              <li>
                <strong>Supabase</strong> (banco de dados, autenticação e armazenamento de
                arquivos) — infraestrutura em nuvem que hospeda os dados da plataforma;
              </li>
              <li>
                <strong>Anthropic (Claude API)</strong> — usada para leitura automática de
                dados de comprovantes fotografados (valor, data, fornecedor), processando a
                imagem no momento do lançamento da despesa.
              </li>
            </ul>
            <p className="mt-2">
              Não vendemos nem compartilhamos dados pessoais com terceiros para fins de
              marketing.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">6. Retenção de dados</h2>
            <p>
              Os dados são mantidos enquanto durar o contrato entre o Comprovai e a empresa
              contratante, e pelo prazo adicional necessário para cumprimento de obrigações
              legais (ex: guarda de documentos fiscais). Registros de exclusão de despesas são
              mantidos de forma permanente e imutável, para fins de auditoria e trilha de
              responsabilidade.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">7. Direitos do titular</h2>
            <p>Nos termos da LGPD, o titular dos dados pode solicitar, a qualquer momento:</p>
            <ul className="ml-5 mt-2 list-disc">
              <li>Confirmação da existência de tratamento e acesso aos dados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>
                Anonimização, bloqueio ou eliminação de dados desnecessários, observadas as
                obrigações legais de retenção;
              </li>
              <li>Portabilidade dos dados a outro fornecedor de serviço;</li>
              <li>Informação sobre com quem os dados são compartilhados.</li>
            </ul>
            <p className="mt-2">
              Solicitações podem ser feitas pelo e-mail comprovai.app@gmail.com. Para usuários
              vinculados a uma empresa cliente, algumas solicitações podem depender de
              validação junto ao administrador da conta da empresa.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">8. Segurança</h2>
            <p>
              Os dados de cada empresa cliente são isolados logicamente dos dados de outras
              empresas no banco de dados (controle de acesso por linha), e o acesso ao sistema
              exige autenticação individual por usuário. A comunicação entre o navegador e os
              servidores é criptografada (HTTPS).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">9. Cookies</h2>
            <p>
              O Comprovai utiliza apenas cookies técnicos essenciais para manter a sessão de
              login do usuário autenticado. Não utilizamos cookies de rastreamento publicitário
              ou de análise de terceiros.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">10. Alterações nesta política</h2>
            <p>
              Esta política pode ser atualizada periodicamente para refletir mudanças no
              sistema ou na legislação aplicável. A data da última atualização está indicada no
              topo desta página.
            </p>
          </section>
        </div>
      </article>

      <footer className="px-6 py-6 text-center text-xs text-text-subtle sm:px-12">Comprovai</footer>
    </main>
  );
}
