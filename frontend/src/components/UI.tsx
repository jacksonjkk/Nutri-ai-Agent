
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-[32px] p-6 shadow-sm border border-stone-100", className)}>
    {children}
  </div>
);

export const Button = ({
  children,
  onClick,
  className,
  variant = 'primary',
  disabled,
  type = 'button'
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}) => {
  const variants = {
    primary: "bg-[#5A5A40] text-white hover:bg-[#4A4A30]",
    secondary: "bg-[#F27D26] text-white hover:bg-[#D26D16]",
    outline: "border border-stone-200 text-stone-600 hover:bg-stone-50"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-6 py-3 rounded-full font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-stone-100 text-stone-600", className)}>
    {children}
  </span>
);
