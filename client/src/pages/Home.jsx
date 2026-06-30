import { useEffect, useState, useMemo } from 'react';
import { fetchDailyPanchang } from '../api';
import { useAppLocation } from '../LocationContext';
import { fmtTime12, fmtDateLong, findActivePeriod, findNextAuspicious, minutesBetween } from '../utils';

export default function Home() {
  const { location, ayanamsa } = useAppLocation();
  const [panchang, setPanchang] = useState(null);
  const [tomorrowPanchang, setTomorrowPanchang] = useState(null);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    const todayStr = today.toISOString().slice(0, 10);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    Promise.all([
      fetchDailyPanchang({ date: todayStr, lat: location.lat, lon: location.lon, ayanamsa }),
      fetchDailyPanchang({ date: tomorrowStr, lat: location.lat, lon: location.lon, ayanamsa })
    ])
      .then(([todayData, tomorrowData]) => {
        if (cancelled) return;
        setPanchang(todayData);
        setTomorrowPanchang(tomorrowData);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [location.lat, location.lon, ayanamsa]);

  const activePeriod = useMemo(() => findActivePeriod(panchang, now), [panchang, now]);
  const nextAuspicious = useMemo(() => findNextAuspicious(panchang, now), [panchang, now]);

  const ringDashOffset = useMemo(() => {
    if (!activePeriod) return 289;
    const total = new Date(activePeriod.end).getTime() - new Date(activePeriod.start).getTime();
    const elapsed = now.getTime() - new Date(activePeriod.start).getTime();
    const frac = Math.min(1, Math.max(0, elapsed / total));
    return 289 - frac * 289;
  }, [activePeriod, now]);

  const timeRemaining = useMemo(() => {
    if (!activePeriod) return null;
    const mins = minutesBetween(now, activePeriod.end);
    if (mins <= 0) return 'Ending now';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `Ends in ${h}h ${m}m` : `Ends in ${m}m`;
  }, [activePeriod, now]);

  // Brahma Muhurta card: prefer tomorrow's (since it's pre-dawn, usually still ahead)
  const brahmaCard = useMemo(() => {
    if (panchang?.muhurtas?.brahma && new Date(panchang.muhurtas.brahma.start) > now) {
      return { ...panchang.muhurtas.brahma, when: 'Today' };
    }
    if (tomorrowPanchang?.muhurtas?.brahma) {
      return { ...tomorrowPanchang.muhurtas.brahma, when: 'Tomorrow Morning' };
    }
    return null;
  }, [panchang, tomorrowPanchang, now]);

  if (loading) {
    return (
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-24 text-center">
        <p className="font-label-caps text-on-surface-variant/60 tracking-widest">CALCULATING TODAY'S PANCHANG…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-24 text-center">
        <p className="font-label-caps text-error tracking-widest">{error}</p>
        <p className="text-on-surface-variant text-sm mt-2">Is the API server running on :4000?</p>
      </main>
    );
  }

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10 space-y-12">
      {/* Live Clock & Active Period */}
      <section className="flex flex-col items-center justify-center space-y-8">
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle className="text-outline-variant/20" cx="50" cy="50" fill="transparent" r="46" stroke="currentColor" strokeWidth="1.5" />
            <circle
              className="text-secondary transition-all duration-1000"
              cx="50" cy="50" fill="transparent" r="46"
              stroke="currentColor" strokeDasharray="289" strokeDashoffset={ringDashOffset}
              strokeLinecap="round" strokeWidth="2.5"
            />
          </svg>
          <div className="text-center space-y-1 z-10">
            <div className="font-display text-4xl md:text-5xl text-primary font-medium tracking-tight">
              {now.toLocaleTimeString('en-IN', { hour12: false })}
            </div>
            <div className="font-label-caps text-on-surface-variant text-[10px] tracking-widest uppercase">CURRENT TIME</div>
            <div className="pt-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container/30 text-on-secondary-container border border-secondary/20 font-label-caps text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                {activePeriod ? activePeriod.label.toUpperCase() : 'NO ACTIVE PERIOD'}
              </span>
            </div>
            <div className="font-body-md text-on-surface-variant/80 mt-2">{activePeriod?.nature || ''}</div>
          </div>
        </div>
        {activePeriod && (
          <div className="flex flex-col items-center gap-2">
            <p className="font-body-md text-on-surface-variant text-center max-w-md">
              {fmtTime12(activePeriod.start)} — {fmtTime12(activePeriod.end)}
            </p>
            <div className="text-secondary font-display text-xl font-medium">{timeRemaining}</div>
          </div>
        )}
      </section>

      {/* Info Cards */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {brahmaCard && (
          <div className="md:col-span-7 bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                <h4 className="font-label-caps text-secondary text-[13px] tracking-widest">OPTIMAL SADHANA WINDOW</h4>
              </div>
              <div>
                <h3 className="font-headline-lg text-primary mb-2">Brahma Muhurta</h3>
                <p className="font-body-md text-on-surface-variant/80 max-w-sm">
                  The 48-minute period before sunrise, your most potent window for meditation.
                </p>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="font-display text-3xl text-on-surface">{fmtTime12(brahmaCard.start)}</span>
                <span className="font-body-md text-secondary font-medium italic">— {brahmaCard.when}</span>
              </div>
            </div>
          </div>
        )}

        {nextAuspicious && (
          <div className="md:col-span-5 bg-white border border-outline-variant/40 rounded-xl p-8 flex flex-col justify-center space-y-6">
            <div className="font-label-caps text-on-surface-variant/50 tracking-widest text-[11px]">UPCOMING TRANSITION</div>
            <div>
              <h4 className="font-headline-md text-primary">{nextAuspicious.label}</h4>
              <p className="text-[13px] text-on-surface-variant mt-1 italic">{nextAuspicious.nature}</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-display text-on-surface">{fmtTime12(nextAuspicious.start)} — {fmtTime12(nextAuspicious.end)}</div>
              <div className="text-sm font-body-md text-secondary font-medium">
                Starts in {Math.max(0, minutesBetween(now, nextAuspicious.start))} min
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant/20 flex gap-4">
              <div className="flex-1">
                <span className="block text-[10px] font-label-caps text-on-surface-variant/60">TITHI</span>
                <span className="text-sm font-medium">{panchang.tithi.paksha} {panchang.tithi.name}</span>
              </div>
              <div className="flex-1">
                <span className="block text-[10px] font-label-caps text-on-surface-variant/60">MOON</span>
                <span className="text-sm font-medium">{panchang.moon.rashi}</span>
              </div>
            </div>
          </div>
        )}

        {/* Panchang Strip */}
        <div className="md:col-span-12 bg-primary-container p-1 rounded-full flex items-center">
          <div className="w-full bg-surface border border-outline-variant/30 rounded-full flex flex-wrap md:flex-nowrap justify-between items-center px-4 md:px-10 py-3 gap-4 overflow-hidden">
            <PStripItem label="TITHI" value={`${panchang.tithi.paksha} ${panchang.tithi.name}`} />
            <Divider />
            <PStripItem label="NAKSHATRA" value={panchang.nakshatra.name} />
            <Divider />
            <PStripItem label="YOGA" value={panchang.yoga.name} />
            <Divider />
            <PStripItem label="KARANA" value={panchang.karana.name} />
            <Divider />
            <PStripItem label="VARA" value={panchang.vara.name} upper />
          </div>
        </div>
      </section>

      <section className="text-center text-xs text-on-surface-variant/50 font-label-caps tracking-widest">
        {fmtDateLong(panchang.date).toUpperCase()} · {location.label || `${location.lat}, ${location.lon}`} · AYANAMSA: {ayanamsa.toUpperCase()}
      </section>
    </main>
  );
}

function PStripItem({ label, value, upper }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-label-caps text-on-surface-variant/60">{label}:</span>
      <span className={`text-[12px] font-bold text-primary ${upper ? 'uppercase' : ''}`}>{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="hidden md:block w-[1px] h-4 bg-outline-variant/30" />;
}
