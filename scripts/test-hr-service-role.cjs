require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE;

if (!url || !serviceRole) {
  console.error('Missing SUPABASE_SERVICE_ROLE or VITE_SUPABASE_URL in env');
  process.exit(1);
}

const admin = createClient(url, serviceRole);
const publicClient = anonKey ? createClient(url, anonKey) : null;

(async () => {
  try {
    const email = `sr-hr-${Date.now()}@example.com`;
    const password = 'TestPass123!';
    console.log('Service role: creating auth user (admin) and hr_users row for', email);

    // Create auth user via admin API
    const { data: userData, error: createUserErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (createUserErr) throw createUserErr;
    console.log('Created auth user id:', userData.id);

    // Insert hr_users row
    const { data: insertedHr, error: insertErr } = await admin.from('hr_users').insert([{ email, password, verified: true }]).select().single();
    if (insertErr) throw insertErr;
    console.log('Inserted hr_users id:', insertedHr.id);

    // Verify the hr row explicitly (already inserted with verified true)
    const { data: updatedHr, error: updErr } = await admin.from('hr_users').update({ verified: true }).eq('id', insertedHr.id).select().single();
    if (updErr) throw updErr;
    console.log('HR row verified:', updatedHr.id);

    if (publicClient) {
      // Try sign-in via public client
      const { data: signInData, error: signInErr } = await publicClient.auth.signInWithPassword({ email, password });
      if (signInErr) {
        console.warn('Public sign-in failed:', signInErr.message || signInErr);
      } else {
        console.log('Public sign-in success, session present:', !!signInData.session);
      }
    } else {
      console.log('No anon key present; skipping public sign-in check. HR should be usable via admin client.');
    }

    console.log('Service-role test completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Service-role test error:', err);
    process.exit(1);
  }
})();
