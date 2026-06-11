/** Limites compartilhados para upload de imagens no admin. */
export const MAX_IMAGEM_MB = 10;

export const TIPOS_IMAGEM = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const EXTENSOES_IMAGEM = ["jpg", "jpeg", "png", "webp"] as const;

export function tamanhoImagemValido(bytes: number): boolean {
  return bytes > 0 && bytes <= MAX_IMAGEM_MB * 1024 * 1024;
}

export function tipoImagemValido(
  mime: string,
  nomeArquivo: string
): boolean {
  if (TIPOS_IMAGEM.includes(mime as (typeof TIPOS_IMAGEM)[number])) {
    return true;
  }
  const ext = nomeArquivo.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSOES_IMAGEM.includes(ext as (typeof EXTENSOES_IMAGEM)[number]);
}

export function extensaoImagem(nomeArquivo: string, mime: string): string {
  const ext = nomeArquivo.split(".").pop()?.toLowerCase();
  if (ext && EXTENSOES_IMAGEM.includes(ext as (typeof EXTENSOES_IMAGEM)[number])) {
    return ext === "jpeg" ? "jpg" : ext;
  }
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return "jpg";
}
