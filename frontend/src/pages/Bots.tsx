import { useEffect, useState } from 'react';
import { Users, TrendingUp, AlertTriangle, CheckCircle, Play } from 'lucide-react';
import { fetchBots } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Bots() {
  const [bots, setBots] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBots().then(r => setBots(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading bots info..." />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
          <Users size={32} /> Bot Information
        </h2>
        <p className="text-slate-500 mt-1">How many accounts and transactions each bot creates</p>
      </div>

      <div className="card border-l-4 border-blue-500">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-lg"><TrendingUp size={28} className="text-blue-600" /></div>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-blue-800">{bots?.normal_bot?.name}</h3>
            <p className="text-slate-600 mt-1">{bots?.normal_bot?.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-blue-50 p-3 rounded-lg"><div className="text-xs text-slate-500">Accounts Created</div><div className="text-2xl font-bold text-blue-700">{bots?.normal_bot?.accounts_created?.toLocaleString()}</div></div>
              <div className="bg-blue-50 p-3 rounded-lg"><div className="text-xs text-slate-500">Transactions</div><div className="text-2xl font-bold text-blue-700">{bots?.normal_bot?.transactions_created?.toLocaleString()}</div></div>
              <div className="bg-blue-50 p-3 rounded-lg"><div className="text-xs text-slate-500">Business Hours</div><div className="text-lg font-bold text-blue-700">{bots?.normal_bot?.business_hours}</div></div>
              <div className="bg-blue-50 p-3 rounded-lg"><div className="text-xs text-slate-500">Avg Amount</div><div className="text-lg font-bold text-blue-700">${bots?.normal_bot?.avg_amount}</div></div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-semibold text-slate-700 mb-2">Transaction Patterns:</div>
              <div className="flex flex-wrap gap-2">
                {bots?.normal_bot?.patterns?.map((p: string, i: number) => (
                  <span key={i} className="badge bg-blue-100 text-blue-700">{p}</span>
                ))}
              </div>
            </div>
          </div>
          <CheckCircle size={24} className="text-green-500" />
        </div>
      </div>

      <div className="card border-l-4 border-red-500">
        <div className="flex items-start gap-4">
          <div className="bg-red-100 p-3 rounded-lg"><AlertTriangle size={28} className="text-red-600" /></div>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-red-800">{bots?.anomaly_bot?.name}</h3>
            <p className="text-slate-600 mt-1">{bots?.anomaly_bot?.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-red-50 p-3 rounded-lg"><div className="text-xs text-slate-500">Accounts Targeted</div><div className="text-2xl font-bold text-red-700">{bots?.anomaly_bot?.accounts_targeted?.toLocaleString()}</div></div>
              <div className="bg-red-50 p-3 rounded-lg"><div className="text-xs text-slate-500">Anomalies Created</div><div className="text-2xl font-bold text-red-700">{bots?.anomaly_bot?.transactions_created?.toLocaleString()}</div></div>
              <div className="bg-red-50 p-3 rounded-lg"><div className="text-xs text-slate-500">Anomaly Types</div><div className="text-2xl font-bold text-red-700">{bots?.anomaly_bot?.anomaly_types?.length}</div></div>
              <div className="bg-red-50 p-3 rounded-lg"><div className="text-xs text-slate-500">Status</div><div className="text-lg font-bold text-green-600 capitalize">{bots?.anomaly_bot?.status}</div></div>
            </div>
            <div className="mt-4">
              <div className="text-sm font-semibold text-slate-700 mb-2">Anomaly Types:</div>
              <div className="space-y-2">
                {bots?.anomaly_bot?.anomaly_types?.map((t: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <div>
                      <span className="font-mono text-sm font-semibold text-red-700">{t.type}</span>
                      <span className="text-xs text-slate-500 ml-2">{t.description}</span>
                    </div>
                    <span className="badge bg-red-100 text-red-700">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <CheckCircle size={24} className="text-green-500" />
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Bot Workflow</h3>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex-1 p-4 bg-blue-50 rounded-lg text-center">
            <div className="font-bold text-blue-800">Normal Bot</div>
            <div className="text-xs text-slate-600 mt-1">Creates 1,000 accounts</div>
            <div className="text-xs text-slate-600">Generates 73,500 normal txns</div>
          </div>
          <div className="text-2xl text-slate-400">→</div>
          <div className="flex-1 p-4 bg-orange-50 rounded-lg text-center">
            <div className="font-bold text-orange-800">Anomaly Bot</div>
            <div className="text-xs text-slate-600 mt-1">Targets 300 accounts</div>
            <div className="text-xs text-slate-600">Injects 1,500 anomalies</div>
          </div>
          <div className="text-2xl text-slate-400">→</div>
          <div className="flex-1 p-4 bg-green-50 rounded-lg text-center">
            <div className="font-bold text-green-800">Auditor ML Bot</div>
            <div className="text-xs text-slate-600 mt-1">Runs 5 ML models</div>
            <div className="text-xs text-slate-600">Detects 2,850 anomalies</div>
          </div>
        </div>
      </div>
    </div>
  );
}
