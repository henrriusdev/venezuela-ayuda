// Pure helpers for WhatsApp deep links and share URLs. No DOM / server deps so
// they're safe to import anywhere.

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function whatsappChatUrl(phoneDigits: string, text?: string): string {
  const base = `https://wa.me/${phoneDigits}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function siteUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://venezuelaayuda.com";
  return `${base}${path}`;
}
