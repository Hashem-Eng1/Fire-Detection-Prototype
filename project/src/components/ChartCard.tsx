import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface ChartCardProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, icon: Icon, children, className = '' }: ChartCardProps) {
  return (
    <div className={`rounded-2xl bg-white p-5 shadow-card border border-gray-100/80 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">{title}</h3>
        {Icon && <Icon className="h-5 w-5 text-gray-400" />}
      </div>
      {children}
    </div>
  );
}
