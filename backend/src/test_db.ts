import { supabaseAdmin } from './config/supabase.js';

async function test() {
  try {
    console.log('--- Columns Nullability & Defaults Diagnostics ---');
    
    // We can query information_schema via RPC or we can try to insert a profile directly to see if role can be omitted.
    const mockId = '11111111-1111-1111-1111-111111111111';
    
    console.log('Test 1: Inserting profile without role...');
    const { data: data1, error: err1 } = await supabaseAdmin
      .from('profiles')
      .insert([{ id: mockId, name: 'Test No Role', email: 'norole@example.com' }])
      .select();
    console.log('Result 1 (omit role):', { data: data1, error: err1 });

    if (err1) {
      console.log('Omit role error details:', JSON.stringify(err1, null, 2));
    } else {
      await supabaseAdmin.from('profiles').delete().eq('id', mockId);
    }

  } catch (err) {
    console.error('Diagnostic crashed:', err);
  }
}

test();
