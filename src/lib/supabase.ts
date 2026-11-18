import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

/**
 * Mode demo dipakai saat kredensial belum diisi (atau VITE_DEMO_MODE=true).
 * Seluruh data contoh berjalan di browser dan TIDAK dikirim ke server mana pun.
 */
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !url || !anonKey;

/**
 * Hanya VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY yang pernah dibaca frontend.
 * SUPABASE_SERVICE_ROLE_KEY tidak boleh muncul di source code / environment Vite.
 */
export const supabase = createClient<Database>(
  url || 'http://127.0.0.1:54321',
  anonKey || 'demo-anon-key-not-used',
  {
    auth: {
      persistSession: !isDemoMode,
      autoRefreshToken: !isDemoMode,
      detectSessionInUrl: !isDemoMode,
    },
  },
);
