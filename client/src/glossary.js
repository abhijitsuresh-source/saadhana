// Plain-English layer over panchang terminology.
// Goal: a first-time visitor should never have to leave the app to understand a term.

export const CHOGHADIYA_PLAIN = {
  Amrita: { tone: 'great', tip: 'Best window of the day — great for important starts, decisions, or sadhana.' },
  Shubha: { tone: 'good', tip: 'Good and auspicious — favorable for most activities.' },
  Labha: { tone: 'good', tip: 'Good for gain — favorable for business, money matters, new ventures.' },
  Chara: { tone: 'neutral', tip: 'Neutral — fine for travel and routine activity, not especially auspicious or inauspicious.' },
  Kala: { tone: 'caution', tip: 'Associated with loss — better to avoid starting anything important now.' },
  Roga: { tone: 'bad', tip: "Inauspicious — avoid new starts. Existing tasks aren't affected." },
  Udvega: { tone: 'bad', tip: 'Associated with anxiety/conflict — avoid starting new ventures now.' }
};

export const NATURE_PLAIN = {
  Best: 'Ideal time — go for it',
  Good: 'Favorable time',
  Neutral: 'Neither good nor bad',
  Loss: 'Better to wait',
  Bad: 'Avoid starting new things'
};

export const MUHURTA_PLAIN = {
  'Brahma Muhurta': 'The 48 minutes before sunrise — traditionally the best time of day for meditation and quiet practice.',
  'Abhijit Muhurta': 'A roughly 48-minute window around midday considered auspicious for almost any important activity.',
  'Prata Sandhya': 'Dawn worship window, centered on sunrise — traditional time for morning Sandhya Vandanam and sun salutations.',
  'Madhyahnika Sandhya': 'Midday worship window, centered on solar noon — the second of the three daily Sandhya prayers.',
  'Sayam Sandhya': 'Dusk worship window, centered on sunset — the evening Sandhya Vandanam.',
  'Rahu Kalam': "A period each day considered inauspicious for starting anything new. Doesn't affect things already in progress.",
  Yamaganda: 'Another daily inauspicious window — similar guidance to Rahu Kalam.',
  'Gulika Kalam': 'A third daily inauspicious window, generally considered milder than Rahu Kalam.'
};

export const PANCHANG_TERM_PLAIN = {
  Tithi: 'The lunar day — where the moon is in its cycle relative to the sun. Governs which rituals and fasts (vrata) apply today.',
  Nakshatra: "The lunar mansion — which of the 27 star-segments the moon is passing through. Often used for naming and matching compatibility.",
  Yoga: 'A combined sun-moon angle calculation, one of 27 — used to judge the general quality of the day.',
  Karana: 'Half of a tithi — a finer-grained lunar division used in muhurta calculations.',
  Vara: 'The weekday, each ruled by a planet (e.g. Mangala = Mars = Tuesday).'
};

const VARA_PLAIN_NAMES = {
  Ravi: 'Sunday', Soma: 'Monday', Mangala: 'Tuesday', Budha: 'Wednesday',
  Guru: 'Thursday', Shukra: 'Friday', Shani: 'Saturday'
};

export function varaPlainName(vara) {
  return VARA_PLAIN_NAMES[vara] || vara;
}

export function describePeriodLabel(label) {
  // "Roga Choghadiya" -> plain tip; "Brahma Muhurta" -> plain tip; "Mangala Hora" -> generic
  if (label.endsWith('Choghadiya')) {
    const name = label.replace(' Choghadiya', '');
    return CHOGHADIYA_PLAIN[name]?.tip || '';
  }
  if (MUHURTA_PLAIN[label]) return MUHURTA_PLAIN[label];
  if (label.endsWith('Hora')) {
    return `An hour ruled by ${label.replace(' Hora', '')} — used for fine-tuning activity choices, secondary to Choghadiya.`;
  }
  return '';
}

export function toneForNature(nature) {
  const map = { Best: 'great', Good: 'good', Neutral: 'neutral', Loss: 'caution', Bad: 'bad' };
  return map[nature] || 'neutral';
}

export const TONE_COLORS = {
  great: 'text-primary bg-primary/10 border-primary/30',
  good: 'text-tertiary bg-tertiary-container/20 border-tertiary-container/40',
  neutral: 'text-on-surface-variant bg-surface-container border-outline-variant/30',
  caution: 'text-secondary bg-secondary-container/20 border-secondary/30',
  bad: 'text-error bg-error-container/40 border-error/30'
};
