const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const ws = require('ws');
global.WebSocket = ws;

// In the backend, we typically use the service role key to bypass RLS for administrative tasks
// or we can instantiate a client dynamically per user request. 
// This is the global admin client.
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    WebSocket: ws
  }
});

module.exports = { supabaseAdmin };
