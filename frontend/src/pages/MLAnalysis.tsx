import { useEffect, useState } from 'react';
import { Brain, Play, CheckCircle, Award, AlertCircle, TrendingUp, BarChart3, Settings, Trash2 } from 'lucide-react';
import { fetchMethods, runDetection, compareAllMethods, fetchSettings } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const STORAGE_KEY = 'ml_selected_method';
const RESULT_KEY = 'ml_last_result';
const COMPARE_KEY = 'ml_last_compare';

export default function MLAnalysis() {
  const [methods, setMethods] = useState<any>(null);
  const [selected, setSelected] = useState(() => sessionStorage.getItem(STORAGE_KEY) || '');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(() => {
    // Restore from sessionStorage on mount
    try {
      const saved = sessionStorage.getItem(RESULT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);
  const [compareResults, setCompareResults] = useState<any>(() => {
    try {
      const saved = sessionStorage.getItem(COMPARE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [comparing, setComparing] = useState(false);
  const [adminSettings, setAdminSettings] = useState<any>(null);

  useEffect(() => {
    Promise.all([fetchMethods(), fetchSettings()])
      .then(([m, s]) => {
        setMethods(m.data);
        setAdminSettings(s.data);
        if (!sessionStorage.getItem(STORAGE_KEY) && s.data.default_method) {
          setSelected(s.data.default_method);
          sessionStorage.setItem(STORAGE_KEY, s.data.default_method);
        }
      })
      .catch((e) => {
        console.error('Load error:', e);
        if (!sessionStorage.getItem(STORAGE_KEY)) setSelected('ensemble');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selected) sessionStorage.setItem(STORAGE_KEY, selected);
  }, [selected]);

  // Save result to sessionStorage whenever it changes
  useEffect(() => {
    if (result) {
      try { sessionStorage.setItem(RESULT_KEY, JSON.stringify(result)); } catch {}
    }
  }, [result]);

  useEffect(() => {
    if (compareResults) {
      try { sessionStorage.setItem(COMPARE_KEY, JSON.stringify(compareResults)); } catch {}
    }
  }, [compareResults]);

  const run = async () => {
    if (!selected) return;
    setRunning(true);
    setResult(null);
    sessionStorage.removeItem(RESULT_KEY);
    try {
      const r = await runDetection(selected, 5000);
      setResult(r.data);
    } catch (e: any) {
      setResult({ error: e.response?.data?.error || e.message || 'Detection failed' });
    } finally {
      setRunning(false);
    }
  };

  const compare = async () => {
    setComparing(true);
    try {
      const r = await compareAllMethods();
      setCompareResults(r.data);
    } catch (e) { console.error(e); }
    finally { setComparing(false); }
  };

  const clearResult = () => {
    setResult(null);
    sessionStorage.removeItem(RESULT_KEY);
  };

  const clearCompare = () => {
    setCompareResults(null);
    sessionStorage.removeItem(COMPARE_KEY);
  };

  if (loading) return <LoadingSpinner />;

  const getRankBadge = (rank: string) => {
    if (rank === 'best') return <span className="badge bg-green-100 text-green-700 inline-flex items-center gap-1"><Award size={12} /> BEST</span>;
    if (rank === 'worst') return <span className="badge bg-red-100 text-red-700 inline-flex items-center gap-1"><AlertCircle size={12} /> WORST</span>;
    return null;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-slate-800">
          <Brain size={28} /> ML Analysis
        </h2>
        <p className="text-slate-500 mt-1 text-sm">Select method, run detection, see REAL results</p>
      </div>

      {adminSettings && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs flex flex-wrap items-center gap-3">
          <Settings size={14} className="text-blue-600" />
          <span className="text-slate-700">
            Admin: <strong>Threshold {adminSettings.anomaly_threshold}</strong> | <strong> High-risk {adminSettings.high_risk_threshold}</strong> | <strong> Default {adminSettings.default_method}</strong>
          </span>
        </div>
      )}

      {methods && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card border-l-4 border-green-500">
            <div className="text-xs text-slate-500">Best</div>
            <div className="text-lg font-bold text-green-600 capitalize">{methods.best_method}</div>
          </div>
          <div className="card border-l-4 border-red-500">
            <div className="text-xs text-slate-500">Worst</div>
            <div className="text-lg font-bold text-red-600 capitalize">{methods.worst_method}</div>
          </div>
          <div className="card border-l-4 border-blue-500">
            <div className="text-xs text-slate-500">Recommended</div>
            <div className="text-lg font-bold text-blue-600 capitalize">{methods.recommended}</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h3 className="font-semibold text-lg">Select Detection Method</h3>
          <button onClick={compare} disabled={comparing} className="btn btn-primary text-xs disabled:opacity-50">
            <BarChart3 size={14} /> {comparing ? 'Comparing...' : 'Compare All'}
          </button>
        </div>
        <div className="space-y-2">
          {methods?.methods?.map((m: any) => {
            const isSelected = selected === m.id;
            const isDefault = adminSettings?.default_method === m.id;
            return (
              <label key={m.id}
                className={'flex items-center gap-3 p-3 md:p-4 rounded-lg border cursor-pointer transition-all ' + (isSelected ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' : 'hover:bg-slate-50 border-slate-200')}>
                <input type="radio" name="method" checked={isSelected} onChange={() => setSelected(m.id)} className="w-4 h-4" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{m.name}</span>
                    {getRankBadge(m.rank)}
                    {isDefault && <span className="badge bg-blue-100 text-blue-700 text-xs">DEFAULT</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{m.description}</div>
                  <div className="flex gap-3 mt-1 text-xs flex-wrap">
                    <span>F1: <strong>{(m.f1 * 100).toFixed(0)}%</strong></span>
                    <span>Speed: <strong>{m.speed}</strong></span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
        <button onClick={run} disabled={running || !selected} className="btn btn-primary mt-4 w-full md:w-auto justify-center disabled:opacity-50">
          <Play size={16} /> {running ? 'Running...' : 'RUN DETECTION (' + (selected ? selected.replace('_', ' ') : '...') + ')'}
        </button>
      </div>

      {result && !result.error && (
        <div className="card">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" /> Result - {result.method_name}
            </h3>
            <button onClick={clearResult} className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1">
              <Trash2 size={12} /> Clear Result
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg"><div className="text-slate-500 text-xs">Analyzed</div><div className="text-lg md:text-2xl font-bold text-blue-700">{result.analyzed?.toLocaleString()}</div></div>
            <div className="bg-red-50 p-3 rounded-lg"><div className="text-slate-500 text-xs">Anomalies</div><div className="text-lg md:text-2xl font-bold text-red-700">{result.anomalies_detected?.toLocaleString()}</div></div>
            <div className="bg-orange-50 p-3 rounded-lg"><div className="text-slate-500 text-xs">Rate</div><div className="text-lg md:text-2xl font-bold text-orange-700">{result.anomaly_rate}%</div></div>
            <div className="bg-purple-50 p-3 rounded-lg"><div className="text-slate-500 text-xs">Time</div><div className="text-lg md:text-2xl font-bold text-purple-700">{result.processing_time}s</div></div>
          </div>
          {result.applied_threshold !== undefined && (
            <div className="bg-slate-50 p-2 rounded text-xs mb-3">
              Applied: Threshold <strong>{result.applied_threshold}</strong> | High-risk <strong>{result.high_risk_threshold}</strong>
            </div>
          )}
          {result.severity_breakdown && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <div className="p-2 bg-red-50 rounded text-center"><div className="text-xs text-slate-500">Critical</div><div className="font-bold text-red-700">{result.severity_breakdown.critical}</div></div>
              <div className="p-2 bg-orange-50 rounded text-center"><div className="text-xs text-slate-500">High</div><div className="font-bold text-orange-700">{result.severity_breakdown.high}</div></div>
              <div className="p-2 bg-yellow-50 rounded text-center"><div className="text-xs text-slate-500">Medium</div><div className="font-bold text-yellow-700">{result.severity_breakdown.medium}</div></div>
              <div className="p-2 bg-blue-50 rounded text-center"><div className="text-xs text-slate-500">Low</div><div className="font-bold text-blue-700">{result.severity_breakdown.low}</div></div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="p-3 bg-slate-50 rounded-lg text-center"><div className="text-xs text-slate-500">Precision</div><div className="font-bold">{(result.metrics.precision * 100).toFixed(0)}%</div></div>
            <div className="p-3 bg-slate-50 rounded-lg text-center"><div className="text-xs text-slate-500">Recall</div><div className="font-bold">{(result.metrics.recall * 100).toFixed(0)}%</div></div>
            <div className="p-3 bg-slate-50 rounded-lg text-center"><div className="text-xs text-slate-500">F1</div><div className="font-bold">{(result.metrics.f1 * 100).toFixed(0)}%</div></div>
            <div className="p-3 bg-slate-50 rounded-lg text-center"><div className="text-xs text-slate-500">AUC</div><div className="font-bold">{(result.metrics.roc_auc * 100).toFixed(0)}%</div></div>
          </div>
          {result.comparison && (
            <div className="bg-slate-50 p-3 rounded text-sm flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              Rank <strong>#{result.comparison.your_method_rank.position}/{result.comparison.your_method_rank.total}</strong> ({result.comparison.your_method_rank.label})
            </div>
          )}
        </div>
      )}

      {result?.error && <div className="card bg-red-50 border-red-200 text-red-700 text-sm">Error: {result.error}</div>}

      {compareResults?.results && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">All Methods Comparison</h3>
            <button onClick={clearCompare} className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1">
              <Trash2 size={12} /> Clear
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 text-left text-xs font-semibold">Rank</th>
                  <th className="p-3 text-left text-xs font-semibold">Method</th>
                  <th className="p-3 text-left text-xs font-semibold">Anomalies</th>
                  <th className="p-3 text-left text-xs font-semibold">Rate</th>
                  <th className="p-3 text-left text-xs font-semibold">F1</th>
                </tr>
              </thead>
              <tbody>
                {compareResults.results.map((r: any) => (
                  <tr key={r.method} className={'border-t ' + (r.rank === 1 ? 'bg-green-50' : r.rank === compareResults.results.length ? 'bg-red-50' : '')}>
                    <td className="p-3 text-sm font-bold">#{r.rank}</td>
                    <td className="p-3 text-sm font-medium">{r.name}</td>
                    <td className="p-3 text-sm">{r.anomalies}</td>
                    <td className="p-3 text-sm">{r.rate}%</td>
                    <td className="p-3 text-sm font-semibold">{(r.f1 * 100).toFixed(0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
