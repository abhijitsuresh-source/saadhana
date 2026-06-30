import { useState } from 'react';
import { useAppLocation } from '../LocationContext';

const AYANAMSAS = [
  { id: 'lahiri', name: 'Lahiri (Chitra Paksha)', desc: 'Standard Government of India' },
  { id: 'raman', name: 'Raman', desc: "B.V. Raman's method" },
  { id: 'kp', name: 'KP (Krishnamurti)', desc: 'Modern stellar astrology' }
];

export default function Settings() {
  const { location, setLocation, ayanamsa, setAyanamsa, DEFAULT_LOCATION } = useAppLocation();
  const [city, setCity] = useState(location.label || '');
  const [lat, setLat] = useState(location.lat);
  const [lon, setLon] = useState(location.lon);
  const [status, setStatus] = useState('');

  function useGeolocation() {
    if (!navigator.geolocation) {
      setStatus('Geolocation not supported by this browser.');
      return;
    }
    setStatus('Locating…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude);
        setCity('Current location');
        setStatus('Location found.');
      },
      () => setStatus('Could not get location — enter manually.')
    );
  }

  function save() {
    setLocation({ lat: parseFloat(lat), lon: parseFloat(lon), label: city });
    setStatus('Saved.');
  }

  return (
    <main className="min-h-screen pt-12 pb-24 px-margin-mobile flex flex-col items-center max-w-screen-xl mx-auto">
      <section className="w-full max-w-2xl mb-16">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-4">Sacred Geography</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mb-8">
          Vedic timings are anchored to local sunrise at your coordinates.
        </p>

        <div className="space-y-2 mb-6">
          <label className="font-label-caps text-on-surface-variant">CITY / LABEL</label>
          <input
            className="w-full bg-transparent border-0 border-b border-outline-variant/50 py-4 font-body-lg focus:ring-0 focus:border-primary transition-colors"
            placeholder="e.g. Vijayapura, Karnataka"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="font-label-caps text-on-surface-variant">LATITUDE</label>
            <input type="number" step="0.0001" className="w-full bg-transparent border-0 border-b border-outline-variant/50 py-4 font-body-lg focus:ring-0 focus:border-primary" value={lat} onChange={(e) => setLat(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="font-label-caps text-on-surface-variant">LONGITUDE</label>
            <input type="number" step="0.0001" className="w-full bg-transparent border-0 border-b border-outline-variant/50 py-4 font-body-lg focus:ring-0 focus:border-primary" value={lon} onChange={(e) => setLon(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <button onClick={useGeolocation} className="px-6 py-3 border border-primary/30 text-primary rounded-full font-label-caps text-[11px] flex items-center gap-2">
            <span className="material-symbols-outlined text-base">near_me</span> USE CURRENT LOCATION
          </button>
          <button onClick={() => { setLat(DEFAULT_LOCATION.lat); setLon(DEFAULT_LOCATION.lon); setCity(DEFAULT_LOCATION.label); }} className="px-6 py-3 border border-outline-variant text-on-surface-variant rounded-full font-label-caps text-[11px]">
            RESET TO DEFAULT
          </button>
        </div>
        {status && <p className="text-sm text-secondary mb-4">{status}</p>}
      </section>

      <section className="w-full max-w-2xl mb-16">
        <h2 className="font-headline-md text-headline-md text-primary mb-6">Ayanamsa Calculator</h2>
        <div className="space-y-3">
          {AYANAMSAS.map((a) => (
            <label key={a.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer ${ayanamsa === a.id ? 'border-primary/20 bg-primary-container/5' : 'border-outline-variant/30'}`}>
              <input type="radio" name="ayanamsa" checked={ayanamsa === a.id} onChange={() => setAyanamsa(a.id)} className="text-primary focus:ring-primary border-outline-variant" />
              <div>
                <span className={`block font-medium ${ayanamsa === a.id ? 'text-primary' : 'text-on-surface'}`}>{a.name}</span>
                <span className="text-xs text-on-surface-variant uppercase tracking-tighter">{a.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </section>

      <button onClick={save} className="px-12 py-4 bg-primary text-white rounded-full font-label-caps tracking-widest hover:opacity-90 transition-opacity shadow-xl shadow-primary/10 flex items-center gap-3">
        SAVE & RECALCULATE
        <span className="material-symbols-outlined">auto_awesome</span>
      </button>
    </main>
  );
}
