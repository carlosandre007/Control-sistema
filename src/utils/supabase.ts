import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kdmwmepemaihrkhogygd.supabase.co';
const supabaseAnonKey = 'sb_publishable_goWiOSU_3MbmT17TphPciQ_llLJ1xHj';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
