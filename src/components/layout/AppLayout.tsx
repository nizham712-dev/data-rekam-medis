import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/patients': 'Data Pasien',
  '/records': 'Antrean & Rekam Medis',
  '/users': 'Pengguna',
  '/medicines': 'Data Obat',
  '/profile': 'Profil Saya',
};

function currentTitle(pathname: string): string {
  if (pathname.startsWith('/patients/')) return 'Detail Pasien';
  if (pathname.startsWith('/records/')) return 'Catatan Kunjungan';
  return TITLES[pathname] ?? 'RekamMedis';
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-frame font-sans text-ink">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setMobileOpen(true)} title={currentTitle(pathname)} />
        <main className="min-h-0 flex-1 overflow-y-auto p-0 sm:mb-2 sm:mr-2 sm:rounded-sheet sm:border sm:border-line sm:bg-surface">
          <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
