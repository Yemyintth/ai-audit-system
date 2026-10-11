import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle, Brain, Shield, Bot } from 'lucide-react';
import { explainTransaction, fetchBotReport } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TransactionDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [botReport, setBotReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([explainTransaction(id), fetchBotReport(id)])
        .then(([e, b]) => { setData(e.data); setBotReport(b.data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading..." />;
  if (!data || data.error) return <div className="text-center p-10 text-red-500">Error: {data?.error}</div>;

  return (
    <div className="space-y-4 md:space-y-6 animate-slide-up">
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/transactions" className="btn btn-primary"><ArrowLeft size={16} /> Back</Link>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">Transaction: {data.transaction_id}</h2>
          <p className="text-slate-500 text-xs md:text-sm">Detailed analysis and explanation</p>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-3">Transaction Data</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm">
          <div><div className="text-slate-500 text-xs">Account</div><div className="font-semibold">{data.account_id}</div></div>
          <div><div className="text-slate-500 text-xs">Amount</div><div className="font-semibold text-lg">${data.amount?.toLocaleString()}</div></div>
          <div><div className="text-slate-500 text-xs">Category</div><div className="font-semibold">{data.category}</div></div>
          <div><div className="text-slate-500 text-xs">Timestamp</div><div className="font-semibold text-xs">{data.timestamp}</div></div>
        </div>
      </div>

      <div className={'card border-l-4 ' + (data.is_anomaly ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50')}>
        <div className="flex items-center gap-3">
          {data.is_anomaly ? <AlertTriangle size={32} className="text-red-600 shrink-0" /> : <CheckCircle size={32} className="text-green-600 shrink-0" />}
          <div>
            <div className="text-xl md:text-2xl font-bold">{data.is_anomaly ? 'ANOMALY DETECTED' : 'NORMAL'}</div>
            <div className="text-xs md:text-sm text-slate-600">
              Score: {data.anomaly_score?.toFixed(3)} | Severity: {data.severity?.toUpperCase()} | Type: {data.anomaly_type}
            </div>
          </div>
        </div>
      </div>

      {botReport && !botReport.error && (
        <div className="card">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><Bot size={20} /> Bot Report - Why suspicious?</h3>
          <div className="space-y-2">
            {botReport.bot_reasons?.map((r: any, i: number) => (
              <div key={i} className={'p-3 rounded-lg border ' + (r.severity === 'high' ? 'bg-red-50 border-red-200' : r.severity === 'medium' ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200')}>
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div className="font-semibold text-sm text-slate-800">{r.bot} - {r.reason}</div>
                  <span className={'badge ' + (r.severity === 'high' ? 'bg-red-100 text-red-700' : r.severity === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600')}>{r.severity.toUpperCase()}</span>
                </div>
                <div className="text-xs text-slate-600 mt-1">{r.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><Brain size={20} /> ML Models Analysis</h3>
        <div className="space-y-2">
          {data.ml_models?.map((m: any, i: number) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg">
              <span className="font-medium text-sm">{m.name}</span>
              <div className="flex items-center gap-3">
                <span className={'badge ' + (m.result === 'Anomaly' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')}>{m.result}</span>
                <div className="w-24 md:w-32 bg-slate-200 rounded-full h-2">
                  <div className={'h-2 rounded-full ' + (m.result === 'Anomaly' ? 'bg-red-500' : 'bg-green-500')} style={{ width: (m.confidence * 100) + '%' }} />
                </div>
                <span className="text-sm font-mono w-12 text-right">{(m.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><Shield size={20} /> Why is this {data.is_anomaly ? 'suspicious' : 'normal'}?</h3>
        <div className="space-y-2">
          {data.reasons?.map((r: string, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
              <span className="text-sm">{r}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-3">Feature Importance (SHAP)</h3>
        <div className="space-y-3">
          {data.feature_importance?.map((f: any, i: number) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{f.feature}</span>
                <span className="font-mono text-slate-600">+{f.contribution.toFixed(3)}</span>
              </div>
              <div className="bg-slate-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-red-500 h-3 rounded-full" style={{ width: Math.min(f.contribution * 200, 100) + '%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={'card ' + (data.is_anomaly ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200')}>
        <div className="font-semibold">Recommendation</div>
        <div className="text-sm mt-1">{data.recommendation}</div>
      </div>
    </div>
  );
}
