import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'whatsapp' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

export function getButtonClasses(
  variant: ButtonProps['variant'] = 'primary',
  size: ButtonProps['size'] = 'md',
  className = ''
): string {
  const base =
    'btn-pill inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: 'min-h-[44px] px-4 py-2 text-sm',
    md: 'min-h-[48px] px-6 py-2.5 text-base',
    lg: 'min-h-[52px] px-8 py-3.5 text-base md:text-lg',
  };

  const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
      'bg-[#EE6A2B] text-[#14110F] hover:bg-[#F37D44] active:bg-[#D95A1E] shadow-md',
    secondary:
      'bg-[#F4EBDD] text-[#14110F] hover:bg-[#FAF5ED] border border-[#14110F]/15',
    ghost:
      'bg-transparent text-[#F9F4EC] border border-[#F9F4EC]/35 hover:bg-[#F9F4EC]/10',
    whatsapp:
      'bg-[#25D366] text-[#14110F] hover:bg-[#2FE072] active:bg-[#1EBF5B] shadow-md font-bold',
    dark: 'bg-[#14110F] text-[#F9F4EC] hover:bg-[#2C221B] border border-[#F9F4EC]/15',
  };

  return `${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim();
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={getButtonClasses(variant, size, className)}
      {...props}
    >
      {children}
    </button>
  );
}
