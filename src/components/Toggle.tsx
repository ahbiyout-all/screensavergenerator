import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ElementType;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, description, icon: Icon }) => (
  <div className="flex items-center justify-between">
    <div className="flex-1 pr-4">
      <label className="font-medium text-sm text-neutral-900 flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4 text-neutral-500" />}
        {label}
      </label>
      {description && <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">{description}</p>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  </div>
);
