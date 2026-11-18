import { isDemoMode } from '@/lib/supabase';
import type { Api } from './contracts';
import { demoApi } from '@/lib/demo/api';
import { remoteApi } from './remote';

/** Satu titik akses data. UI tidak pernah memanggil Supabase secara langsung. */
export const api: Api = isDemoMode ? demoApi : remoteApi;
export type { Api } from './contracts';
