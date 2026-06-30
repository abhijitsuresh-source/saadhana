import { useEffect, useState } from 'react';
import { fetchMonthlyPanchang } from '../api';
import { useAppLocation } from '../LocationContext';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Yearly() {
  const { location, ayanamsa } = useAppLocation();
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthsData, setMonthsData] = useState({});

  useEffect(() => {
    // Lazy-load each month's data on demand for performance; fetch sequentially in background
    let cancelled = false;
    (async () => {
      for (let m = 1; m <= 12; m++) {
        if (cancelled) return;
        const data = await fetchMonthlyPanchang({ year, month: m, lat: location.lat, lon: location.lon, ayanamsa });
        if (!cancelled) setMonthsData((prev) => ({ ...prev, [m]: data.days }));
      }
    })();
    return () => { cancelled = true; };
  }, [year, location.lat, location.lon, ayanamsa]);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-8 pb-16">
      <section className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-label-caps text-secondary tracking-[0.2em] mb-2 block uppercase">Drishti • {year}</span>
          <h2 className="font-display text-headline-lg md:text-display text-on-surface mb-2">Year of Mindfulness</h2>
          <p className="text-on-surface-variant max-w-xl">Sidereal calendar overview, calculated live via Lahiri ayanamsa.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setYear((y) => y - 1)} className="px-4 py-2 rounded-full border border-outline-variant font-label-caps text-primary">← {year - 1}</button>
          <button onClick={() => setYear((y) => y + 1)} className="px-4 py-2 rounded-full border border-outline-variant font-label-caps text-primary">{year + 1} →</button>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
        {MONTH_NAMES.map((name, idx) => {
          const m = idx + 1;
          const days = monthsData[m];
          const firstDow = new Date(year, m - 1, 1).getDay();
          return (
            <div key={m} className="bg-surface-container-lowest border border-outline-variant/40 p-6 rounded-2xl flex flex-col h-full">
              <div className="flex justify-between items-baseline mb-4">
                <h3 className="font-display text-headline-md text-primary">{name}</h3>
                <span className="font-label-caps text-on-surface-variant/50">{String(m).padStart(2, '0')}</span>
              </div>
              {!days ? (
                <p className="text-[10px] font-label-caps text-on-surface-variant/40 italic py-8 text-center">Loading…</p>
              ) : (
                <div className="grid grid-cols-7 gap-y-1 mb-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="text-[10px] font-bold text-center opacity-30">{d}</span>
                  ))}
                  {Array.from({ length: firstDow }).map((_, i) => <span key={'p' + i} />)}
                  {days.map((d) => {
                    const isToday = d.date === todayStr;
                    const dayNum = new Date(d.date + 'T00:00:00').getDate();
                    return (
                      <span
                        key={d.date}
                        className={`text-[11px] text-center p-1 relative ${isToday ? 'font-bold text-primary' : ''}`}
                        title={`${d.tithi.paksha} ${d.tithi.name} · ${d.nakshatra.name}`}
                      >
                        {dayNum}
                        {isToday && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
