import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function applySql() {
  const sqlPath = path.join(process.cwd(), 'supabase/migrations/20240516_init_v2.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('Applying migration SQL...');
  
  // Split SQL by statements (simplified)
  // Note: This is a bit risky but good for dev
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
      if (error) {
         // Fallback: try using .raw() if available or just log
         console.error('Error in statement:', statement.substring(0, 50), '...');
         console.error(error.message);
      }
    } catch (e) {
      console.error('Failed to execute statement:', statement.substring(0, 50));
    }
  }

  console.log('Migration applied (check errors above)');
}

applySql();
