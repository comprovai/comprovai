import Link from "next/link";

export const metadata = {
  title: "Termos de Uso — Comprovai",
};

export default function TermosPage() {
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
        <h1 className="mb-2 text-2xl font-bold text-brand">Termos de Uso</h1>
        <p className="mb-8 text-xs text-text-subtle">Última atualização: 20 de julho de 2026</p>

        <div className="flex flex-col gap-6 text-sm leading-relaxed text-text-default">
          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">1. Aceitação dos termos</h2>
            <p>
              Estes Termos de Uso regem a contratação e utilização do Comprovai, sistema de
              lançamento, aprovação, reembolso de despesas corporativas e emissão de nota de
              débito para repasse de custo a clientes, oferecido como software como serviço
              (SaaS). Ao acessar ou usar o Comprovai, a empresa contratante (&ldquo;Cliente&rdquo;) e
              seus usuários autorizados concordam com estes Termos.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">2. Descrição do serviço</h2>
            <p>
              O Comprovai permite que colaboradores lancem despesas com leitura automática de
              comprovantes por inteligência artificial, que gestores aprovem ou reprovem essas
              despesas, que o setor financeiro confira e processe reembolsos, e que sejam
              gerados automaticamente documentos de nota de débito e recibo de reembolso em
              PDF, incluindo assinatura digital do colaborador quando aplicável.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">3. Cadastro e conta de acesso</h2>
            <p>
              O acesso ao Comprovai é restrito a usuários cadastrados pelo administrador da
              conta do Cliente, vinculados ao domínio de e-mail corporativo da empresa
              contratante. Não há cadastro público ou autoatendimento. O Cliente é responsável
              por manter a confidencialidade das credenciais de seus usuários e por toda
              atividade realizada através delas.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">4. Responsabilidades do Cliente</h2>
            <p>O Cliente compromete-se a:</p>
            <ul className="ml-5 mt-2 list-disc">
              <li>Fornecer dados corretos sobre sua empresa, colaboradores e despesas;</li>
              <li>
                Utilizar o sistema apenas para fins lícitos e relacionados à gestão de despesas
                corporativas;
              </li>
              <li>
                Garantir que os documentos gerados (nota de débito, recibo de reembolso) sejam
                revisados antes de qualquer uso formal, fiscal ou contratual perante terceiros;
              </li>
              <li>
                Gerenciar o desligamento de colaboradores, desativando o acesso destes no
                sistema quando aplicável.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">5. Responsabilidades do Comprovai</h2>
            <p>
              O Comprovai compromete-se a manter o serviço disponível dentro de padrões
              razoáveis de mercado, a proteger os dados tratados conforme descrito na{" "}
              <Link href="/privacidade" className="text-primary underline">
                Política de Privacidade
              </Link>
              , e a comunicar o Cliente sobre alterações relevantes no funcionamento do
              sistema. A extração automática de dados de comprovantes por inteligência
              artificial é uma conveniência sujeita a revisão manual pelo usuário — o
              Comprovai não garante 100% de precisão nessa leitura automática.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">6. Planos, pagamento e cancelamento</h2>
            <p>
              As condições comerciais (plano, valores, forma de pagamento e prazo de vigência)
              são definidas em proposta comercial específica acordada entre o Comprovai e o
              Cliente no momento da contratação. O cancelamento pode ser solicitado a qualquer
              momento pelo Cliente, respeitando eventuais condições contratuais específicas
              acordadas.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">7. Propriedade intelectual</h2>
            <p>
              O software, marca, layout e demais elementos do Comprovai são de propriedade
              exclusiva do Comprovai. Os dados inseridos pelo Cliente (despesas, comprovantes,
              documentos gerados) permanecem de propriedade do Cliente, que concede ao
              Comprovai apenas a licença necessária para processá-los e armazená-los na
              prestação do serviço.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">8. Limitação de responsabilidade</h2>
            <p>
              O Comprovai não se responsabiliza por decisões comerciais, fiscais ou contratuais
              tomadas pelo Cliente com base nos documentos gerados pelo sistema, nem por danos
              indiretos decorrentes de indisponibilidade temporária do serviço, respeitados os
              limites da legislação aplicável.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">9. Rescisão</h2>
            <p>
              Qualquer das partes pode rescindir a prestação do serviço mediante aviso prévio,
              conforme condições comerciais acordadas. Encerrada a relação, o Cliente pode
              solicitar a exportação de seus dados dentro do prazo acordado antes da exclusão
              definitiva.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">10. Alterações nestes termos</h2>
            <p>
              Estes Termos podem ser atualizados periodicamente. Alterações relevantes serão
              comunicadas ao Cliente com antecedência razoável.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">11. Foro e legislação aplicável</h2>
            <p>
              Estes Termos são regidos pela legislação brasileira. Fica eleito o foro da comarca
              do domicílio do Comprovai para dirimir eventuais controvérsias, salvo disposição
              contratual específica em contrário.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-brand">Contato</h2>
            <p>Dúvidas sobre estes Termos podem ser enviadas para comprovai.app@gmail.com.</p>
          </section>
        </div>
      </article>

      <footer className="px-6 py-6 text-center text-xs text-text-subtle sm:px-12">Comprovai</footer>
    </main>
  );
}
