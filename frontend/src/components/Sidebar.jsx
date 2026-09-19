import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Search,
  Compass,
  Library,
  History,
  BarChart3,
  Sliders,
  User,
  Sparkles
} from 'lucide-react';

const navItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/search', label: 'Search & Explore', icon: Search },
  { to: '/discover', label: 'AI Taste Radar', icon: Compass, badge: 'ML' },
  { to: '/library', label: 'Your Library', icon: Library },
  { to: '/history', label: 'History', icon: History },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/preferences', label: 'Music Tastes', icon: Sliders },
  { to: '/profile', label: 'Profile', icon: User },
];


export const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-white/5 bg-[#0b0d16]/70 backdrop-blur-xl flex flex-col justify-between py-6 px-4 shrink-0 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/10 text-white border border-purple-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-cyan-400' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ML Engine Status Widget */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/60 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-purple-200">Content-Based ML</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          TF-IDF semantic vectorization + audio acoustic similarity active.
        </p>
      </div>
    </aside>
  );
};
