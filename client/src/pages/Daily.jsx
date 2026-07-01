import { useEffect, useState } from 'react';
import { fetchDailyPanchang } from '../api';
import { useAppLocation } from '../LocationContext';
import { fmtTime12, fmtDateLong, localDateStr } from '../utils';

export default function Daily() {
  const { location, ayanamsa } = useAppLocation();
  const [panchang, setPanchang] = useState(null);
  const [dateStr, setDateStr] = useState(() => localDateStr());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchDailyPanchang({ date: dateStr, lat: location.lat, lon: location.lon, ayanamsa })
      .then(setPanchang)
      .finally(() => setLoading(false));
  }, [dateStr, location.lat, location.lon, ayanamsa]);

  if (loading || !panchang) {
    return <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-24 text-center">
      <p className="font-label-caps text-on-surface-variant/60 tracking-widest">LOADING…</p>
    </main>;
  }

  const events = buildEvents(panchang);

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
      <section className="mb-12 border-b border-outline-variant/30 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg mb-2">{fmtDateLong(panchang.date)}</h2>
          <p className="text-on-surface-variant opacity-70">
            {panchang.nakshatra.name} · {panchang.tithi.paksha} Paksha · {panchang.tithi.name}
          </p>
          <div className="flex gap-3 mt-3">
            <button onClick={() => shiftDate(dateStr, -1, setDateStr)} className="px-4 py-1.5 rounded-full border border-outline-variant text-primary font-label-caps text-[10px]">← PREV</button>
            <button onClick={() => setDateStr(localDateStr())} className="px-4 py-1.5 rounded-full border border-outline-variant text-primary font-label-caps text-[10px]">TODAY</button>
            <button onClick={() => shiftDate(dateStr, 1, setDateStr)} className="px-4 py-1.5 rounded-full border border-outline-variant text-primary font-label-caps text-[10px]">NEXT →</button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
          <Stat label="Sunrise" icon="wb_sunny" value={fmtTime12(panchang.sun.sunrise)} />
          <Stat label="Sunset" icon="wb_twilight" value={fmtTime12(panchang.sun.sunset)} />
          <Stat label="Moonrise" icon="brightness_3" value={fmtTime12(panchang.moon.moonrise)} />
          <Stat label="Moonset" icon="nights_stay" value={fmtTime12(panchang.moon.moonset)} />
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3">
          <h3 className="font-headline-md text-headline-md mb-2">Muhurta Timeline</h3>
          <p className="text-sm text-on-surface-variant/70 mb-6">Full-day view — named muhurtas plus every Choghadiya window, sunrise to sunrise.</p>
          <div className="space-y-1.5">
            {events.map((e, i) => (
              <div key={i} className={`flex justify-between items-center p-3 rounded-r-lg border-l-4 ${e.style}`}>
                <div>
                  <p className="font-label-caps text-[10px] mb-0.5 opacity-70">{e.tag}</p>
                  <h4 className="font-bold text-sm">{e.label}</h4>
                </div>
                <span className="text-xs text-on-surface-variant/60 whitespace-nowrap">{fmtTime12(e.start)} — {fmtTime12(e.end)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-1/3 space-y-6">
          <details className="group bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm" open>
            <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">grid_view</span>
                <h3 className="font-headline-md text-headline-md text-[20px]">Choghadiya</h3>
              </div>
              <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
            </summary>
            <div className="px-6 pb-6 pt-2">
              <h4 className="font-label-caps text-[10px] text-secondary border-b border-secondary/20 pb-1 mb-2">Day</h4>
              {panchang.choghadiya.day.map((c, i) => (
                <ChogRow key={'d' + i} c={c} />
              ))}
              <h4 className="font-label-caps text-[10px] text-on-surface-variant/60 border-b border-outline-variant/30 pb-1 mb-2 mt-4">Night</h4>
              {panchang.choghadiya.night.map((c, i) => (
                <ChogRow key={'n' + i} c={c} />
              ))}
            </div>
          </details>

          <details className="group bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm">
            <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">shutter_speed</span>
                <h3 className="font-headline-md text-headline-md text-[20px]">Hora Timeline</h3>
              </div>
              <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
            </summary>
            <div className="px-6 pb-6 pt-2 max-h-96 overflow-y-auto">
              {panchang.hora.map((h, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-outline-variant/10">
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-lg">brightness_2</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{h.ruler}</p>
                    <p className="text-[10px] text-on-surface-variant/60">{fmtTime12(h.start)} — {fmtTime12(h.end)}</p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </main>
  );
}

function shiftDate(dateStr, delta, setter) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + delta);
  setter(d.toISOString().slice(0, 10));
}

function Stat({ label, icon, value }) {
  return (
    <div className="flex flex-col p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
      <span className="font-label-caps text-on-surface-variant text-[10px] uppercase mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-sm">{icon}</span>
        <span className="font-stats-display text-stats-display">{value}</span>
      </div>
    </div>
  );
}

function ChogRow({ c }) {
  const natureColor = { Best: 'border-primary', Good: 'border-tertiary-container', Neutral: 'border-outline-variant', Bad: 'border-error/40', Loss: 'border-error/40' };
  return (
    <div className={`flex justify-between items-center text-xs p-2 mb-1 bg-surface-container rounded-lg border-l-2 ${natureColor[c.nature] || 'border-outline-variant'}`}>
      <span className="font-bold">{c.name}</span>
      <span className="opacity-60 italic">{fmtTime12(c.start)}–{fmtTime12(c.end)} · {c.nature}</span>
    </div>
  );
}

function buildEvents(p) {
  const events = [];

  // Named muhurtas (auspicious)
  if (p.muhurtas.brahma) events.push({ label: 'Brahma Muhurta', tag: 'Auspicious', kind: 'muhurta', start: p.muhurtas.brahma.start, end: p.muhurtas.brahma.end, style: 'bg-primary/5 border-primary' });
  if (p.sandhyas?.prata) events.push({ label: 'Prata Sandhya', tag: 'Dawn worship', kind: 'muhurta', start: p.sandhyas.prata.start, end: p.sandhyas.prata.end, style: 'bg-secondary-fixed/20 border-secondary' });
  if (p.muhurtas.abhijit) events.push({ label: 'Abhijit Muhurta', tag: 'Auspicious', kind: 'muhurta', start: p.muhurtas.abhijit.start, end: p.muhurtas.abhijit.end, style: 'bg-tertiary-container/10 border-tertiary-container' });
  if (p.sandhyas?.madhyahnika) events.push({ label: 'Madhyahnika Sandhya', tag: 'Midday worship', kind: 'muhurta', start: p.sandhyas.madhyahnika.start, end: p.sandhyas.madhyahnika.end, style: 'bg-secondary-fixed/20 border-secondary' });
  if (p.sandhyas?.sayam) events.push({ label: 'Sayam Sandhya', tag: 'Dusk worship', kind: 'muhurta', start: p.sandhyas.sayam.start, end: p.sandhyas.sayam.end, style: 'bg-secondary-fixed/20 border-secondary' });

  // Named inauspicious windows
  if (p.inauspicious.rahuKalam) events.push({ label: 'Rahu Kalam', tag: 'Inauspicious', kind: 'avoid', start: p.inauspicious.rahuKalam.start, end: p.inauspicious.rahuKalam.end, style: 'bg-error/5 border-error' });
  if (p.inauspicious.yamaganda) events.push({ label: 'Yamaganda', tag: 'Inauspicious', kind: 'avoid', start: p.inauspicious.yamaganda.start, end: p.inauspicious.yamaganda.end, style: 'bg-error/5 border-error/60' });
  if (p.inauspicious.gulikaKalam) events.push({ label: 'Gulika Kalam', tag: 'Inauspicious', kind: 'avoid', start: p.inauspicious.gulikaKalam.start, end: p.inauspicious.gulikaKalam.end, style: 'bg-error/5 border-error/40' });

  // Fill remaining hours with Choghadiya windows so the timeline covers the FULL day (sunrise -> next sunrise),
  // not just the handful of named muhurtas — this is what makes it useful for sadhana planning end-to-end.
  const allChoghadiya = [...(p.choghadiya?.day || []), ...(p.choghadiya?.night || [])];
  for (const c of allChoghadiya) {
    const style =
      c.nature === 'Best' ? 'bg-primary/5 border-primary'
      : c.nature === 'Good' ? 'bg-tertiary-container/10 border-tertiary-container'
      : c.nature === 'Neutral' ? 'bg-surface-container border-outline-variant'
      : 'bg-error/5 border-error/30'; // Loss / Bad
    events.push({
      label: `${c.name} Choghadiya`,
      tag: c.nature === 'Best' || c.nature === 'Good' ? 'Favorable' : c.nature === 'Neutral' ? 'Neutral' : 'Less favorable',
      kind: 'choghadiya',
      start: c.start,
      end: c.end,
      style
    });
  }

  events.sort((a, b) => new Date(a.start) - new Date(b.start));

  // Drop Choghadiya slots that are fully covered by a named muhurta/avoid window, so we don't show
  // two overlapping rows for the same span (e.g. Abhijit Muhurta usually sits inside a Choghadiya slot).
  const named = events.filter((e) => e.kind !== 'choghadiya');
  const deduped = events.filter((e) => {
    if (e.kind !== 'choghadiya') return true;
    const s = new Date(e.start).getTime(), en = new Date(e.end).getTime();
    return !named.some((n) => {
      const ns = new Date(n.start).getTime(), ne = new Date(n.end).getTime();
      return s >= ns && en <= ne; // fully contained inside a named window -> drop
    });
  });

  return deduped;
}
