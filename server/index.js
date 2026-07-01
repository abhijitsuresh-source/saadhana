const express = require('express');
const cors = require('cors');
const { computeDailyPanchang } = require('./panchang');

const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGIN || '*').split(',').map(s => s.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // non-browser requests (curl, health checks)
    if (allowedOrigins.includes('*')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // allow any Vercel preview deployment for this project
    if (/\.vercel\.app$/.test(new URL(origin).hostname)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

// GET /api/panchang/daily?date=2026-07-01&lat=16.83&lon=75.71&ayanamsa=lahiri
app.get('/api/panchang/daily', (req, res) => {
  try {
    const { date, lat, lon, ayanamsa } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });

    const targetDate = date ? new Date(date + 'T00:00:00Z') : new Date();
    const result = computeDailyPanchang({
      date: targetDate,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      ayanamsa: ayanamsa || 'lahiri'
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/panchang/weekly?date=2026-07-01&lat=..&lon=..
app.get('/api/panchang/weekly', (req, res) => {
  try {
    const { date, lat, lon, ayanamsa } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });
    const start = date ? new Date(date + 'T00:00:00Z') : new Date();
    // align to Monday
    const day = start.getUTCDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(start.getTime() + diffToMonday * 86400000);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getTime() + i * 86400000);
      days.push(computeDailyPanchang({ date: d, lat: parseFloat(lat), lon: parseFloat(lon), ayanamsa: ayanamsa || 'lahiri' }));
    }
    res.json({ days });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/panchang/monthly?year=2026&month=7&lat=..&lon=..
app.get('/api/panchang/monthly', (req, res) => {
  try {
    const { year, month, lat, lon, ayanamsa } = req.query;
    if (!lat || !lon || !year || !month) return res.status(400).json({ error: 'year, month, lat, lon required' });
    const y = parseInt(year), m = parseInt(month); // m is 1-indexed
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();

    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(Date.UTC(y, m - 1, d));
      days.push(computeDailyPanchang({ date, lat: parseFloat(lat), lon: parseFloat(lon), ayanamsa: ayanamsa || 'lahiri' }));
    }
    res.json({ year: y, month: m, days });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Sadhana panchang API running on :${PORT}`));

module.exports = app;
