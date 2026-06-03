import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1, label: "Serviço" },
  { num: 2, label: "Data e horário" },
  { num: 3, label: "Seus dados" },
  { num: 4, label: "Pagamento" },
] as const;

export function ProgressBar({ current }: { current: number }) {
  return (
    <ol className="flex items-center justify-between gap-2 sm:gap-4">
      {STEPS.map((s, i) => {
        const done = current > s.num;
        const active = current === s.num;
        return (
          <li
            key={s.num}
            className="flex flex-1 items-center gap-2 sm:gap-3"
          >
            <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-3">
              <span
                className={cn(
                  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all",
                  done && "bg-brand-amber text-white",
                  active && "bg-brand-brown text-brand-sun ring-4 ring-brand-amber/25",
                  !done && !active && "bg-brand-warm text-brand-caramel"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : s.num}
              </span>
              <span
                className={cn(
                  "text-center text-[11px] font-semibold uppercase tracking-wider sm:text-xs",
                  active ? "text-brand-brown" : "text-brand-caramel/70"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "hidden h-px flex-1 transition-colors sm:block",
                  done ? "bg-brand-amber" : "bg-brand-gold/30"
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
