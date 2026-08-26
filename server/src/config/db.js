const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');
const env = require('./env');

const supabaseUrl = String(env.supabaseUrl || '').trim();
const supabaseKey = String(env.supabaseServiceRoleKey || '').trim();

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const connectDB = async () => {
  try {
    const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' }).limit(1);
    if (error) throw error;
    logger.info('Supabase Postgres connected');
    return supabase;
  } catch (err) {
    const detail = err?.message || err?.details || err?.hint || err?.code || JSON.stringify(err) || 'Unknown error';
    logger.error(`Supabase connection error: ${detail}. Retrying in 5 seconds...`, {
      message: err?.message,
      hint: err?.hint,
      code: err?.code,
      details: err?.details,
    });
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
module.exports.supabase = supabase;
