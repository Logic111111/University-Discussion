import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import katex from 'katex';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: string;
  children: ReactNode;
}

/** Dialog shell: portal to <body>, Esc and backdrop close, scroll lock, focus return. */
export function Modal({ open, onClose, title, width = 'max-w-lg', children }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    if (!panel.current?.contains(document.activeElement)) panel.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/45 p-4 pt-[8vh] backdrop-blur-[2px]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`modal-panel flex max-h-[86vh] w-full ${width} flex-col overflow-hidden rounded-[4px] border border-ink bg-paper shadow-[0_24px_60px_-20px_rgba(22,33,43,0.55)] focus:outline-none`}
      >
        {title && (
          <header className="no-print flex items-center justify-between gap-4 border-b border-ink-rule px-5 py-3">
            <h2 className="font-serif text-[21px] font-semibold">{title}</h2>
            <button onClick={onClose} aria-label="Close" className="btn btn-quiet btn-icon -mr-2">
              <X className="h-[18px] w-[18px]" />
            </button>
          </header>
        )}
        <div className="modal-scroll overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}

interface SegmentedProps<T extends string> {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  tone?: 'paper' | 'scope';
}

export function Segmented<T extends string>({ options, value, onChange, label, tone = 'paper' }: SegmentedProps<T>) {
  const scope = tone === 'scope';
  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex rounded-[4px] border p-0.5 ${scope ? 'border-scope-line bg-scope-bg' : 'border-ink-rule bg-paper-deep/60'}`}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={`inline-flex h-7 items-center gap-1.5 rounded-[3px] px-2.5 text-[14px] font-medium transition-colors ${
            scope
              ? o.value === value ? 'bg-scope-line text-white' : 'text-scope-dim hover:text-scope-text'
              : o.value === value ? 'bg-paper text-ink shadow-[0_0_0_1px] shadow-ink-rule' : 'text-ink-3 hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** KaTeX output; trust stays off, so \href and raw HTML commands are rejected. */
export function Tex({ tex, display = false, className = '' }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, { throwOnError: false, displayMode: display });
    } catch {
      return null;
    }
  }, [tex, display]);
  if (html === null) return <code className={className}>{tex}</code>;
  return (
    <span
      className={`${display ? 'block overflow-x-auto overflow-y-hidden py-1' : ''} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export const Avatar = ({ name, size = 36 }: { name: string; size?: number }) => (
  <span
    aria-hidden
    className="inline-flex shrink-0 items-center justify-center rounded-full border border-ink-rule bg-paper-deep font-semibold text-ink-2"
    style={{ width: size, height: size, fontSize: size * 0.38 }}
  >
    {name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')}
  </span>
);

export const EmptyState = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div className="rounded-[4px] border border-dashed border-ink-rule px-6 py-14 text-center">
    <p className="font-serif text-[22px]">{title}</p>
    {children && <div className="mt-3 text-ink-2">{children}</div>}
  </div>
);
