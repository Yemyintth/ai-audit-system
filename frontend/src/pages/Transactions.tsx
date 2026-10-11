import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPaginated } from '../api';
import { CreditCard, RefreshCw, Search, Eye } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

export default function Transactions() {
  const [data, setData] = useState<any>({ items: [], total: 0, page: 1, total_pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const load = () => {
    setLoading(true);
    fetchPaginated('transactions', page, limit, filter, search)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, limit, filter]);

  const onSearch = () => { setPage(1); load(); };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-slate-800"><CreditCard size={28} /> Transactions</h2>
          <p className="text-slate-500 mt-1 text-sm">{data.total?.toLocaleString()} total records</p>
        </div>
        <button onClick={load} className="btn btn-primary"><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Search by ID or Account..." value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSearch()}
              className="flex-1 outline-none text-sm" />
          </div>
          <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="input py-2 text-sm">
            <option value="all">All</option>
            <option value="anomaly">Anomalies Only</option>
            <option value="normal">Normal Only</option>
          </select>
          <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="input py-2 text-sm">
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
          <button onClick={onSearch} className="btn btn-primary">Search</button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : data.items?.length === 0 ? <EmptyState icon={CreditCard} title="No transactions" description="Try adjusting search" /> : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600">ID</th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600">Account</th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600">Amount</th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600">Category</th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600">Status</th>
                    <th className="p-3 text-left text-xs font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((t: any) => (
                    <tr key={t.transaction_id} className="table-row">
                      <td className="p-3 text-sm font-mono">{t.transaction_id}</td>
                      <td className="p-3 text-sm">{t.account_id}</td>
                      <td className="p-3 text-sm font-semibold">${parseFloat(t.amount || 0).toFixed(2)}</td>
                      <td className="p-3 text-sm"><span className="badge bg-slate-100 text-slate-600">{t.category || 'N/A'}</span></td>
                      <td className="p-3 text-sm">
                        {t.is_anomaly ? <span className="badge bg-red-100 text-red-700">ANOMALY</span> : <span className="badge bg-green-100 text-green-700">Normal</span>}
                      </td>
                      <td className="p-3 text-sm">
                        <Link to={'/transactions/' + t.transaction_id} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-medium">
                          <Eye size={14} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={data.page} totalPages={data.total_pages} onPageChange={setPage} />
          <div className="text-center text-sm text-slate-500">
            Showing {((data.page - 1) * data.limit) + 1} - {Math.min(data.page * data.limit, data.total)} of {data.total}
          </div>
        </>
      )}
    </div>
  );
}
