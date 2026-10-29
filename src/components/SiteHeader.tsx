import { Plus, Search } from 'lucide-react';
import { Route } from '../types';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent);

export function SiteHeader({ route, onSearch, onNew }: { route: Route; onSearch: () => void; onNew: () => void }) {
  const section = route.view === 'reader' ? 'library' : route.view;
  const links = [
    { view: 'library', label: 'Library', href: '#/library' },
    { view: 'studio', label: 'Studio', href: '#/studio' },
    { view: 'campus', label: 'Campus', href: '#/campus' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink bg-paper/95 backdrop-blur print:hidden">
      <div className="mx-auto flex h-14 max-w-[80rem] items-center gap-5 px-4 sm:gap-8 sm:px-6">
        <a href="#/library" className="flex items-center gap-2 text-[19px] font-semibold tracking-tight" aria-label="Nexus Eng home">
          <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" aria-hidden>
            <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 1v6M12 17v6M1 12h6M17 12h6" stroke="#E2500C" strokeWidth="2" />
          </svg>
          <span className="hidden sm:inline">Nexus Eng</span>
        </a>

        <nav aria-label="Main" className="flex h-full items-stretch gap-4 sm:gap-6">
          {links.map((l) => (
            <a
              key={l.view}
              href={l.href}
              aria-current={section === l.view ? 'page' : undefined}
              className="relative flex items-center text-[16px] font-medium text-ink-2 hover:text-ink aria-[current=page]:text-ink aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-0 aria-[current=page]:after:-bottom-px aria-[current=page]:after:h-[3px] aria-[current=page]:after:bg-accent aria-[current=page]:after:content-['']"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button className="btn btn-outline btn-sm" onClick={onSearch} aria-label="Search and commands">
            <Search className="h-4 w-4" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden rounded-[3px] border font-sans border-ink-rule px-1 text-[12px] text-ink-3 md:inline">{isMac ? 'Cmd K' : 'Ctrl K'}</kbd>
          </button>
          <button className="btn btn-primary btn-sm" onClick={onNew} aria-label="New article">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New article</span>
          </button>
        </div>
      </div>
    </header>
  );
}
