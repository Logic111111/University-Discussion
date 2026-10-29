import { KeyboardEvent, useEffect, useState } from 'react';
import { CornerDownLeft, Search } from 'lucide-react';
import { Modal } from './ui';

export interface PaletteAction {
  id: string;
  group: string;
  label: string;
  run: () => void;
}

export function CommandPalette({ open, onClose, actions }: { open: boolean; onClose: () => void; actions: PaletteAction[] }) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (open) { setQuery(''); setIndex(0); }
  }, [open]);

  const q = query.trim().toLowerCase();
  const list = actions.filter((a) => `${a.group} ${a.label}`.toLowerCase().includes(q));
  const active = Math.min(index, Math.max(0, list.length - 1));

  useEffect(() => {
    document.getElementById(`cmd-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  // Close first so an action that opens another dialog is not immediately closed again.
  const run = (a: PaletteAction | undefined) => {
    if (!a) return;
    onClose();
    a.run();
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((active + 1) % Math.max(1, list.length)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((active - 1 + list.length) % Math.max(1, list.length)); }
    else if (e.key === 'Enter') { e.preventDefault(); run(list[active]); }
  };

  return (
    <Modal open={open} onClose={onClose} width="max-w-xl">
      <div className="flex items-center gap-3 border-b border-ink-rule px-4">
        <Search className="h-[18px] w-[18px] shrink-0 text-ink-3" aria-hidden />
        <input
          autoFocus
          role="combobox"
          aria-expanded="true"
          aria-controls="cmd-list"
          aria-activedescendant={list.length ? `cmd-${active}` : undefined}
          aria-label="Search commands and articles"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIndex(0); }}
          onKeyDown={onKey}
          placeholder="Search commands and articles"
          className="h-14 w-full bg-transparent text-[17px] placeholder:text-ink-3/70 focus:outline-none"
        />
      </div>
      <ul id="cmd-list" role="listbox" aria-label="Results" className="max-h-[22rem] overflow-y-auto p-2">
        {list.length === 0 && <li className="px-3 py-8 text-center text-ink-3">No commands or articles match "{query}".</li>}
        {list.map((a, i) => (
          <li key={a.id}>
            {(i === 0 || list[i - 1].group !== a.group) && (
              <div className="px-3 pb-1 pt-3 text-[13px] font-medium text-ink-3" role="presentation">{a.group}</div>
            )}
            <div
              id={`cmd-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setIndex(i)}
              onClick={() => run(a)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-[3px] px-3 py-2 text-[15.5px] ${i === active ? 'bg-ink text-paper' : 'text-ink'}`}
            >
              <span className="truncate">{a.label}</span>
              {i === active && <CornerDownLeft className="h-4 w-4 shrink-0 opacity-70" aria-hidden />}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-4 border-t border-ink-rule px-4 py-2 text-[13px] text-ink-3">
        <span>Up and down to move</span>
        <span>Enter to open</span>
        <span>Esc to close</span>
      </div>
    </Modal>
  );
}
