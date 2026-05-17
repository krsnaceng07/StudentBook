import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
} else {
  console.log('Supabase Config Loaded:', { 
    url: supabaseUrl, 
    keyLength: supabaseServiceKey.length,
    isServiceRole: supabaseServiceKey.includes('service_role')
  });
}

// @ts-ignore
globalThis.WebSocket = ws;

// In the backend, we typically use the service role key to bypass RLS for administrative tasks
// or we can instantiate a client dynamically per user request. 
// This is the global admin client.
export const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      Authorization: `Bearer ${supabaseServiceKey}`
    }
  }
});
