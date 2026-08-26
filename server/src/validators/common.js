const { param, query, body } = require('express-validator');

const mongoId = (name = 'id') =>
  param(name).isUUID().withMessage(`Invalid ${name}`);

const pagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const trimmed = (field, min = 1, max = 200) =>
  body(field).trim().isLength({ min, max }).withMessage(`${field} must be ${min}-${max} characters`);

module.exports = { mongoId, pagination, trimmed };
