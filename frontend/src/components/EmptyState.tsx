import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-center'>
      <div className='bg-slate-100 p-6 rounded-full mb-4'>
        <Icon size={48} className='text-slate-400' />
      </div>
      <h3 className='text-xl font-semibold text-slate-700 mb-2'>{title}</h3>
      <p className='text-slate-500 mb-6 max-w-md'>{description}</p>
      {action && (
        <button onClick={action.onClick} className='btn btn-primary'>
          {action.label}
        </button>
      )}
    </div>
  );
}
