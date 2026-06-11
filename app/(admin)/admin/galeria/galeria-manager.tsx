"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MAX_IMAGEM_MB } from "@/lib/upload-limits";
import { enviarImagemGaleria } from "@/lib/upload-imagem-admin";
import type { GaleriaFoto } from "@/types/database";
import { alternarFoto, excluirFoto, registrarFoto } from "./actions";

export function GaleriaManager({ fotos }: { fotos: GaleriaFoto[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setEnviando(true);
    setErro(null);

    try {
      for (const file of Array.from(files)) {
        const upload = await enviarImagemGaleria(file);
        if (!upload.ok) {
          setErro(`"${file.name}": ${upload.erro}`);
          continue;
        }

        const res = await registrarFoto({
          titulo: null,
          storagePath: upload.path,
        });
        if (!res.ok) {
          setErro(res.erro ?? `Erro ao registrar "${file.name}".`);
        }
      }
    } catch {
      setErro("Erro inesperado ao enviar as fotos.");
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
      startTransition(() => router.refresh());
    }
  }

  async function handleExcluir(id: string) {
    if (!confirm("Excluir esta foto definitivamente?")) return;
    setPendingId(id);
    await excluirFoto(id);
    setPendingId(null);
    startTransition(() => router.refresh());
  }

  async function handleAlternar(id: string, ativo: boolean) {
    setPendingId(id);
    await alternarFoto(id, ativo);
    setPendingId(null);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-8">
      <div className="card-brand p-6 sm:p-8">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-medium text-brand-brown">
              Enviar fotos
            </h2>
            <p className="mt-1 text-sm text-brand-caramel">
              JPG, PNG ou WebP até {MAX_IMAGEM_MB}MB. Você pode selecionar várias
              de uma vez — elas aparecem na galeria da página inicial.
            </p>
          </div>
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
            size="lg"
          >
            {enviando ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {enviando ? "Enviando..." : "Escolher fotos"}
          </Button>
        </div>
        {erro && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {erro}
          </p>
        )}
      </div>

      {fotos.length === 0 ? (
        <div className="card-brand p-10 text-center text-brand-caramel">
          Nenhuma foto enviada ainda. As fotos que você subir aqui aparecem na
          seção &quot;Marquinhas que encantam&quot; do site.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {fotos.map((f) => (
            <div
              key={f.id}
              className="card-brand group relative overflow-hidden"
            >
              <div className="relative aspect-square">
                <Image
                  src={f.imagem_url}
                  alt={f.titulo ?? "Foto da galeria"}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className={`object-cover ${f.ativo ? "" : "opacity-40 grayscale"}`}
                />
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <Badge variant={f.ativo ? "success" : "warm"}>
                  {f.ativo ? "Visível" : "Oculta"}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={f.ativo ? "Ocultar foto" : "Mostrar foto"}
                    disabled={pendingId === f.id}
                    onClick={() => handleAlternar(f.id, !f.ativo)}
                  >
                    {f.ativo ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir foto"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    disabled={pendingId === f.id}
                    onClick={() => handleExcluir(f.id)}
                  >
                    {pendingId === f.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
