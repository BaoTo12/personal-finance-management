'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { clsx } from 'clsx';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Sidebar />
      <main 
        className={clsx(
          "transition-all duration-300 ease-in-out min-h-screen flex flex-col lg:pl-72",
        )}
      >
        <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
           <Header />
           <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
             {children}
           </div>
        </div>
      </main>
    </>
  );
};