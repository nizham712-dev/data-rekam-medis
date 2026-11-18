import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, Stethoscope, Users, UserRound } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Brand, clinicLabel } from '@/components/layout/Brand';
import { Button } from '@/components/ui/Button';
import { Field, inputClass } from '@/components/ui/Field';
import { InlineNotice } from '@/components/ui/States';
import { cn } from '@/lib/cn';
import { loginSchema, type LoginFormValues } from '@/utils/schemas';
import { ROLE_LABELS } from '@/utils/constants';
import type { UserRole } from '@/types';

const demoRoles: { role: UserRole; icon: typeof UserRound; description: string }[] = [
  { role: 'admin', icon: Users, description: 'Kelola pengguna & master data' },
  { role: 'dokter', icon: Stethoscope, description: 'Isi catatan SOAP & resep' },
  { role: 'perawat', icon: UserRound, description: 'Daftarkan pasien & atur antrean' },
];

export function LoginPage() {
  const { signIn, loginAsDemo, isDemoMode, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError('');
    setPending(true);
    try {
      await signIn(values.email, values.password);
      navigate(redirectTo, { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Gagal masuk. Silakan coba lagi.');
    } finally {
      setPending(false);
    }
  };

  const handleDemo = (role: UserRole) => {
    loginAsDemo(role);
    navigate(redirectTo, { replace: true });
  };

  if (!isDemoMode && user) return <Navigate to={redirectTo} replace />;

  return (
    <div className="flex min-h-screen bg-frame font-sans text-ink">
      <div className="hidden w-[46%] flex-col justify-between bg-frame px-10 py-10 lg:flex">
        <Brand />
        <div className="max-w-md">
          <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.02em] text-ink">
            Rekam medis yang rapi, keputusan yang lebih cepat.
          </h1>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            satu tempat untuk pendaftaran pasien, antrean kunjungan, catatan SOAP, diagnosis, dan resep —
            dengan hak akses yang jelas untuk setiap peran.
          </p>
        </div>
        <div className="flex items-center gap-2 text-small text-muted">
          <LockKeyhole className="h-4 w-4 text-accent" aria-hidden="true" />
          Data pasien dilindungi dengan autentikasi dan Row Level Security.
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-surface px-5 py-10">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden">
            <Brand />
          </div>
          <h2 className="mt-8 text-title text-ink lg:mt-0">Masuk ke RekamMedis</h2>
          <p className="mt-1.5 text-body text-muted">{clinicLabel()} · Area staf klinik</p>

          {isDemoMode ? (
            <div className="mt-8">
              <InlineNotice tone="info">
                Mode demo aktif. Pilih peran untuk menjelajahi aplikasi dengan data contoh.
              </InlineNotice>
              <div className="mt-4 flex flex-col gap-2">
                {demoRoles.map(({ role, icon: Icon, description }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleDemo(role)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 text-left',
                      'transition-colors hover:border-accent hover:bg-accent-soft',
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-active text-ink">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-body font-medium text-ink">{ROLE_LABELS[role]}</span>
                      <span className="block text-small text-muted">{description}</span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-5 text-small text-faint">
                Untuk memakai data sungguhan, isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY lalu jalankan
                migrasi SQL.
              </p>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4" noValidate>
              {error && <InlineNotice tone="error">{error}</InlineNotice>}
              <Field
                label="Email"
                htmlFor="email"
                required
                error={form.formState.errors.email?.message}
              >
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  className={inputClass}
                  {...form.register('email')}
                />
              </Field>
              <Field
                label="Kata sandi"
                htmlFor="password"
                required
                error={form.formState.errors.password?.message}
              >
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={inputClass}
                  {...form.register('password')}
                />
              </Field>
              <Button type="submit" variant="primary" isLoading={pending} className="mt-2 w-full">
                Masuk
              </Button>
              <p className="text-small text-faint">
                Akun dibuat oleh admin melalui Supabase Authentication.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
