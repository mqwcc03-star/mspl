import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(url, key);

(async () => {
  try {
    const email = `ci-hr-${Date.now()}@example.com`;
    const password = 'TestPass123!';
    console.log('Skipping auth signup; inserting hr_users directly for demo test:', email);
    const newHr = { email, password, verified: false };
    const { data: insertedHr, error: insertError } = await supabase.from('hr_users').insert([newHr]).select().single();
    if (insertError) throw insertError;
    console.log('Inserted hr_users row id:', insertedHr.id);

    // Fetch the row to confirm
    const { data: fetched, error: fetchErr } = await supabase.from('hr_users').select('*').eq('email', email).single();
    if (fetchErr) throw fetchErr;
    console.log('Fetched hr_users:', fetched);

    // Simulate MD approve: update verified true
    const { error: approveErr } = await supabase.from('hr_users').update({ verified: true }).eq('id', fetched.id);
    if (approveErr) throw approveErr;
    console.log('HR approved in table');

    // Try sign-in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    console.log('Sign-in success, session:', !!signInData.session);

    process.exit(0);
  } catch (err) {
    console.error('Test flow error:', err);
    process.exit(1);
  }
})();
