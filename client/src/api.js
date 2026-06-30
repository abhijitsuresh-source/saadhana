const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export async function fetchDailyPanchang({ date, lat, lon, ayanamsa }) {
  const params = new URLSearchParams({ lat, lon, ayanamsa: ayanamsa || 'lahiri' });
  if (date) params.set('date', date);
  const res = await fetch(`${API_BASE}/api/panchang/daily?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch daily panchang');
  return res.json();
}

export async function fetchWeeklyPanchang({ date, lat, lon, ayanamsa }) {
  const params = new URLSearchParams({ lat, lon, ayanamsa: ayanamsa || 'lahiri' });
  if (date) params.set('date', date);
  const res = await fetch(`${API_BASE}/api/panchang/weekly?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch weekly panchang');
  return res.json();
}

export async function fetchMonthlyPanchang({ year, month, lat, lon, ayanamsa }) {
  const params = new URLSearchParams({ year, month, lat, lon, ayanamsa: ayanamsa || 'lahiri' });
  const res = await fetch(`${API_BASE}/api/panchang/monthly?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch monthly panchang');
  return res.json();
}
