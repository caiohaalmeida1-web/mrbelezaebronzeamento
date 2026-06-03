import { Instagram, ShieldCheck, Sun } from "lucide-react";

export function SocialProofBar() {
  const items = [
    {
      icon: Instagram,
      number: "13,5K",
      label: "Seguidoras",
    },
    {
      icon: ShieldCheck,
      number: "100%",
      label: "Anvisa aprovado",
    },
    {
      icon: Sun,
      number: "7–10",
      label: "Dias de bronze",
    },
  ];

  return (
    <section
      aria-label="Prova social"
      className="bg-brand-brown py-7 text-brand-sun"
    >
      <div className="container-page grid grid-cols-3 gap-6 text-center">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex flex-col items-center justify-center gap-1.5 sm:flex-row sm:gap-3"
          >
            <it.icon className="h-5 w-5 text-brand-sun/80 sm:h-6 sm:w-6" />
            <div className="leading-tight">
              <div className="font-display text-2xl font-semibold sm:text-3xl">
                {it.number}
              </div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-brand-sun/70 sm:text-xs">
                {it.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
