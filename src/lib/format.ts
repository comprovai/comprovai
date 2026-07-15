export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string | Date): string {
  // Datas "puras" (YYYY-MM-DD, sem horário) vindas do Postgres não devem
  // passar por new Date() diretamente: ele interpreta como UTC meia-noite,
  // e formatar num fuso atrás de UTC (ex: America/Sao_Paulo) mostra o dia
  // anterior. Construímos a data a partir dos componentes locais em vez disso.
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(year, month - 1, day));
  }

  const parsed = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}
