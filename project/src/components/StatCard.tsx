import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: 'navy' | 'blue' | 'green' | 'red' | 'amber' | 'gray';
  sub?: string;
}

const toneMap = {
  navy: 'bg-navy-700 text-white',
  blue: 'bg-accent-500 text-white',
  green: 'bg-emerald-500 text-white',
  red: 'bg-red-500 text-white',
  amber: 'bg-amber-500 text-white',
  gray: 'bg-gray-500 text-white',
};

export function StatCard({ title, value, icon: Icon, tone = 'navy', sub }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card border border-gray-100/80 transition hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneMap[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
