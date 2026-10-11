import { useEffect, useState } from 'react';
import { Settings, Database, Cpu, RefreshCw, Save, Trash2, AlertTriangle, CheckCircle, Activity, Server } from 'lucide-react';
import { fetchSystemStatus, fetchSystemInfo, fetchSettings, updateSettings, clearAnomalies, resetData } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Admin() {
  const [status, setStatus] = useState<any>(null);
  const [info, setInfo] = useState<any>(null);
  const [settings, setSettings] = useState<any>({ anomaly_threshold: 0.7, high_risk_threshold: 0.85, default_method: 'ensemble' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [showReset, setShowReset] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, i, st] = await Promise.all([fetchSystemStatus(), fetchSystemInfo(), fetchSettings()]);
      setStatus(s.data);
      setInfo(i.data);
      setSettings(st.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      setMsg('Settings saved!');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const clearAnoms = async () => {
    if (!confirm('Clear all anomaly records?')) return;
    try {
      await clearAnomalies();
      setMsg('Anomalies cleared');
      await load();
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { console.error(e); }
  };

  const reset = async () => {
    if (!confirm('Reset all data? This cannot be undone!')) return;
    try {
      await resetData();
      setMsg('Data reset complete');
      setShowReset(false);
      await load();
      setTimeout(() => setMsg(''), 3000);
    } catch (e) { console.error(e); }
  };

  if (loading) return <LoadingSpinner message="Loading admin panel..." />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-slate-800">
            <Settings size={28} /> Admin Panel
          </h2>
          <p className="text-slate-500 mt-1 text-sm">System configuration and management</p>
        </div>
        <button onClick={load} className="btn btn-primary"><RefreshCw size={16} /> Refresh</button>
      </div>

      {msg && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">{msg}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="card border-l-4 border-blue-500">
          <div className="flex items-center gap-2 text-slate-500 text-xs"><Database size={14} /> Accounts</div>
          <div className="text-2xl font-bold text-blue-600">{status?.total_accounts?.toLocaleString() || 0}</div>
        </div>
        <div className="card border-l-4 border-green-500">
          <div className="flex items-center gap-2 text-slate-500 text-xs"><Activity size={14} /> Transactions</div>
          <div className="text-2xl font-bold text-green-600">{status?.total_transactions?.toLocaleString() || 0}</div>
        </div>
        <div className="card border-l-4 border-red-500">
          <div className="flex items-center gap-2 text-slate-500 text-xs"><AlertTriangle size={14} /> Anomalies</div>
          <div className="text-2xl font-bold text-red-600">{status?.total_anomalies?.toLocaleString() || 0}</div>
        </div>
        <div className="card border-l-4 border-purple-500">
          <div className="flex items-center gap-2 text-slate-500 text-xs"><Server size={14} /> Status</div>
          <div className="text-sm font-bold capitalize">{status?.database === 'connected' ? 'Online' : 'Offline'}</div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Settings size={20} /> Detection Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Anomaly Threshold</label>
            <input type="number" step="0.05" min="0" max="1" value={settings.anomaly_threshold}
              onChange={e => setSettings({ ...settings, anomaly_threshold: parseFloat(e.target.value) })}
              className="input text-sm" />
            <div className="text-xs text-slate-500 mt-1">Default: 0.7</div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">High Risk Threshold</label>
            <input type="number" step="0.05" min="0" max="1" value={settings.high_risk_threshold}
              onChange={e => setSettings({ ...settings, high_risk_threshold: parseFloat(e.target.value) })}
              className="input text-sm" />
            <div className="text-xs text-slate-500 mt-1">Default: 0.85</div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Default Method</label>
            <select value={settings.default_method} onChange={e => setSettings({ ...settings, default_method: e.target.value })} className="input text-sm">
              <option value="isolation_forest">Isolation Forest</option>
              <option value="one_class_svm">One-Class SVM</option>
              <option value="autoencoder">Autoencoder</option>
              <option value="dbscan">DBSCAN</option>
              <option value="ensemble">Ensemble</option>
            </select>
          </div>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary mt-4 disabled:opacity-50">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Cpu size={20} /> System Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="font-semibold text-slate-700 mb-2">System</div>
            <div className="space-y-1 text-xs">
              <div><span className="text-slate-500">Name:</span> {info?.system?.name}</div>
              <div><span className="text-slate-500">Version:</span> {info?.system?.version}</div>
              <div><span className="text-slate-500">Status:</span> <span className="text-green-600 font-semibold">{info?.system?.status}</span></div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="font-semibold text-slate-700 mb-2">Database</div>
            <div className="space-y-1 text-xs">
              <div><span className="text-slate-500">Host:</span> {info?.database?.host}:{info?.database?.port}</div>
              <div><span className="text-slate-500">Name:</span> {info?.database?.name}</div>
              <div><span className="text-slate-500">Schemas:</span> {info?.database?.schemas?.join(', ')}</div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="font-semibold text-slate-700 mb-2">ML Engine</div>
            <div className="space-y-1 text-xs">
              <div><span className="text-slate-500">Methods:</span> {info?.ml_engine?.methods?.length}</div>
              <div><span className="text-slate-500">Best:</span> <span className="text-green-600 font-semibold">{info?.ml_engine?.best_method}</span></div>
              <div><span className="text-slate-500">Worst:</span> <span className="text-red-600 font-semibold">{info?.ml_engine?.worst_method}</span></div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="font-semibold text-slate-700 mb-2">Data</div>
            <div className="space-y-1 text-xs">
              <div><span className="text-slate-500">Total Amount:</span> ${(info?.data?.total_amount || 0).toLocaleString()}</div>
              <div><span className="text-slate-500">Anomalies:</span> {info?.data?.anomalies_detected?.toLocaleString()}</div>
              <div><span className="text-slate-500">Suspicious:</span> {info?.data?.suspicious?.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-l-4 border-red-500">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-red-700"><AlertTriangle size={20} /> Danger Zone</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center flex-wrap gap-3 p-3 bg-red-50 rounded-lg">
            <div>
              <div className="font-semibold text-sm">Clear All Anomalies</div>
              <div className="text-xs text-slate-600">Delete all anomaly records from database</div>
            </div>
            <button onClick={clearAnoms} className="btn bg-red-600 text-white hover:bg-red-700 text-sm">
              <Trash2 size={14} /> Clear Anomalies
            </button>
          </div>
          <div className="flex justify-between items-center flex-wrap gap-3 p-3 bg-red-50 rounded-lg">
            <div>
              <div className="font-semibold text-sm">Reset All Data</div>
              <div className="text-xs text-slate-600">Delete all anomalies and reviews</div>
            </div>
            <button onClick={reset} className="btn bg-red-600 text-white hover:bg-red-700 text-sm">
              <Trash2 size={14} /> Reset Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
