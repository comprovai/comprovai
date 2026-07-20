import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-open-sans",
});

const SITE_URL = "https://comprovai.vercel.app";
const TITLE = "Comprovai — Reembolso de despesas e cobrança ao cliente, sem planilha";
const DESCRIPTION =
  "Colaborador fotografa o comprovante, o sistema aprova, reembolsa e já gera a nota de débito pro cliente. Feito pra consultorias e prestadoras de serviço que ainda fazem esse fluxo na mão.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "nota de débito",
    "reembolso de despesas",
    "repasse de despesas ao cliente",
    "gestão de despesas corporativas",
    "sistema de reembolso para consultoria",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Comprovai",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${openSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
