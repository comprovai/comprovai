import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-open-sans",
});

const SITE_URL = "https://comprovai.vercel.app";
const TITLE = "Comprovai — Despesas, aprovação e repasse ao cliente";
const DESCRIPTION =
  "Sistema de lançamento, aprovação e reembolso de despesas corporativas com nota de débito automática para repasse de custo ao cliente. Feito para empresas de serviço e consultoria.";

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
