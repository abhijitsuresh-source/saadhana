import { useEffect, useState } from 'react';
import { fetchMonthlyPanchang } from '../api';
import { useAppLocation } from '../LocationContext';
import { localDateStr } from '../utils';

export default function Monthly() {
  const { location, ayanamsa } = useAppLocation();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchMonthlyPanchang({ year: cursor.year, month: cursor.month, lat: location.lat, lon: location.lon, ayanamsa })
      .then((data) => setDays(data.days))
      .finally(() => setLoading(false));
  }, [cursor.year, cursor.month, location.lat, location.lon, ayanamsa]);

  const monthLabel = new Date(cursor.year, cursor.month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const firstDayOfWeek = new Date(cursor.year, cursor.month - 1, 1).getDay();
  const todayStr = localDateStr();

  function shiftMonth(delta) {
    let m = cursor.month + delta, y = cursor.year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setCursor({ year: y, month: m });
  }

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12">
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">{monthLabel}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftMonth(-1)} className="p-2 rounded-full border border-outline-variant hover:bg-surface-container-low">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button onClick={() => setCursor({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 })} className="px-6 py-2 rounded-full border border-outline-variant font-label-caps text-primary">TODAY</button>
          <button onClick={() => shiftMonth(1)} className="p-2 rounded-full border border-outline-variant hover:bg-surface-container-low">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </section>

      {loading ? (
        <p className="text-center font-label-caps text-on-surface-variant/60 tracking-widest py-12">LOADING…</p>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm">
          <div className="grid grid-cols-7 border-b border-outline-variant/30">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
              <div key={d} className="py-4 text-center font-label-caps text-on-surface-variant/60">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-[1px] bg-outline-variant/20">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={'pad' + i} className="bg-surface-container-low/30 h-28 md:h-36" />
            ))}
            {days.map((d) => {
              const dayNum = new Date(d.date + 'T00:00:00').getDate();
              const isToday = d.date === todayStr;
              return (
                <div
                  key={d.date}
                  className={`h-28 md:h-36 p-3 flex flex-col justify-between ${isToday ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : 'bg-white hover:bg-primary/5'} transition-colors`}
                >
                  <div>
                    <span className={`font-display text-lg ${isToday ? 'text-primary font-bold' : 'text-on-surface'}`}>{dayNum}</span>
                    <p className="font-label-caps text-[10px] text-on-surface-variant/70 mt-1">{d.tithi.name}</p>
                  </div>
                  {d.muhurtas?.abhijit && (
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-tertiary-container" title="Abhijit Muhurta" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <section className="mt-8 pt-8 border-t border-outline-variant/30">
        <h3 className="font-label-caps text-on-surface-variant/60 mb-6 tracking-widest">CALENDAR LEGEND</h3>
        <div className="flex flex-wrap gap-8">
          <LegendItem color="bg-primary" label="Today" />
          <LegendItem color="bg-tertiary-container" label="Abhijit Muhurta present" />
        </div>
      </section>
    </main>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      <span className="font-body-md text-on-surface">{label}</span>
    </div>
  );
}
