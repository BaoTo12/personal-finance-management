import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface IconBoxProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'dark' | 'glass';
}

export const IconBox: React.FC<IconBoxProps> = ({ children, className, variant = 'dark' }) => {
  const variants = {
    primary: 'bg-primary text-text-1',
    secondary: 'bg-secondary text-white',
    dark: 'bg-dark-hover text-white',
    glass: 'bg-white/5 backdrop-blur-md text-white border border-white/10'
  };

  return (
    <div className={twMerge(clsx('flex items-center justify-center rounded-xl transition-all duration-300', variants[variant], className))}>
      {children}
    </div>
  );
};