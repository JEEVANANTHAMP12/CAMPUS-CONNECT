const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');
const env = require('./env');

const supabaseUrl = String(env.supabaseUrl || '').trim();
const supabaseKey = String(env.supabaseServiceRoleKey || '').trim();

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function decodeJwtProjectRef(token) {
  try {
    const payload = token.split('.')[1];
    const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const data = JSON.parse(json);
    return { role: data.role, ref: data.ref, iss: data.iss, projectRefFromIss: data.iss ? data.iss.split('/').pop() : undefined };
  } catch (e) {
    return { error: e.message };
  }
}

const connectDB = async () => {
  try {
    const jwtInfo = decodeJwtProjectRef(supabaseKey);
    const urlRef = (() => { try { return new URL(supabaseUrl).hostname.split('.')[0]; } catch { return 'invalid-url'; } })();
    logger.info(`Testing Supabase connection to ${supabaseUrl} (key prefix: ${supabaseKey.slice(0, 12)}..., len=${supabaseKey.length}, jwtRole=${jwtInfo.role}, jwtRef=${jwtInfo.ref || jwtInfo.projectRefFromIss}, urlRef=${urlRef})`);
    if (jwtInfo.role !== 'service_role') {
      logger.error(`SUPABASE_SERVICE_ROLE_KEY has role="${jwtInfo.role}" expected "service_role" - you are likely using anon key`);
    }
    if (jwtInfo.ref && urlRef !== jwtInfo.ref && jwtInfo.projectRefFromIss && urlRef !== jwtInfo.projectRefFromIss) {
      logger.error(`Project ref mismatch: URL ref="${urlRef}" vs JWT ref="${jwtInfo.ref || jwtInfo.projectRefFromIss}" - URL and key are from different Supabase projects`);
    }

    // Direct fetch diagnostic (bypasses supabase-js)
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const resp = await fetch(`${supabaseUrl}/rest/v1/users?select=id&limit=1`, {
        method: 'GET',
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
        signal: ctrl.signal,
      });
      const bodyText = await resp.text();
      clearTimeout(t);
      logger.info(`Direct fetch diagnostic: status=${resp.status} ${resp.statusText}, body=${bodyText.slice(0, 500)}`);
      if (!resp.ok) {
        // Provide raw PostgREST error without supabase-js wrapping
        logger.error(`PostgREST direct fetch failed: ${resp.status} ${bodyText.slice(0, 500)}`);
      }
    } catch (fetchErr) {
      logger.error(`Direct fetch exception: ${fetchErr.message}`, { stack: fetchErr.stack, cause: fetchErr.cause ? String(fetchErr.cause) : undefined });
    }

    // Try supabase-js simple query without head/count first
    const resultSimple = await supabase.from('users').select('id').limit(1);
    logger.info(`Supabase simple query result: ${JSON.stringify({ status: resultSimple.status, statusText: resultSimple.statusText, error: resultSimple.error, count: resultSimple.count, dataLength: resultSimple.data?.length })}`);
    if (resultSimple.error) {
      // Log full result before throwing
      logger.error(`Supabase simple query error object: ${JSON.stringify(resultSimple.error, Object.getOwnPropertyNames(resultSimple.error))}`, { rawResult: resultSimple });
      throw resultSimple.error;
    }

    // Original head query
    const result = await supabase.from('users').select('id', { head: true, count: 'exact' }).limit(1);
    logger.info(`Supabase head query result: ${JSON.stringify({ status: result.status, statusText: result.statusText, error: result.error, count: result.count })}`);
    if (result.error) throw result.error;
    logger.info(`Supabase Postgres connected (status: ${result.status} ${result.statusText || ''})`.trim());
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
