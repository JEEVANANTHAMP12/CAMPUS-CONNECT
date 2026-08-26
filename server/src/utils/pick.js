const pick = (obj, keys) => {
  const out = {};
  if (!obj) return out;
  keys.forEach((key) => {
    if (obj[key] !== undefined) out[key] = obj[key];
  });
  return out;
};

const escapeRegex = (value = '') =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toObjectId = (id) => id;

module.exports = { pick, escapeRegex, toObjectId };
