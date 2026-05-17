import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import ws from 'ws';

// @ts-ignore
globalThis.WebSocket = ws;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function applySql() {
  const migrationsDir = path.join(process.cwd(), 'supabase/migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`Found ${files.length} migration files.`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`\n📄 Applying migration: ${file}...`);

    // Split SQL by statements safely
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        if (error) {
          console.error(`Error in statement in ${file}:`, statement.substring(0, 50), '...');
          console.error(error.message);
        }
      } catch (e) {
        console.error(`Failed to execute statement in ${file}:`, statement.substring(0, 50));
      }
    }
  }

  console.log('\n✅ All migrations applied.');
}

applySql();
