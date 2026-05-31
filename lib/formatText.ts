/** Remove common markdown so UI shows plain text only. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Drop self-intro lines; summary should start with substance. */
export function stripPrismOpener(text: string): string {
  const cleaned = stripMarkdown(text);
  const lines = cleaned.split("\n");
  const filtered = lines.filter((line) => {
    const t = line.trim().toLowerCase();
    if (!t) return true;
    if (/^hello,?\s/i.test(line) && /prism/i.test(line)) return false;
    if (/^hi,?\s/i.test(line) && /prism/i.test(line)) return false;
    if (/^i'?m\s+prism/i.test(t)) return false;
    if (/^my name is prism/i.test(t)) return false;
    if (/^hello,?\s/i.test(line) && /saathi/i.test(line)) return false;
    if (/^i'?m\s+saathi/i.test(t)) return false;
    return true;
  });
  return filtered.join("\n").trim();
}

/** @deprecated Use stripPrismOpener */
export const stripSaathiOpener = stripPrismOpener;

export function formatPlainParagraphs(text: string): string[] {
  return stripPrismOpener(text)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);
}
