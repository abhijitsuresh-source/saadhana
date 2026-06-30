import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

const DEFAULT_LOCATION = { lat: 16.8302, lon: 75.7100, label: 'Vijayapura, Karnataka' };

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() => {
    const saved = localStorage.getItem('sadhana_location');
    return saved ? JSON.parse(saved) : DEFAULT_LOCATION;
  });
  const [ayanamsa, setAyanamsa] = useState(() => localStorage.getItem('sadhana_ayanamsa') || 'lahiri');

  useEffect(() => {
    localStorage.setItem('sadhana_location', JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    localStorage.setItem('sadhana_ayanamsa', ayanamsa);
  }, [ayanamsa]);

  return (
    <LocationContext.Provider value={{ location, setLocation, ayanamsa, setAyanamsa, DEFAULT_LOCATION }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useAppLocation() {
  return useContext(LocationContext);
}
