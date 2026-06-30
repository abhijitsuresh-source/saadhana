import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/daily', label: 'Daily', icon: 'event_note' },
  { to: '/weekly', label: 'Weekly', icon: 'view_week' },
  { to: '/monthly', label: 'Monthly', icon: 'calendar_month' },
  { to: '/yearly', label: 'Yearly', icon: 'calendar_view_month' }
];

export default function Layout() {
  return (
    <div className="font-body-md text-on-background min-h-screen pb-24 md:pb-0">
      <header className="bg-surface sticky top-0 z-50 flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary cursor-pointer">menu</span>
          <h1 className="font-display text-headline-md text-primary tracking-tight">Sādhana</h1>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `font-label-caps tracking-widest text-[11px] transition-colors ${
                  isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                }`
              }
            >
              {item.label.toUpperCase()}
            </NavLink>
          ))}
        </nav>
      </header>

      <Outlet />

      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface-container-lowest md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 transition-all ${
                isActive ? 'text-primary bg-secondary-container/20 rounded-xl -translate-y-0.5' : 'text-on-surface-variant/70'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-label-caps text-[10px] mt-1">{item.label.toUpperCase()}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
