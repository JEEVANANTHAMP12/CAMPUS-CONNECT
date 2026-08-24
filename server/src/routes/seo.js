const express = require('express');

const router = express.Router();

// GET /robots.txt
router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`# Robots.txt for MKCE Connect - M. Kumarasamy College of Engineering
User-agent: *
Allow: /
Allow: /clubs
Allow: /events
Allow: /jobs
Allow: /achievements
Allow: /discussions
Allow: /login
Allow: /register

Disallow: /admin
Disallow: /messages/
Disallow: /api/

Host: https://mkce.ac.in
Sitemap: https://mkce.ac.in/sitemap.xml
`);
});

// GET /sitemap.xml
router.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://mkce.ac.in/</loc><lastmod>2026-08-23</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://mkce.ac.in/clubs</loc><lastmod>2026-08-23</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://mkce.ac.in/events</loc><lastmod>2026-08-23</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://mkce.ac.in/jobs</loc><lastmod>2026-08-23</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://mkce.ac.in/achievements</loc><lastmod>2026-08-23</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>https://mkce.ac.in/discussions</loc><lastmod>2026-08-23</lastmod><changefreq>always</changefreq><priority>0.8</priority></url>
  <url><loc>https://mkce.ac.in/login</loc><lastmod>2026-08-23</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://mkce.ac.in/register</loc><lastmod>2026-08-23</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
</urlset>`);
});

module.exports = router;
