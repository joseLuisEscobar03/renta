import React from 'react';

export default function Badge({ variant = 'gray', children, className = '' }) {
  const variantStyles = {
    green: 'bg-brand-green-light text-brand-green-dark border-transparent',
    red: 'bg-brand-red-light text-brand-red border-transparent',
    amber: 'bg-brand-amber-light text-brand-amber border-transparent',
    blue: 'bg-brand-blue-light text-brand-blue border-transparent',
    gray: 'bg-brand-surface2 text-brand-text2 border-brand-border'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
        variantStyles[variant] || variantStyles.gray
      } ${className}`}
    >
      {children}
    </span>
  );
}
