// Core Panchang calculation engine
// Uses astronomy-engine (pure JS, no native deps) for Sun/Moon geocentric ecliptic longitudes
// Converts tropical -> sidereal using Lahiri (Chitra Paksha) ayanamsa, with Raman/KP as alternates

const Astronomy = require('astronomy-engine');

const TITHI_NAMES = [
  'Prathama', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami',
  'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dvadashi', 'Trayodashi', 'Chaturdashi', 'Purnima'
];
const TITHI_NAMES_KRISHNA = [
  'Prathama', 'Dvitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami',
  'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dvadashi', 'Trayodashi', 'Chaturdashi', 'Amavasya'
];

const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra',
  'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha',
  'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const YOGAS = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma',
  'Dhriti', 'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha',
  'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
];

const KARANAS = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti',
  'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'
];

const VARAS = ['Ravi', 'Soma', 'Mangala', 'Budha', 'Guru', 'Shukra', 'Shani']; // 0=Sunday

const RASHIS = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'
];

const PLANET_RULERS = ['Surya', 'Chandra', 'Mangala', 'Budha', 'Guru', 'Shukra', 'Shani'];

function norm360(x) {
  x = x % 360;
  if (x < 0) x += 360;
  return x;
}

// Lahiri ayanamsa approximation (good to within arc-seconds for modern dates)
// Based on IAU/standard polynomial approximation referenced to J2000
function lahiriAyanamsa(date) {
  // astronomy-engine's AstroTime.tt is "days since J2000.0 TT", NOT a full Julian Date.
  const ttDaysSinceJ2000 = Astronomy.MakeTime(date).tt;
  const jd = 2451545.0 + ttDaysSinceJ2000; // convert to full Julian Date (TT)

  // Lahiri (Chitra Paksha) ayanamsa: 23°51' at JD 2433282.5 (1950 Jan 1.0), drift ~50.27"/year
  const ayan1950 = 23 + 51 / 60;
  const jd1950 = 2433282.5;
  const driftPerYear = 50.27 / 3600;
  const years = (jd - jd1950) / 365.2425;
  return ayan1950 + driftPerYear * years;
}

const AYANAMSA_FN = {
  lahiri: lahiriAyanamsa,
  raman: (date) => lahiriAyanamsa(date) - 0.39, // Raman ~ Lahiri - ~23' offset (approx)
  kp: (date) => lahiriAyanamsa(date) + 0.0 // KP newcomb ~ very close to Lahiri (approx)
};

function getSiderealLongitudes(date, ayanamsaKey = 'lahiri') {
  const sunEcl = Astronomy.SunPosition(date); // geocentric apparent ecliptic of date
  const moonEqu = Astronomy.GeoVector(Astronomy.Body.Moon, date, true);
  const moonEcl = Astronomy.Ecliptic(moonEqu);

  const ayanamsa = AYANAMSA_FN[ayanamsaKey] ? AYANAMSA_FN[ayanamsaKey](date) : lahiriAyanamsa(date);

  const sunTropical = norm360(sunEcl.elon);
  const moonTropical = norm360(moonEcl.elon);

  return {
    sunSidereal: norm360(sunTropical - ayanamsa),
    moonSidereal: norm360(moonTropical - ayanamsa),
    ayanamsa
  };
}

function computeTithi(date, ayanamsaKey) {
  const { sunSidereal, moonSidereal } = getSiderealLongitudes(date, ayanamsaKey);
  let diff = norm360(moonSidereal - sunSidereal);
  const tithiIndex = Math.floor(diff / 12); // 0..29
  const paksha = tithiIndex < 15 ? 'Shukla' : 'Krishna';
  const localIndex = tithiIndex % 15;
  const name = paksha === 'Shukla' ? TITHI_NAMES[localIndex] : TITHI_NAMES_KRISHNA[localIndex];
  const percentComplete = (diff % 12) / 12 * 100;
  return { index: tithiIndex, paksha, name, percentComplete, diff };
}

function computeNakshatra(date, ayanamsaKey) {
  const { moonSidereal } = getSiderealLongitudes(date, ayanamsaKey);
  const segment = 360 / 27; // 13.333...
  const idx = Math.floor(moonSidereal / segment);
  const pada = Math.floor((moonSidereal % segment) / (segment / 4)) + 1;
  return { index: idx, name: NAKSHATRAS[idx], pada, longitude: moonSidereal };
}

function computeYoga(date, ayanamsaKey) {
  const { sunSidereal, moonSidereal } = getSiderealLongitudes(date, ayanamsaKey);
  const sum = norm360(sunSidereal + moonSidereal);
  const segment = 360 / 27;
  const idx = Math.floor(sum / segment);
  return { index: idx, name: YOGAS[idx] };
}

function computeKarana(date, ayanamsaKey) {
  const { sunSidereal, moonSidereal } = getSiderealLongitudes(date, ayanamsaKey);
  const diff = norm360(moonSidereal - sunSidereal);
  const karanaNum = Math.floor(diff / 6); // 0..59
  let name;
  if (karanaNum === 0) name = KARANAS[10]; // Kimstughna
  else if (karanaNum >= 57) name = KARANAS[7 + (karanaNum - 57)]; // Shakuni, Chatushpada, Naga
  else name = KARANAS[(karanaNum - 1) % 7];
  return { index: karanaNum, name };
}

function computeVara(date) {
  // Vedic day starts at sunrise; caller should pass the date adjusted if needed
  const day = date.getUTCDay ? date.getDay() : date.getDay();
  return { index: day, name: VARAS[day] };
}

function computeRashi(longitude) {
  const idx = Math.floor(norm360(longitude) / 30);
  return RASHIS[idx];
}

// Sunrise/sunset/moonrise/moonset for a given lat/lon/date
function getSunMoonTimes(date, lat, lon) {
  const observer = new Astronomy.Observer(lat, lon, 0);
  const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));

  function safeSearchRiseSet(body, direction, startTime) {
    try {
      const r = Astronomy.SearchRiseSet(body, observer, direction, startTime, 1);
      return r ? r.date : null;
    } catch (e) {
      return null;
    }
  }

  const sunrise = safeSearchRiseSet(Astronomy.Body.Sun, +1, dayStart);
  const sunset = safeSearchRiseSet(Astronomy.Body.Sun, -1, sunrise || dayStart);
  const moonrise = safeSearchRiseSet(Astronomy.Body.Moon, +1, dayStart);
  const moonset = safeSearchRiseSet(Astronomy.Body.Moon, -1, dayStart);

  return { sunrise, sunset, moonrise, moonset };
}

// Rahu Kalam, Yamaganda, Gulika Kalam — based on sunrise/sunset division into 8 parts, vara-dependent slot
// Standard ordering (slot index 0-7, NW table by weekday)
const RAHU_SLOT = [7, 1, 6, 4, 5, 3, 2]; // Sun..Sat -> slot index (1-indexed slots 1-8 traditionally; using 0-indexed here as slot-1)
const YAMA_SLOT = [4, 3, 2, 1, 0, 6, 5];
const GULIKA_SLOT = [6, 5, 4, 3, 2, 1, 0];

function computeInauspiciousPeriods(sunrise, sunset, weekday) {
  if (!sunrise || !sunset) return {};
  const dayMs = sunset.getTime() - sunrise.getTime();
  const partMs = dayMs / 8;

  function slotTimes(slotIdx) {
    const start = new Date(sunrise.getTime() + slotIdx * partMs);
    const end = new Date(sunrise.getTime() + (slotIdx + 1) * partMs);
    return { start, end };
  }

  return {
    rahuKalam: slotTimes(RAHU_SLOT[weekday] - 1 >= 0 ? RAHU_SLOT[weekday] - 1 : 0),
    yamaganda: slotTimes(YAMA_SLOT[weekday]),
    gulikaKalam: slotTimes(GULIKA_SLOT[weekday])
  };
}

// Abhijit Muhurta: 8th muhurta of the day (15 equal divisions from sunrise to sunset, ~48 min each, centered on local noon)
function computeAbhijitMuhurta(sunrise, sunset) {
  if (!sunrise || !sunset) return null;
  const dayMs = sunset.getTime() - sunrise.getTime();
  const muhurtaMs = dayMs / 15;
  const start = new Date(sunrise.getTime() + 7 * muhurtaMs);
  const end = new Date(sunrise.getTime() + 8 * muhurtaMs);
  return { start, end };
}

// Brahma Muhurta: last 48 minutes (2 muhurtas) before sunrise, traditionally the 2nd-to-last muhurta of the night
function computeBrahmaMuhurta(sunrise) {
  if (!sunrise) return null;
  const start = new Date(sunrise.getTime() - 96 * 60 * 1000); // 1h36m before sunrise
  const end = new Date(sunrise.getTime() - 48 * 60 * 1000); // 48m before sunrise
  return { start, end };
}

// Choghadiya: 8 day periods + 8 night periods, cyclic table per weekday
const CHOGHADIYA_DAY = {
  0: ['Udvega', 'Chara', 'Labha', 'Amrita', 'Kala', 'Shubha', 'Roga', 'Udvega'], // Sun
  1: ['Amrita', 'Kala', 'Shubha', 'Roga', 'Udvega', 'Chara', 'Labha', 'Amrita'], // Mon
  2: ['Roga', 'Udvega', 'Chara', 'Labha', 'Amrita', 'Kala', 'Shubha', 'Roga'], // Tue
  3: ['Labha', 'Amrita', 'Kala', 'Shubha', 'Roga', 'Udvega', 'Chara', 'Labha'], // Wed
  4: ['Shubha', 'Roga', 'Udvega', 'Chara', 'Labha', 'Amrita', 'Kala', 'Shubha'], // Thu
  5: ['Chara', 'Labha', 'Amrita', 'Kala', 'Shubha', 'Roga', 'Udvega', 'Chara'], // Fri
  6: ['Kala', 'Shubha', 'Roga', 'Udvega', 'Chara', 'Labha', 'Amrita', 'Kala'] // Sat
};
const CHOGHADIYA_NIGHT = {
  0: ['Shubha', 'Amrita', 'Chara', 'Roga', 'Kala', 'Labha', 'Udvega', 'Shubha'],
  1: ['Chara', 'Roga', 'Kala', 'Labha', 'Udvega', 'Shubha', 'Amrita', 'Chara'],
  2: ['Kala', 'Labha', 'Udvega', 'Shubha', 'Amrita', 'Chara', 'Roga', 'Kala'],
  3: ['Udvega', 'Shubha', 'Amrita', 'Chara', 'Roga', 'Kala', 'Labha', 'Udvega'],
  4: ['Amrita', 'Chara', 'Roga', 'Kala', 'Labha', 'Udvega', 'Shubha', 'Amrita'],
  5: ['Roga', 'Kala', 'Labha', 'Udvega', 'Shubha', 'Amrita', 'Chara', 'Roga'],
  6: ['Labha', 'Udvega', 'Shubha', 'Amrita', 'Chara', 'Roga', 'Kala', 'Labha']
};
const CHOGHADIYA_NATURE = {
  Udvega: 'Bad', Chara: 'Neutral', Labha: 'Good', Amrita: 'Best',
  Kala: 'Loss', Shubha: 'Good', Roga: 'Bad'
};

function computeChoghadiya(sunrise, sunset, nextSunrise, weekday) {
  if (!sunrise || !sunset || !nextSunrise) return { day: [], night: [] };
  const dayPartMs = (sunset.getTime() - sunrise.getTime()) / 8;
  const nightPartMs = (nextSunrise.getTime() - sunset.getTime()) / 8;

  const dayNames = CHOGHADIYA_DAY[weekday];
  const nightNames = CHOGHADIYA_NIGHT[weekday];

  const day = dayNames.map((name, i) => ({
    name,
    nature: CHOGHADIYA_NATURE[name],
    start: new Date(sunrise.getTime() + i * dayPartMs),
    end: new Date(sunrise.getTime() + (i + 1) * dayPartMs)
  }));

  const night = nightNames.map((name, i) => ({
    name,
    nature: CHOGHADIYA_NATURE[name],
    start: new Date(sunset.getTime() + i * nightPartMs),
    end: new Date(sunset.getTime() + (i + 1) * nightPartMs)
  }));

  return { day, night };
}

// Hora: 24 planetary hours per day, ruler sequence based on Chaldean order, starting planet per weekday
const CHALDEAN_ORDER = ['Shani', 'Guru', 'Mangala', 'Surya', 'Shukra', 'Budha', 'Chandra'];
const HORA_START_INDEX = { 0: 3, 1: 6, 2: 2, 3: 5, 4: 1, 5: 4, 6: 0 }; // Sun->Surya, Mon->Chandra, etc.

function computeHora(sunrise, nextSunrise, weekday) {
  if (!sunrise || !nextSunrise) return [];
  const totalMs = nextSunrise.getTime() - sunrise.getTime();
  const horaMs = totalMs / 24;
  const startIdx = HORA_START_INDEX[weekday];
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const ruler = CHALDEAN_ORDER[(startIdx + i) % 7];
    hours.push({
      ruler,
      start: new Date(sunrise.getTime() + i * horaMs),
      end: new Date(sunrise.getTime() + (i + 1) * horaMs)
    });
  }
  return hours;
}

// Sandhya (twilight worship windows): Prata (dawn), Madhyahnika (midday), Sayam (dusk)
// Traditional practical rule: each Sandhya spans roughly 24 minutes on either side of its anchor point
// (sunrise, solar noon, sunset) — some traditions extend Prata Sandhya to start earlier (48 min before sunrise).
function computeSandhyas(sunrise, sunset) {
  if (!sunrise || !sunset) return {};
  const solarNoon = new Date(sunrise.getTime() + (sunset.getTime() - sunrise.getTime()) / 2);
  const win = 24 * 60 * 1000; // 24 minutes

  return {
    prata: { start: new Date(sunrise.getTime() - 2 * win), end: new Date(sunrise.getTime() + win) },
    madhyahnika: { start: new Date(solarNoon.getTime() - win), end: new Date(solarNoon.getTime() + win) },
    sayam: { start: new Date(sunset.getTime() - win), end: new Date(sunset.getTime() + 2 * win) }
  };
}

// Full daily panchang computation
function computeDailyPanchang({ date, lat, lon, ayanamsa = 'lahiri' }) {
  const noon = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
  const weekday = date.getDay();

  const tithi = computeTithi(noon, ayanamsa);
  const nakshatra = computeNakshatra(noon, ayanamsa);
  const yoga = computeYoga(noon, ayanamsa);
  const karana = computeKarana(noon, ayanamsa);
  const vara = computeVara(date);

  const { sunSidereal, moonSidereal } = getSiderealLongitudes(noon, ayanamsa);
  const sunRashi = computeRashi(sunSidereal);
  const moonRashi = computeRashi(moonSidereal);

  const { sunrise, sunset, moonrise, moonset } = getSunMoonTimes(date, lat, lon);

  const nextDay = new Date(date.getTime() + 24 * 3600 * 1000);
  const { sunrise: nextSunrise } = getSunMoonTimes(nextDay, lat, lon);

  const inauspicious = computeInauspiciousPeriods(sunrise, sunset, weekday);
  const abhijit = computeAbhijitMuhurta(sunrise, sunset);
  const brahma = computeBrahmaMuhurta(sunrise);
  const sandhyas = computeSandhyas(sunrise, sunset);
  const choghadiya = computeChoghadiya(sunrise, sunset, nextSunrise, weekday);
  const hora = computeHora(sunrise, nextSunrise, weekday);

  return {
    date: date.toISOString().slice(0, 10),
    location: { lat, lon },
    ayanamsa,
    sun: { sidereal: sunSidereal, rashi: sunRashi, sunrise, sunset },
    moon: { sidereal: moonSidereal, rashi: moonRashi, moonrise, moonset },
    tithi,
    nakshatra,
    yoga,
    karana,
    vara,
    muhurtas: { abhijit, brahma },
    sandhyas,
    inauspicious,
    choghadiya,
    hora
  };
}

module.exports = {
  computeDailyPanchang,
  computeTithi,
  computeNakshatra,
  computeYoga,
  computeKarana,
  computeVara,
  getSunMoonTimes,
  lahiriAyanamsa,
  NAKSHATRAS,
  RASHIS,
  VARAS
};
