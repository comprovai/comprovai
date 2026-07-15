"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
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

export function Sidebar({ navItems, nome, empresaNome, onSignOut }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col justify-between bg-brand text-white">
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

      <form action={onSignOut} className="border-t border-white/10 p-5">
        <button
          type="submit"
          className="flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sair
        </button>
      </form>
    </aside>
  );
}
