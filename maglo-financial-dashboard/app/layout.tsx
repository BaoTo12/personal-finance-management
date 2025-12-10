'use client';

import React, { useEffect } from 'react';
import { Toaster } from 'sonner';
import { useAppStore } from '../store';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useAppStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-dark-bg text-white selection:bg-primary selection:text-text-1 font-sans transition-colors duration-300">
      {children}
      <Toaster position="top-right" theme={theme === 'light' ? 'light' : 'dark'} />
    </div>
  );
}