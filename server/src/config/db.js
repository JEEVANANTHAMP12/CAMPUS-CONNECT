const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');
const env = require('./env');

const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const connectDB = async () => {
  try {
    const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' }).limit(1);
    if (error) throw error;
    logger.info('Supabase Postgres connected');
    return supabase;
  } catch (err) {
    logger.error(`Supabase connection error: ${err.message}. Retrying in 5 seconds...`);
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
module.exports.supabase = supabase;
