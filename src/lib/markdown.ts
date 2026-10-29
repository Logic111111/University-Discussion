// Small markdown subset for engineering articles. Produces plain data so the
// renderer can build React elements without ever injecting user HTML.

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'strong'; c: Inline[] }
  | { t: 'em'; c: Inline[] }
  | { t: 'code'; v: string }
  | { t: 'math'; v: string }
  | { t: 'link'; c: Inline[]; href: string };

export type Block =
  | { t: 'heading'; level: 1 | 2 | 3 | 4; text: string }
  | { t: 'p'; text: string }
  | { t: 'hr' }
  | { t: 'code'; lang: string; code: string }
  | { t: 'list'; ordered: boolean; items: string[] }
  | { t: 'quote'; text: string }
  | { t: 'math'; tex: string }
  | { t: 'widget'; name: string; props: Record<string, string | number> };

const HEADING = /^(#{1,4})\s+(.*)$/;
const HR = /^(-{3,}|\*{3,})$/;
const UL = /^[-*]\s+/;
const OL = /^\d+\.\s+/;
const WIDGET = /^<([A-Z][A-Za-z]*)\b([^>]*?)\/?>$/;
const ATTR = /(\w+)=(?:"([^"]*)"|\{([^}]*)\})/g;

const startsBlock = (s: string) =>
  s.startsWith('```') || s.startsWith('$$') || s.startsWith('>') ||
  HEADING.test(s) || HR.test(s) || UL.test(s) || OL.test(s) || WIDGET.test(s);

export function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const out: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const s = lines[i].trim();
    if (!s) { i++; continue; }

    if (s.startsWith('```')) {
      const lang = s.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) code.push(lines[i++]);
      i++;
      out.push({ t: 'code', lang, code: code.join('\n') });
      continue;
    }

    if (s.startsWith('$$')) {
      const rest = s.slice(2);
      if (rest.length >= 2 && rest.endsWith('$$')) {
        out.push({ t: 'math', tex: rest.slice(0, -2).trim() });
        i++;
        continue;
      }
      const tex = [rest];
      i++;
      while (i < lines.length && !lines[i].trim().endsWith('$$')) tex.push(lines[i++]);
      if (i < lines.length) tex.push(lines[i].trim().slice(0, -2));
      i++;
      out.push({ t: 'math', tex: tex.join('\n').trim() });
      continue;
    }

    const widget = s.match(WIDGET);
    if (widget) {
      const props: Record<string, string | number> = {};
      for (const m of widget[2].matchAll(ATTR)) {
        const braced = m[3]?.trim();
        props[m[1]] = m[2] ?? (braced !== '' && !isNaN(Number(braced)) ? Number(braced) : braced);
      }
      out.push({ t: 'widget', name: widget[1], props });
      i++;
      continue;
    }

    const heading = s.match(HEADING);
    if (heading) {
      out.push({ t: 'heading', level: heading[1].length as 1 | 2 | 3 | 4, text: heading[2].trim() });
      i++;
      continue;
    }

    if (HR.test(s)) { out.push({ t: 'hr' }); i++; continue; }

    if (UL.test(s) || OL.test(s)) {
      const ordered = OL.test(s);
      const marker = ordered ? OL : UL;
      const items: string[] = [];
      while (i < lines.length && marker.test(lines[i].trim())) items.push(lines[i++].trim().replace(marker, ''));
      out.push({ t: 'list', ordered, items });
      continue;
    }

    if (s.startsWith('>')) {
      const text: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) text.push(lines[i++].trim().replace(/^>\s?/, ''));
      out.push({ t: 'quote', text: text.join(' ') });
      continue;
    }

    const para = [s];
    i++;
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i].trim())) para.push(lines[i++].trim());
    out.push({ t: 'p', text: para.join(' ') });
  }

  return out;
}

// Order matters: code and math win over emphasis so `a*b*` and $x_*$ stay literal.
const INLINE = /`([^`]+)`|\$([^$\s](?:[^$\n]*[^$\s])?)\$|\*\*(.+?)\*\*|\*([^*\s](?:[^*]*[^*\s])?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

const safeHref = (href: string) => (/^(https?:|mailto:|\/|#)/i.test(href) ? href : '#');

export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of src.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ t: 'text', v: src.slice(last, at) });
    if (m[1] !== undefined) out.push({ t: 'code', v: m[1] });
    else if (m[2] !== undefined) out.push({ t: 'math', v: m[2] });
    else if (m[3] !== undefined) out.push({ t: 'strong', c: parseInline(m[3]) });
    else if (m[4] !== undefined) out.push({ t: 'em', c: parseInline(m[4]) });
    else out.push({ t: 'link', c: parseInline(m[5]), href: safeHref(m[6]) });
    last = at + m[0].length;
  }
  if (last < src.length) out.push({ t: 'text', v: src.slice(last) });
  return out;
}

export const wordCount = (src: string) => src.trim().split(/\s+/).filter(Boolean).length;

/** Reading time at 220 wpm, plus one minute per interactive widget. */
export const readMinutes = (src: string) =>
  Math.max(1, Math.round(wordCount(src) / 220) + parseBlocks(src).filter((b) => b.t === 'widget').length);
