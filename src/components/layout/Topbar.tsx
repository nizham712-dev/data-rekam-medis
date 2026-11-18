import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { ROLE_LABELS } from '@/utils/constants';
import { clinicLabel } from './Brand';

interface TopbarProps {
  onOpenMenu(): void;
  title: string;
}

export function Topbar({ onOpenMenu, title }: TopbarProps) {
  const { user, isDemoMode } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const term = search.trim();
    if (term) navigate(`/patients?q=${encodeURIComponent(term)}`);
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 bg-frame px-3 sm:px-4">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Buka menu"
        className="rounded-control p-1.5 text-muted hover:bg-active hover:text-ink lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <span className="hidden min-w-0 text-body text-muted lg:block">{clinicLabel()}</span>
      <span className="truncate text-body font-medium text-ink lg:hidden">{title}</span>

      <form onSubmit={submitSearch} className="ml-auto hidden w-[300px] md:block xl:w-[420px]" role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            aria-label="Cari pasien, No. RM, atau NIK"
            placeholder="Cari pasien, No. RM, atau NIK"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-8 w-full rounded-control border border-control/70 bg-white/70 pl-9 pr-12 text-small text-ink outline-none placeholder:text-faint focus:border-accent focus:bg-white"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] text-muted">⌘K</kbd>
        </div>
      </form>

      <div className="ml-auto flex items-center gap-2 md:ml-4">
        {isDemoMode && (
          <span className="hidden rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-900 sm:inline">
            Mode Demo
          </span>
        )}
        <span className="flex items-center gap-1.5 rounded border border-line bg-surface px-2 py-1 text-[11px] text-muted">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          {user ? ROLE_LABELS[user.role] : 'Tamu'}
        </span>
      </div>
    </header>
  );
}
