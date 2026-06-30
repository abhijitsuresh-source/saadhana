# Sādhana — Panchang App

Real-time Hindu panchang dashboard. Node/Express backend computes tithi, nakshatra,
yoga, karana, vara, sunrise/sunset, Rahu Kalam/Yamaganda/Gulika, Abhijit & Brahma
Muhurta, Choghadiya, and Hora — all from first-principles astronomy
(`astronomy-engine`, pure JS, no native deps) with Lahiri/Raman/KP ayanamsa choice.
React frontend ports the Stitch prototype design (cream/saffron/maroon, Playfair +
Plus Jakarta Sans) and wires it to live data.

## Run it

**Backend:**
```
cd server
npm install   # already done if you're using this zip as-is
node index.js
```
Runs on http://localhost:4000

**Frontend:**
```
cd client
npm install   # already done if you're using this zip as-is
npm run dev
```
Runs on http://localhost:5173 — open it in a browser.

`client/.env` points the frontend at `VITE_API_BASE=http://localhost:4000`.
Change it if you deploy the API elsewhere.

## What's working

- **Home** (`/`) — live clock, active-period ring (auto-detects whichever muhurta/
  choghadiya/hora window you're currently in), Brahma Muhurta card, next auspicious
  window, panchang strip. Fully data-driven.
- **Daily** (`/daily`) — full day timeline (Brahma, Abhijit, Rahu Kalam, Yamaganda,
  Gulika), expandable Choghadiya grid, expandable 24h Hora list, prev/next/today nav.
- **Weekly** (`/weekly`) — 7-day strip with a heuristic auspiciousness score, day
  detail panel.
- **Monthly** (`/monthly`) — calendar grid with tithi per day, prev/next month nav.
- **Yearly** (`/yearly`) — 12-month mini-calendars, lazy-loaded.
- **Settings** (`/settings`) — location (manual lat/lon or browser geolocation),
  ayanamsa choice (Lahiri / Raman / KP). Persists to localStorage and recalculates
  everything live.

## What's NOT done yet (known gaps)

- **No festival/vrata database.** The yearly/monthly views don't yet flag
  Janmashtami, Ekadashi, eclipses, etc. — that needs a curated data source, not
  pure astronomy.
- **No North/South (Purnimanta/Amanta) tradition switch yet** — the onboarding
  screen's tradition picker wasn't wired in; Settings only has location + ayanamsa
  so far.
- **Choghadiya/Hora/Rahu-Kalam tables use the standard pan-Indian weekday tables** —
  accurate for the common case, but some regional traditions vary slightly.
- **Ayanamsa values are polynomial approximations**, not full Swiss Ephemeris
  precision. Good to within a minute or two of arc — fine for muhurta-level
  planning, not for natal-chart-precision work. Worth cross-checking a few dates
  against DrikPanchang before relying on it for anything published.
- **No saved birth-Nakshatra personalization** (onboarding step 3 — personal
  highlighting tied to your own Nakshatra — not implemented).
- Not deployed anywhere — local-dev only right now.

## Tech

- Backend: Node + Express + `astronomy-engine` (sidereal positions via Lahiri/Raman/
  KP ayanamsa correction applied to tropical Sun/Moon longitudes)
- Frontend: React + Vite + Tailwind (design tokens lifted directly from your Stitch
  prototype's tailwind.config), React Router for the 5 views + settings
