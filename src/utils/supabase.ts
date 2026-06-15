import { createClient } from '@supabase/supabase-js';

// Obtém os valores de ambiente
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kdmwmepemaihrkhogygd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_goWiOSU_3MbmT17TphPciQ_llLJ1xHj';

// 1. Causa Raiz: Se a URL antiga do Supabase (ycaglrqzuxjvauncdnrz) estiver em cache ou configurada, nós a substituímos
if (supabaseUrl.includes('ycaglrqzuxjvauncdnrz')) {
  console.warn('[Supabase] Corrigindo URL antiga detectada em cache/configuração.');
  supabaseUrl = supabaseUrl.replace('ycaglrqzuxjvauncdnrz', 'kdmwmepemaihrkhogygd');
}

// 2. Causa Raiz: Evita concatenação incorreta (/rest/v1) removendo o sufixo da API REST
// Se a URL termina com /rest/v1 ou com /rest/v1/, nós limpamos para garantir que o Supabase SDK
// configure corretamente o endpoint de autenticação em /auth/v1
supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

// Garante que o Supabase Auth utilize a rota correta baseada na URL limpa
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
