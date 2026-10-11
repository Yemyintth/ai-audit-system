import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'red' | 'green' | 'orange';
  trend?: string;
}

export default function StatCard({ label, value, icon: Icon, color, trend }: StatCardProps) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' }
  };
  const c = colorMap[color];

  return (
    <div className={'bg-white p-5 rounded-xl shadow-sm border-l-4 hover:shadow-md transition-all duration-200 ' + c.border}>
      <div className='flex items-start justify-between mb-2'>
        <span className='text-slate-500 text-sm font-medium'>{label}</span>
        <div className={'p-2 rounded-lg ' + c.bg}>
          <Icon size={18} className={c.text} />
        </div>
      </div>
      <div className={'text-2xl font-bold ' + c.text}>{value}</div>
      {trend && <div className='text-xs text-slate-400 mt-1'>{trend}</div>}
    </div>
  );
}
