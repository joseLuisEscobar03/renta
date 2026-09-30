import React from 'react';

export default function StatCard({ label, value, subtext, color = 'neutral', icon: Icon }) {
  const valueColorClasses = {
    green: 'text-brand-green',
    red: 'text-brand-red',
    amber: 'text-brand-amber',
    neutral: 'text-brand-text'
  };

  return (
    <div className="bg-brand-surface border border-brand-border rounded-card p-4 shadow-card flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-brand-text3 uppercase tracking-wider">
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 text-brand-text3" />}
      </div>
      <div className={`text-2xl font-mono font-medium tracking-tight mt-1.5 ${valueColorClasses[color] || valueColorClasses.neutral}`}>
        {value}
      </div>
      {subtext && (
        <span className="text-[11px] text-brand-text3 mt-1">
          {subtext}
        </span>
      )}
    </div>
  );
}
