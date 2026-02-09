import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kdmwmepemaihrkhogygd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_goWiOSU_3MbmT17TphPciQ_llLJ1xHj';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
