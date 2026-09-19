import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { Toast } from '../components/Toast';
import { PlayerBar } from '../components/PlayerBar';
import { QueueDrawer } from '../components/QueueDrawer';
import { AddToPlaylistModal } from '../components/AddToPlaylistModal';
import { usePlayer } from '../context/PlayerContext';
import { Home, Search, Compass, Library, History, Sliders } from 'lucide-react';

const mobileNavItems = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/discover', label: 'AI Radar', icon: Compass },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/history', label: 'History', icon: History },
  { to: '/preferences', label: 'Tastes', icon: Sliders },
];

export const AppLayout = () => {
  const { currentTrack } = usePlayer();

  return (
    <div className="min-h-screen bg-[#090a10] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />

        <main
          className={`flex-1 px-4 sm:px-8 py-6 max-w-full overflow-hidden ${
            currentTrack ? 'pb-36 md:pb-28' : 'pb-24 md:pb-8'
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* Global Persistent Audio Player */}
      <PlayerBar />

      {/* Slide-over Queue Drawer */}
      <QueueDrawer />

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal />

      {/* Mobile bottom sticky navigation bar */}
      <nav
        className={`md:hidden fixed left-0 right-0 z-40 bg-[#0d0f1a]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around transition-all ${
          currentTrack ? 'bottom-[66px]' : 'bottom-0'
        }`}
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <Toast />
    </div>
  );
};

