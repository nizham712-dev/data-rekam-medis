import { NavLink } from 'react-router-dom';
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Pill,
  Users,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { ROLE_LABELS } from '@/utils/constants';
import { cn } from '@/lib/cn';
import { initials } from '@/utils/formatters';
import { Brand } from './Brand';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile(): void;
}

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex h-9 items-center gap-3 rounded-control px-3 text-body transition-colors',
    isActive ? 'bg-active font-medium text-ink' : 'text-muted hover:bg-active/60 hover:text-ink',
  );

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { user, isDemoMode, signOut } = useAuth();
  const isAdmin = user?.role === 'admin';

  const content = (
    <div className="flex h-full flex-col bg-frame px-3 py-4">
      <div className="flex items-center justify-between px-1 pb-6">
        <Brand />
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Tutup menu"
          className="rounded-control p-1.5 text-muted hover:bg-active lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-5" aria-label="Navigasi utama">
        <div>
          <p className="px-3 pb-2 text-small text-muted">Utama</p>
          <div className="flex flex-col gap-0.5">
            <NavLink to="/dashboard" className={navClass} onClick={onCloseMobile}>
              <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
              Dashboard
            </NavLink>
            <NavLink to="/patients" className={navClass} onClick={onCloseMobile}>
              <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
              Pasien
            </NavLink>
            <NavLink to="/records" className={navClass} onClick={onCloseMobile}>
              <ClipboardList className="h-4 w-4 shrink-0" aria-hidden="true" />
              Antrean & Rekam Medis
            </NavLink>
          </div>
        </div>

        {isAdmin && (
          <div>
            <p className="px-3 pb-2 text-small text-muted">Manajemen</p>
            <div className="flex flex-col gap-0.5">
              <NavLink to="/users" className={navClass} onClick={onCloseMobile}>
                <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
                Pengguna
              </NavLink>
              <NavLink to="/medicines" className={navClass} onClick={onCloseMobile}>
                <Pill className="h-4 w-4 shrink-0" aria-hidden="true" />
                Data Obat
              </NavLink>
            </div>
          </div>
        )}
      </nav>

      <div className="mt-auto border-t border-active pt-3">
        <NavLink
          to="/profile"
          className={({ isActive }) => cn(navClass({ isActive }), 'mb-1')}
          onClick={onCloseMobile}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-active text-[11px] font-medium text-ink">
            {user ? initials(user.fullName) : '—'}
          </span>
          <span className="min-w-0 flex-1 truncate">{user?.fullName ?? 'Profil'}</span>
        </NavLink>
        <p className="px-3 pb-2 text-small text-muted">
          {user ? ROLE_LABELS[user.role] : ''}
          {isDemoMode && ' · Demo'}
        </p>
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex h-9 w-full items-center gap-3 rounded-control px-3 text-body text-muted transition-colors hover:bg-active hover:text-ink"
        >
          <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
          Keluar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[228px] shrink-0 border-r border-frame lg:block">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={onCloseMobile}
            className="absolute inset-0 bg-slate-900/30"
          />
          <aside className="absolute inset-y-0 left-0 w-[260px] max-w-[80vw] border-r border-line bg-frame shadow-float">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
