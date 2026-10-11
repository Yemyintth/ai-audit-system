interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
      <button onClick={() => onPageChange(1)} disabled={page === 1} className="px-3 py-1.5 text-sm rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50">First</button>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="px-3 py-1.5 text-sm rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Prev</button>
      {start > 1 && <span className="px-2 text-slate-400">...</span>}
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className={'px-3 py-1.5 text-sm rounded border ' + (p === page ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 hover:bg-slate-50')}>
          {p}
        </button>
      ))}
      {end < totalPages && <span className="px-2 text-slate-400">...</span>}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="px-3 py-1.5 text-sm rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next</button>
      <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages} className="px-3 py-1.5 text-sm rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Last</button>
    </div>
  );
}
