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

const toObjectId = (id) => {
  const mongoose = require('mongoose');
  if (!id) return id;
  if (id instanceof mongoose.Types.ObjectId) return id;
  return new mongoose.Types.ObjectId(id);
};

module.exports = { pick, escapeRegex, toObjectId };
