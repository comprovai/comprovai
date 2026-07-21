"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, HelpCircle, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

interface SidebarProps {
  navItems: NavItem[];
  nome: string;
  empresaNome: string;
  onSignOut: () => Promise<void>;
}

function SidebarContent({
  navItems,
  nome,
  empresaNome,
  onSignOut,
  pathname,
  onNavigate,
}: SidebarProps & { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="border-b border-white/10 px-5 py-6">
          <p className="text-sm font-bold">{nome}</p>
          <p className="text-xs text-white/60">{empresaNome}</p>
        </div>
        <nav className="mt-4 flex flex-col">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "border-l-[3px] px-5 py-3 text-sm transition-colors",
                  isActive
                    ? "border-primary font-bold text-white"
                    : "border-transparent text-white/70 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-5">
        <a
          href="/manual"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
        >
          <FileText size={16} strokeWidth={1.5} />
          Manual do sistema
        </a>
        <a
          href="/faq"
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
        >
          <HelpCircle size={16} strokeWidth={1.5} />
          Perguntas frequentes
        </a>
        <form action={onSignOut}>
          <button
            type="submit"
            className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}

export function Sidebar({ navItems, nome, empresaNome, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Barra mobile: sidebar de verdade fica escondida, isso evita o layout
          forçar w-60 + conteúdo lado a lado e estourar a largura da tela. */}
      <div className="flex h-14 w-full items-center justify-between bg-brand px-4 text-white md:hidden">
        <button
          type="button"
          aria-label="Abrir menu"
          onClick={() => setOpen(true)}
          className="p-1"
        >
          <Menu size={22} strokeWidth={1.5} />
        </button>
        <p className="text-sm font-bold">Comprovai</p>
        <span className="w-[22px]" aria-hidden />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-brand text-white">
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-white/70 hover:text-white"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
            <SidebarContent
              navItems={navItems}
              nome={nome}
              empresaNome={empresaNome}
              onSignOut={onSignOut}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </div>
      )}

      <aside className="hidden h-screen w-60 shrink-0 bg-brand text-white md:flex">
        <SidebarContent
          navItems={navItems}
          nome={nome}
          empresaNome={empresaNome}
          onSignOut={onSignOut}
          pathname={pathname}
        />
      </aside>
    </>
  );
}
