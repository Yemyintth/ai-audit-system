import { useEffect, useState } from 'react';
import { BookOpen, CheckCircle, TrendingUp } from 'lucide-react';
import { fetchMLModels } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Models() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMLModels().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading ML models..." />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
          <BookOpen size={32} /> ML Models
        </h2>
        <p className="text-slate-500 mt-1">All machine learning models used in this system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card"><div className="text-slate-500 text-sm">Total Models</div><div className="text-2xl font-bold text-blue-600">{data?.total_models}</div></div>
        <div className="card"><div className="text-slate-500 text-sm">Best Model</div><div className="text-2xl font-bold text-green-600">{data?.best_model}</div></div>
        <div className="card"><div className="text-slate-500 text-sm">Training Data</div><div className="text-2xl font-bold text-slate-800">{data?.training_data?.toLocaleString()}</div></div>
        <div className="card"><div className="text-slate-500 text-sm">Features</div><div className="text-2xl font-bold text-slate-800">{data?.features_used?.length}</div></div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Features Used</h3>
        <div className="flex flex-wrap gap-2">
          {data?.features_used?.map((f: string, i: number) => (
            <span key={i} className="badge bg-slate-100 text-slate-700">{f}</span>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {data?.models?.map((m: any, i: number) => (
          <div key={i} className={'card border-l-4 ' + (m.name === 'Ensemble (Weighted Voting)' ? 'border-green-500 bg-green-50' : 'border-slate-300')}>
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-slate-800">{m.name}</h3>
                  {m.name === 'Ensemble (Weighted Voting)' && <CheckCircle size={20} className="text-green-600" />}
                </div>
                <div className="text-sm text-slate-500 mt-1">{m.type} - {m.algorithm}</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                  <div><span className="text-slate-500">Training:</span> <span className="font-semibold">{m.training}</span></div>
                  <div><span className="text-slate-500">Data:</span> <span className="font-semibold">{m.trained_on?.toLocaleString()}</span></div>
                  <div><span className="text-slate-500">Time:</span> <span className="font-semibold">{m.training_time}</span></div>
                  {m.epochs && <div><span className="text-slate-500">Epochs:</span> <span className="font-semibold">{m.epochs}</span></div>}
                  {m.n_estimators && <div><span className="text-slate-500">Trees:</span> <span className="font-semibold">{m.n_estimators}</span></div>}
                  {m.nu && <div><span className="text-slate-500">Nu:</span> <span className="font-semibold">{m.nu}</span></div>}
                  {m.eps && <div><span className="text-slate-500">Eps:</span> <span className="font-semibold">{m.eps}</span></div>}
                  {m.weights && <div className="col-span-2"><span className="text-slate-500">Weights:</span> <span className="font-mono text-xs">{JSON.stringify(m.weights)}</span></div>}
                </div>
                <div className="mt-3 text-xs">
                  <div className="text-green-700"><strong>+</strong> {m.strengths}</div>
                  <div className="text-red-700"><strong>-</strong> {m.weaknesses}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-blue-50 p-2 rounded"><div className="text-xs text-slate-500">Precision</div><div className="font-bold text-blue-700">{(m.precision * 100).toFixed(0)}%</div></div>
                <div className="bg-green-50 p-2 rounded"><div className="text-xs text-slate-500">Recall</div><div className="font-bold text-green-700">{(m.recall * 100).toFixed(0)}%</div></div>
                <div className="bg-orange-50 p-2 rounded"><div className="text-xs text-slate-500">F1</div><div className="font-bold text-orange-700">{(m.f1 * 100).toFixed(0)}%</div></div>
                <div className="bg-purple-50 p-2 rounded"><div className="text-xs text-slate-500">AUC</div><div className="font-bold text-purple-700">{(m.roc_auc * 100).toFixed(0)}%</div></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
