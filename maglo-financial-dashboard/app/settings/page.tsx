'use client';

import React from 'react';
import { User, Bell, Lock, Globe, Moon, Sun } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppStore } from '../../store';

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
   <div className="bg-dark-card rounded-3xl p-6 border border-white/5 mb-6 shadow-sm">
      <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">{title}</h3>
      <div className="space-y-6">
         {children}
      </div>
   </div>
);

const Toggle: React.FC<{ active?: boolean; onClick?: () => void }> = ({ active, onClick }) => (
   <div 
     onClick={onClick}
     className={clsx("w-12 h-6 rounded-full relative transition-colors cursor-pointer", active ? "bg-primary" : "bg-dark-hover border border-white/10")}
   >
      <div className={clsx("absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all", active ? "left-7" : "left-1")}></div>
   </div>
);

export default function SettingsPage() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <div className="max-w-4xl mx-auto pb-10">
       <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

       <SettingsSection title="Profile Information">
          <div className="flex flex-col md:flex-row items-start gap-6">
             <div className="relative self-center md:self-start">
                <img src="https://picsum.photos/100/100" alt="Profile" className="w-24 h-24 rounded-3xl object-cover border-4 border-dark-bg shadow-xl" />
                <button className="absolute bottom-0 right-0 p-2 bg-primary text-text-1 rounded-xl shadow-lg hover:scale-105 transition-transform">
                   <User size={16} />
                </button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                <div className="space-y-2">
                   <label className="text-xs font-medium text-text-2 uppercase">Full Name</label>
                   <input type="text" defaultValue="Alex Morgan" className="w-full bg-dark-bg border border-white/5 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none" />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-medium text-text-2 uppercase">Email Address</label>
                   <input type="email" defaultValue="alex.morgan@example.com" className="w-full bg-dark-bg border border-white/5 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none" />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-medium text-text-2 uppercase">Phone Number</label>
                   <input type="tel" defaultValue="+1 (555) 123-4567" className="w-full bg-dark-bg border border-white/5 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none" />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-medium text-text-2 uppercase">Location</label>
                   <input type="text" defaultValue="New York, USA" className="w-full bg-dark-bg border border-white/5 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none" />
                </div>
             </div>
          </div>
          <div className="flex justify-end mt-4">
             <button className="px-6 py-3 bg-white text-text-1 font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg">Save Changes</button>
          </div>
       </SettingsSection>

       <SettingsSection title="Preferences">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center"><Bell size={20} /></div>
                <div>
                   <h4 className="font-semibold text-white">Notifications</h4>
                   <p className="text-xs text-text-2">Receive email alerts for transactions</p>
                </div>
             </div>
             <Toggle active />
          </div>
          
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center transition-colors", theme === 'dark' ? "bg-purple-500/10 text-purple-500" : "bg-orange-500/10 text-orange-500")}>
                   {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                   <h4 className="font-semibold text-white">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</h4>
                   <p className="text-xs text-text-2">Switch between dark and light themes</p>
                </div>
             </div>
             <Toggle active={theme === 'dark'} onClick={toggleTheme} />
          </div>

          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-success/10 text-success flex items-center justify-center"><Lock size={20} /></div>
                <div>
                   <h4 className="font-semibold text-white">2FA Authentication</h4>
                   <p className="text-xs text-text-2">Extra security for your account</p>
                </div>
             </div>
             <Toggle />
          </div>
       </SettingsSection>
    </div>
  );
}