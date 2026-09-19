import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Toast } from '../components/Toast';
import { LayoutDashboard, Compass, Music, History, BarChart3, Sliders } from 'lucide-react';

const mobileNavItems = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/catalog', label: 'Library', icon: Music },
  { to: '/history', label: 'History', icon: History },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/preferences', label: 'Tastes', icon: Sliders },
];

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main className="flex-1 px-4 sm:px-8 py-6 pb-24 md:pb-8 max-w-full overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom sticky navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0f1a]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <Toast />
    </div>
  );
};
