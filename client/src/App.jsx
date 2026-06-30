import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LocationProvider } from './LocationContext';
import Layout from './Layout';
import Home from './pages/Home';
import Daily from './pages/Daily';
import Weekly from './pages/Weekly';
import Monthly from './pages/Monthly';
import Yearly from './pages/Yearly';
import Settings from './pages/Settings';

export default function App() {
  return (
    <LocationProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/daily" element={<Daily />} />
            <Route path="/weekly" element={<Weekly />} />
            <Route path="/monthly" element={<Monthly />} />
            <Route path="/yearly" element={<Yearly />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LocationProvider>
  );
}
