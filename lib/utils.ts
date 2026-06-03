import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function whatsappLink(message?: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP || "5561982344399";
  const text = message
    ? `?text=${encodeURIComponent(message)}`
    : "";
  return `https://wa.me/${phone}${text}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDateBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateTimeBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export const SITE_CONFIG = {
  name: "Mércia Regina · Beleza e Bronzeamento",
  shortName: "Mércia Regina",
  slogan: "Na primeira sessão você vicia",
  tagline: "O bronze perfeito que eleva sua autoestima em 1 hora.",
  description:
    "Especialista em bronzeamento natural e a jato em Vicente Pires, DF. Agende online 24h. Produtos aprovados pela Anvisa. Bronze que dura 7 a 10 dias.",
  city: "Vicente Pires",
  state: "DF",
  address: "Vicente Pires, Colônia Agrícola — DF",
  phone: "+55 (61) 98234-4399",
  whatsapp: "5561982344399",
  instagram: "@mrbelezaebronzeamento",
  instagramUrl: "https://instagram.com/mrbelezaebronzeamento",
  email: "contato@merciaregina.com.br",
  url:
    process.env.NEXT_PUBLIC_SITE_URL || "https://merciaregina.com.br",
} as const;
