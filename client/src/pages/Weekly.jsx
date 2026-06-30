import { useEffect, useState } from 'react';
import { fetchWeeklyPanchang } from '../api';
import { useAppLocation } from '../LocationContext';
import { fmtTime12 } from '../utils';

export default function Weekly() {
  const { location, ayanamsa } = useAppLocation();
  const [days, setDays] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchWeeklyPanchang({ lat: location.lat, lon: location.lon, ayanamsa })
      .then((data) => {
        setDays(data.days);
        const todayStr = new Date().toISOString().slice(0, 10);
        const idx = data.days.findIndex((d) => d.date === todayStr);
        setActiveIdx(idx >= 0 ? idx : 0);
      })
      .finally(() => setLoading(false));
  }, [location.lat, location.lon, ayanamsa]);

  if (loading || days.length === 0) {
    return <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-24 text-center">
      <p className="font-label-caps text-on-surface-variant/60 tracking-widest">LOADING…</p>
    </main>;
  }

  const active = days[activeIdx];
  const score = auspiciousnessScore(active);

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
      <section className="mb-12">
        <h2 className="font-headline-lg text-headline-lg mb-2">Weekly Rhythm</h2>
        <p className="text-on-surface-variant font-body-md max-w-2xl">Align your practices with the celestial flow across the week.</p>
      </section>

      <section className="mb-16 flex overflow-x-auto gap-4 pb-6">
        {days.map((d, i) => {
          const s = auspiciousnessScore(d);
          const date = new Date(d.date + 'T00:00:00');
          const isActive = i === activeIdx;
          return (
            <button
              key={d.date}
              onClick={() => setActiveIdx(i)}
              className={`flex-shrink-0 w-48 p-6 rounded-xl border text-left transition-all ${
                isActive ? 'border-primary bg-white shadow-lg' : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="block font-label-caps text-on-surface-variant/70 uppercase">
                    {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                  </span>
                  <span className={`block font-headline-md text-headline-md ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                    {date.getDate()}
                  </span>
                </div>
              </div>
              <div className="mb-4 text-left">
                <span className="block text-[14px] font-bold text-on-surface">{d.vara.name} Vāra</span>
                <span className="px-2 py-0.5 inline-block mt-1 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase">
                  {d.tithi.name}
                </span>
              </div>
              <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-tertiary-container" style={{ width: `${s}%` }} />
              </div>
              <span className="block mt-2 text-[10px] font-label-caps text-right">{s}% Auspicious</span>
            </button>
          );
        })}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-4 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30">
          <h3 className="font-headline-md text-headline-md mb-6">
            {new Date(active.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h3>
          <div className="space-y-6">
            {active.muhurtas.brahma && <TimelineItem time={fmtTime12(active.muhurtas.brahma.start)} title="Brahma Muhurta" desc="Ideal for meditation and deep study." color="border-primary" />}
            {active.sun.sunrise && <TimelineItem time={fmtTime12(active.sun.sunrise)} title="Sunrise" desc="Sun offerings and Surya Namaskar." color="border-secondary" />}
            {active.inauspicious.rahuKalam && <TimelineItem time={`${fmtTime12(active.inauspicious.rahuKalam.start)} – ${fmtTime12(active.inauspicious.rahuKalam.end)}`} title="Rahu Kaal" desc="Avoid starting new significant ventures." color="border-outline-variant" muted />}
            {active.muhurtas.abhijit && <TimelineItem time={fmtTime12(active.muhurtas.abhijit.start)} title="Abhijit Muhurta" desc="Auspicious midday window." color="border-primary" />}
          </div>
        </div>

        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-surface-container-high/30 p-8 rounded-xl border border-outline-variant/30 flex flex-col justify-between min-h-[220px]">
            <div>
              <h4 className="font-label-caps text-on-surface-variant mb-4">Celestial Influence</h4>
              <p className="font-display text-2xl text-on-surface leading-tight">
                Moon in {active.nakshatra.name} Nakshatra, {active.moon.rashi} Rashi.
              </p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-lg text-on-surface mb-2">Day Panchang</h4>
              <p className="text-on-surface-variant text-sm">
                {active.tithi.paksha} {active.tithi.name} · {active.yoga.name} Yoga · {active.karana.name} Karana
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function TimelineItem({ time, title, desc, color, muted }) {
  return (
    <div className={`relative pl-8 ${muted ? 'opacity-50' : ''}`}>
      <div className={`absolute left-0 top-1.5 w-6 h-6 bg-white border-2 ${color} rounded-full flex items-center justify-center`}>
        <div className="w-2 h-2 bg-current rounded-full" />
      </div>
      <span className="font-label-caps text-primary text-[10px]">{time}</span>
      <h4 className="font-bold text-on-surface mt-1">{title}</h4>
      <p className="text-sm text-on-surface-variant">{desc}</p>
    </div>
  );
}

function auspiciousnessScore(d) {
  // Heuristic: weight choghadiya nature distribution across the day
  const weights = { Best: 100, Good: 75, Neutral: 50, Loss: 30, Bad: 10 };
  const all = [...(d.choghadiya?.day || [])];
  if (all.length === 0) return 50;
  const avg = all.reduce((sum, c) => sum + (weights[c.nature] || 50), 0) / all.length;
  return Math.round(avg);
}
