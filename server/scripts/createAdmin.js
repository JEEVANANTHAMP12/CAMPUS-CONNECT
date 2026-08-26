#!/usr/bin/env node
// Usage: node server/scripts/createAdmin.js --email admin@mkce.ac.in --password "Admin@123456" --name "MKCE Admin" --department "ADMIN"
// Or via env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => {
  if (cur.startsWith('--')) {
    const key = cur.slice(2);
    const val = arr[i+1] && !arr[i+1].startsWith('--') ? arr[i+1] : 'true';
    acc.push([key, val]);
  }
  return acc;
}, []));

const email = (args.email || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
const password = args.password || process.env.ADMIN_PASSWORD || '';
const name = args.name || process.env.ADMIN_NAME || 'MKCE Admin';
const department = args.department || process.env.ADMIN_DEPARTMENT || 'Administration';

if (!email || !password) {
  console.error('Usage: node server/scripts/createAdmin.js --email admin@mkce.ac.in --password "Admin@123456" [--name "MKCE Admin"]');
  process.exit(1);
}

const supabaseUrl = String(process.env.SUPABASE_URL || '').trim();
const supabaseKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}

(async () => {
  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

  // Check existing
  const { data: existing } = await supabase.from('users').select('id,email,role').eq('email', email).maybeSingle();
  if (existing) {
    console.log(`User ${email} exists with role ${existing.role}, promoting to admin...`);
    const { error } = await supabase.from('users').update({ role: 'admin', is_active: true }).eq('id', existing.id);
    if (error) throw error;
    console.log(`Promoted ${email} to admin (id=${existing.id})`);
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, rounds);
  const { data, error } = await supabase.from('users').insert({
    name, email, password: hash, role: 'admin', department, is_active: true
  }).select('id,email,role').single();
  if (error) {
    console.error('Insert failed:', error);
    process.exit(1);
  }
  console.log(`Admin created: ${data.email} (id=${data.id}, role=${data.role})`);
  console.log(`Login with: email=${email} password=<your password>`);
  process.exit(0);
})();
