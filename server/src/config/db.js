const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');
const env = require('./env');

const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const connectDB = async () => {
  try {
    logger.info(`Testing Supabase connection to ${env.supabaseUrl} (key prefix: ${String(env.supabaseServiceRoleKey).slice(0, 8)}...)`);
    const { error, status, statusText } = await supabase.from('users').select('id', { head: true, count: 'exact' }).limit(1);
    if (error) throw error;
    logger.info(`Supabase Postgres connected (status: ${status} ${statusText || ''})`.trim());
    return supabase;
  } catch (err) {
    // supabase-js often returns {message:""} on fetch/network failure, so log all properties
    const detail =
      err?.message ||
      err?.details ||
      err?.hint ||
      err?.code ||
      (err?.cause && (err.cause.message || JSON.stringify(err.cause))) ||
      null;
    const fullMeta = {
      message: err?.message,
      details: err?.details,
      hint: err?.hint,
      code: err?.code,
      status: err?.status,
      statusText: err?.statusText,
      cause: err?.cause ? { message: err.cause.message, stack: err.cause.stack, cause: String(err.cause) } : undefined,
      stack: err?.stack,
      stringified: (() => {
        try {
          return JSON.stringify(err, Object.getOwnPropertyNames(err));
        } catch (_) {
          return String(err);
        }
      })(),
      raw: String(err),
    };
    const display = detail && detail !== '' ? detail : fullMeta.stringified || 'Unknown error';
    logger.error(`Supabase connection error: ${display}. Retrying in 5 seconds...`, fullMeta);
    // Also log URL diagnostics without leaking full key
    if (!env.supabaseUrl || !env.supabaseUrl.startsWith('https://')) {
      logger.error(`Invalid SUPABASE_URL: "${env.supabaseUrl}" - must be https://<project>.supabase.co`);
    }
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
module.exports.supabase = supabase;
