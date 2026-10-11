import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPaginated, fetchAnomalyStats } from '../api';
import { AlertTriangle, RefreshCw, Search, Eye, Shield, TrendingUp, Activity } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';

export default function Anomalies() {
  const [data, setData] = useState<any>({ items: [], total: 0, page: 1, total_pages: 0 });
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchPaginated('anomalies', page, limit, filter, search),
      fetchAnomalyStats()
    ]).then(([d, s]) => {
      setData(d.data);
      setStats(s.data);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, limit, filter]);

  const getStyle = (s: string) => {
    switch (s) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-slate-800">
            <AlertTriangle size={28} className="text-red-600" /> Suspicious Transactions
          </h2>
          <p className="text-slate-500 mt-1 text-sm">{data.total?.toLocaleString()} flagged</p>
        </div>
        <button onClick={load} className="btn btn-primary"><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card border-l-4 border-red-500">
          <div className="text-slate-500 text-xs">Suspicious</div>
          <div className="text-xl font-bold text-red-600">{stats?.suspicious?.toLocaleString() || 0}</div>
        </div>
        <div className="card border-l-4 border-red-700">
          <div className="text-slate-500 text-xs">Critical</div>
          <div className="text-xl font-bold text-red-700">{stats?.critical?.toLocaleString() || 0}</div>
        </div>
        <div className="card border-l-4 border-orange-500">
          <div className="text-slate-500 text-xs">High</div>
          <div className="text-xl font-bold text-orange-600">{stats?.high?.toLocaleString() || 0}</div>
        </div>
        <div className="card border-l-4 border-yellow-500">
          <div className="text-slate-500 text-xs">Medium</div>
          <div className="text-xl font-bold text-yellow-600">{stats?.medium?.toLocaleString() || 0}</div>
        </div>
        <div className="card border-l-4 border-blue-500">
          <div className="text-slate-500 text-xs">Low</div>
          <div className="text-xl font-bold text-blue-600">{stats?.low?.toLocaleString() || 0}</div>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white">
            <Search size={18} className="text-slate-400" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 outline-none text-sm" />
          </div>
          <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="input py-2 text-sm">
            <option value="all">All Severities</option>
            <option value="high">High / Critical</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }} className="input py-2 text-sm">
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
          </select>
          <button onClick={load} className="btn btn-primary">Search</button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : data.items?.length === 0 ? (
        <EmptyState icon={Shield} title="No anomalies" description="Run ML Detection to see anomalies" />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-red-50 border-b border-red-100">
                  <tr>
                    <th className="p-3 text-left text-xs font-semibold text-red-700">Transaction</th>
                    <th className="p-3 text-left text-xs font-semibold text-red-700">Score</th>
                    <th className="p-3 text-left text-xs font-semibold text-red-700">Severity</th>
                    <th className="p-3 text-left text-xs font-semibold text-red-700">Status</th>
                    <th className="p-3 text-left text-xs font-semibold text-red-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((a: any) => (
                    <tr key={a.anomaly_id} className="table-row bg-red-50/20">
                      <td className="p-3 text-sm font-mono">{a.transaction_id}</td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px]">
                            <div className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full" style={{ width: Math.min((a.anomaly_score || 0) * 100, 100) + '%' }} />
                          </div>
                          <span className="font-semibold text-red-600 text-sm">{(a.anomaly_score || 0).toFixed(3)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <span className={'badge border ' + getStyle(a.severity)}>{(a.severity || 'normal').toUpperCase()}</span>
                      </td>
                      <td className="p-3 text-sm">
                        {a.is_suspicious ? (
                          <span className="badge bg-red-100 text-red-700">SUSPICIOUS</span>
                        ) : (
                          <span className="badge bg-green-100 text-green-700">NORMAL</span>
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        <Link to={'/transactions/' + a.transaction_id} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs font-medium">
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
        </>
      )}
    </div>
  );
}
