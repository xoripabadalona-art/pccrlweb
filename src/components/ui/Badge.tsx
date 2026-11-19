import React from 'react';

export interface BadgeProps {
  variant?: 'cream' | 'dark' | 'basil' | 'tomato' | 'orange';
  className?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = 'cream',
  className = '',
  children,
}: BadgeProps) {
  const styles: Record<NonNullable<BadgeProps['variant']>, string> = {
    cream: 'bg-[#E5D7C3] text-[#1A1512] border border-[#1A1512]/15',
    dark: 'bg-[#2C221B] text-[#F9F4EC] border border-[#F9F4EC]/15',
    basil: 'bg-[#3F6B3A] text-[#F9F4EC]',
    tomato: 'bg-[#C8372D] text-[#F9F4EC]',
    orange: 'bg-[#EE6A2B] text-[#14110F]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${styles[variant]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
