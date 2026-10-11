import { useEffect, useState } from 'react';
import { Shield, Save, AlertTriangle, Filter, Eye, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAuditHistory, saveReview, fetchAuditDetail } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AuditReview() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [status, setStatus] = useState('under_review');
  const [comment, setComment] = useState('');
  const [saved, setSaved] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    fetchAuditHistory(filter, search).then(r => setItems(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const selectItem = async (it: any) => {
    setSelected(it);
    try {
      const r = await fetchAuditDetail(it.transaction_id);
      setDetail(r.data);
    } catch (e) { console.error(e); }
  };

  const save = async () => {
    if (!selected) return;
    try {
      await saveReview(selected.transaction_id, status, comment);
      setSaved('Review saved: ' + selected.transaction_id);
      setTimeout(() => setSaved(''), 3000);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-slate-800"><Shield size={28} /> Audit Review</h2>
        <p className="text-slate-500 mt-1 text-sm">Review and decide on flagged transactions</p>
      </div>

      {saved && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">{saved}</div>}

      <div className="card">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2">
            <Filter size={18} className="text-slate-400" />
            <input type="text" placeholder="Search transaction..." value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()}
              className="flex-1 outline-none text-sm" />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input py-2 text-sm">
            <option value="all">All Records</option>
            <option value="suspicious">Suspicious Only</option>
            <option value="normal">Normal Only</option>
            <option value="critical">Critical</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button onClick={load} className="btn btn-primary">Search</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-3 text-sm">Queue ({items.length})</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {items.map(it => (
              <div key={it.anomaly_id} onClick={() => selectItem(it)}
                className={'p-3 rounded-lg border cursor-pointer ' + (selected?.anomaly_id === it.anomaly_id ? 'bg-blue-50 border-blue-300' : 'hover:bg-slate-50 border-slate-200')}>
                <div className="flex justify-between items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs md:text-sm">{it.transaction_id}</span>
                  <div className="flex gap-1">
                    <span className={'badge text-xs ' + (it.is_suspicious ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}>
                      {it.is_suspicious ? 'SUSPICIOUS' : 'NORMAL'}
                    </span>
                    <span className="badge bg-slate-100 text-slate-600 text-xs">{(it.severity || 'normal').toUpperCase()}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-1">Score: {(it.anomaly_score || 0).toFixed(3)} | ${(it.amount || 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          {!selected ? (
            <div className="text-center py-10 text-slate-500">
              <AlertTriangle size={40} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm">Select a transaction</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="font-semibold text-sm">Transaction: {selected.transaction_id}</h3>
                <Link to={'/transactions/' + selected.transaction_id} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <Eye size={12} /> Full Detail
                </Link>
              </div>

              {detail?.transaction && (
                <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-lg">
                  <div className="flex justify-between"><span className="text-slate-500">Account:</span><span className="font-semibold">{detail.transaction.account_id}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Amount:</span><span className="font-semibold">${detail.transaction.amount?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Category:</span><span className="font-semibold">{detail.transaction.category}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Time:</span><span className="font-semibold">{detail.transaction.timestamp}</span></div>
                </div>
              )}

              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-xs flex justify-between mb-1">
                  <span className="text-slate-600">Anomaly Score</span>
                  <span className="font-bold text-red-600">{(selected.anomaly_score || 0).toFixed(3)}</span>
                </div>
                <div className="bg-slate-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: Math.min((selected.anomaly_score || 0) * 100, 100) + '%' }} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Decision</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="input text-sm">
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="confirmed_anomaly">Confirmed Anomaly</option>
                  <option value="false_positive">False Positive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Comment</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} className="input text-sm" placeholder="Audit observation..." />
              </div>
              <button onClick={save} className="btn btn-primary w-full justify-center text-sm"><Save size={14} /> SAVE REVIEW</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
