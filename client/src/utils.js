// Returns YYYY-MM-DD for the browser's LOCAL calendar date.
// toISOString().slice(0,10) is a common bug here: it returns the UTC date,
// which is wrong for IST (UTC+5:30) in the hours after midnight local time.
export function localDateStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fmtTime(iso) {
  if (!iso) return '--:--';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function fmtTime12(iso) {
  if (!iso) return '--:--';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function fmtDateLong(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function minutesBetween(a, b) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
}

export function isNowBetween(start, end, now = new Date()) {
  if (!start || !end) return false;
  const t = now.getTime();
  return t >= new Date(start).getTime() && t < new Date(end).getTime();
}

// Scans choghadiya, hora, and named muhurtas for whichever window contains `now`.
// Returns the most "specific" / highest-priority match.
export function findActivePeriod(panchang, now = new Date()) {
  if (!panchang) return null;

  const candidates = [];

  if (panchang.muhurtas?.abhijit && isNowBetween(panchang.muhurtas.abhijit.start, panchang.muhurtas.abhijit.end, now)) {
    candidates.push({ priority: 3, label: 'Abhijit Muhurta', nature: 'Auspicious now', ...panchang.muhurtas.abhijit });
  }
  if (panchang.muhurtas?.brahma && isNowBetween(panchang.muhurtas.brahma.start, panchang.muhurtas.brahma.end, now)) {
    candidates.push({ priority: 3, label: 'Brahma Muhurta', nature: 'Optimal for sadhana', ...panchang.muhurtas.brahma });
  }
  if (panchang.inauspicious?.rahuKalam && isNowBetween(panchang.inauspicious.rahuKalam.start, panchang.inauspicious.rahuKalam.end, now)) {
    candidates.push({ priority: 2, label: 'Rahu Kalam', nature: 'Inauspicious — avoid new ventures', ...panchang.inauspicious.rahuKalam });
  }
  const allChoghadiya = [...(panchang.choghadiya?.day || []), ...(panchang.choghadiya?.night || [])];
  for (const c of allChoghadiya) {
    if (isNowBetween(c.start, c.end, now)) {
      candidates.push({ priority: 1, label: `${c.name} Choghadiya`, nature: c.nature, start: c.start, end: c.end });
    }
  }
  for (const h of panchang.hora || []) {
    if (isNowBetween(h.start, h.end, now)) {
      candidates.push({ priority: 0, label: `${h.ruler} Hora`, nature: 'Planetary hour', start: h.start, end: h.end });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.priority - a.priority);
  return candidates[0];
}

// Finds the next upcoming "Best"/"Good" window after `now` (for the "upcoming transition" card)
export function findNextAuspicious(panchang, now = new Date()) {
  if (!panchang) return null;
  const pool = [];

  if (panchang.muhurtas?.abhijit && new Date(panchang.muhurtas.abhijit.start) > now) {
    pool.push({ label: 'Abhijit Muhurta', nature: 'Auspicious', ...panchang.muhurtas.abhijit });
  }
  const allChoghadiya = [...(panchang.choghadiya?.day || []), ...(panchang.choghadiya?.night || [])];
  for (const c of allChoghadiya) {
    if ((c.nature === 'Best' || c.nature === 'Good') && new Date(c.start) > now) {
      pool.push({ label: `${c.name} Choghadiya`, nature: c.nature, start: c.start, end: c.end });
    }
  }

  if (pool.length === 0) return null;
  pool.sort((a, b) => new Date(a.start) - new Date(b.start));
  return pool[0];
}
