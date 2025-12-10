import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { useAppStore } from '../store';
import { IconBox } from './ui/IconBox';

export const Header: React.FC = () => {
  const { toggleSidebar } = useAppStore();

  return (
    <header className="flex items-center justify-between py-5 px-6 lg:px-8 mb-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-text-2 hover:text-white bg-dark-card rounded-xl"
        >
          <Menu size={24} />
        </button>
        
        <div className="hidden md:flex items-center gap-2 text-text-1">
          <h2 className="text-2xl font-bold text-white">Overview</h2>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-dark-card border border-white/5 rounded-2xl px-4 py-3 w-80 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
          <Search size={18} className="text-text-3 mr-3" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            className="bg-transparent border-none outline-none text-sm text-white placeholder-text-3 w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="relative">
            <IconBox className="w-12 h-12 rounded-2xl hover:bg-dark-card border border-white/5">
              <Bell size={20} className="text-text-2" />
            </IconBox>
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-error rounded-full border-2 border-dark-bg"></span>
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="text-right hidden md:block">
              <div className="text-sm font-semibold text-white">Alex Morgan</div>
              <div className="text-xs text-text-3">Premium User</div>
            </div>
            <img 
              src="https://picsum.photos/100/100" 
              alt="Profile" 
              className="w-12 h-12 rounded-2xl border-2 border-dark-card object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};