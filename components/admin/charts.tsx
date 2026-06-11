import { cn } from "@/lib/utils";

interface ItemBarra {
  label: string;
  value: number;
  /** Texto extra exibido junto ao valor (ex: "3 sessões"). */
  hint?: string;
  destaque?: boolean;
}

/**
 * Gráfico de barras verticais em CSS puro (sem lib de chart).
 * Server Component — renderiza estático.
 */
export function BarrasVerticais({
  data,
  formatValue = (v) => String(v),
  altura = 160,
}: {
  data: ItemBarra[];
  formatValue?: (v: number) => string;
  altura?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="overflow-x-auto">
      <div
        className="flex min-w-[480px] items-end gap-1.5"
        style={{ height: altura }}
        role="img"
        aria-label="Gráfico de barras"
      >
        {data.map((d, i) => {
          const pct = Math.round((d.value / max) * 100);
          return (
            <div
              key={`${d.label}-${i}`}
              className="group relative flex h-full flex-1 flex-col items-center justify-end"
              title={`${d.label}: ${formatValue(d.value)}`}
            >
              <div
                className={cn(
                  "w-full rounded-t-md transition-colors",
                  d.destaque
                    ? "bg-brand-amber"
                    : d.value > 0
                      ? "bg-brand-gold/50 group-hover:bg-brand-amber/80"
                      : "bg-brand-gold/15"
                )}
                style={{ height: `${Math.max(pct, d.value > 0 ? 4 : 2)}%` }}
              />
              <span className="mt-1.5 text-[10px] leading-none text-brand-caramel/70">
                {d.label}
              </span>
              <span className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-brand-brown px-2 py-1 text-[10px] font-semibold text-brand-cream opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {formatValue(d.value)}
                {d.hint ? ` · ${d.hint}` : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Barras horizontais com percentual — bom para ranking (ex: receita por serviço). */
export function BarrasHorizontais({
  data,
  formatValue = (v) => String(v),
}: {
  data: ItemBarra[];
  formatValue?: (v: number) => string;
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <ul className="space-y-3">
      {data.map((d, i) => {
        const pctTotal = Math.round((d.value / total) * 100);
        const pctBarra = Math.round((d.value / max) * 100);
        return (
          <li key={`${d.label}-${i}`}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-brand-brown">{d.label}</span>
              <span className="whitespace-nowrap text-brand-caramel">
                {formatValue(d.value)}
                <span className="ml-1.5 text-xs text-brand-caramel/60">
                  {pctTotal}%
                </span>
              </span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-brand-gold/15">
              <div
                className="h-full rounded-full bg-amber-gradient"
                style={{ width: `${Math.max(pctBarra, 2)}%` }}
              />
            </div>
            {d.hint && (
              <p className="mt-0.5 text-xs text-brand-caramel/60">{d.hint}</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
