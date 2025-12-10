
import React from 'react';
import { LayoutDashboard, Wallet, ArrowRightLeft, FileText, User, Settings, LogOut, CreditCard, X } from 'lucide-react';
import { useAppStore } from '../store';
import { clsx } from 'clsx';
import { NavLink, useNavigate } from 'react-router-dom';

const NavItemComponent: React.FC<{ icon: React.ReactNode; label: string; to: string }> = ({ icon, label, to }) => (
  <NavLink
    to={to}
    className={({ isActive }) => clsx(
      "flex items-center w-full gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
      isActive 
        ? "bg-primary text-text-1 font-bold shadow-[0_4px_20px_rgba(200,238,68,0.2)]" 
        : "text-text-2 hover:bg-dark-hover hover:text-white"
    )}
  >
    {({ isActive }) => (
      <>
        <div className={clsx("relative z-10 transition-transform duration-300 group-hover:scale-110", isActive && "scale-110")}>
          {icon}
        </div>
        <span className="relative z-10 text-sm tracking-wide">{label}</span>
        {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />}
      </>
    )}
  </NavLink>
);

export const Sidebar: React.FC = () => {
  const { isSidebarOpen, toggleSidebar, logout } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/signin');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={clsx(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleSidebar}
      />

      {/* Sidebar Container */}
      <aside 
        className={clsx(
          "flex flex-col w-72 h-screen fixed left-0 top-0 bg-dark-card border-r border-white/5 p-6 z-50 transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-2 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-primary to-green-300 rounded-xl flex items-center justify-center text-text-1 font-bold text-xl shadow-lg shadow-primary/20">
              M
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Maglo.</h1>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden p-1 text-text-2 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          <div className="px-4 mb-3 text-xs font-bold text-text-3 uppercase tracking-widest opacity-80">Menu</div>
          <NavItemComponent icon={<LayoutDashboard size={20} />} label="Dashboard" to="/" />
          <NavItemComponent icon={<ArrowRightLeft size={20} />} label="Transactions" to="/transactions" />
          <NavItemComponent icon={<Wallet size={20} />} label="My Wallet" to="/wallet" />
          <NavItemComponent icon={<FileText size={20} />} label="Invoices" to="/invoices" />
          
          <div className="px-4 mt-8 mb-3 text-xs font-bold text-text-3 uppercase tracking-widest opacity-80">General</div>
          <NavItemComponent icon={<CreditCard size={20} />} label="Cards" to="/cards" />
          <NavItemComponent icon={<Settings size={20} />} label="Settings" to="/settings" />
        </nav>

        {/* User Mini Profile / Logout */}
        <div className="mt-auto pt-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-2xl hover:bg-error/10 hover:text-error text-text-2 transition-all group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};