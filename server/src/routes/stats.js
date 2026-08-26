const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { supabase } = require('../config/db');

const count = async (table, filters = {}) => {
  let query = supabase.from(table).select('*', { count: 'exact', head: true });
  Object.entries(filters).forEach(([k, v]) => { query = query.eq(k, v); });
  const { count: c, error } = await query;
  if (error) throw error;
  return c || 0;
};

router.get('/', protect, async (req, res) => {
  try {
    const [totalUsers, totalClubs, totalEvents, totalJobs] = await Promise.all([
      count('users'),
      count('clubs', { is_active: true }),
      count('events'),
      count('jobs'),
    ]);
    res.status(200).json({ success: true, data: { totalUsers, totalClubs, totalEvents, totalJobs } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
