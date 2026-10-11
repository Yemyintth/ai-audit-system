import { useEffect, useState } from 'react';
import { fetchStats, fetchAnomalies } from '../api';
import { Activity, AlertTriangle, DollarSign, TrendingUp, RefreshCw, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

interface Stats {
  total_transactions: number;
  suspicious: number;
  total_amount: number;
  flag_rate: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [s, a] = await Promise.all([fetchStats(), fetchAnomalies(0, 10)]);
      setStats(s.data);
      setAnomalies(a.data);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const normalCount = (stats?.total_transactions || 0) - (stats?.suspicious || 0);
  const suspiciousCount = stats?.suspicious || 0;

  const pieData = [
    { name: 'Normal', value: normalCount },
    { name: 'Suspicious', value: suspiciousCount },
  ];
  const COLORS = ['#22c55e', '#ef4444'];

  const barData = [
    { name: 'Normal', value: normalCount },
    { name: 'Suspicious', value: suspiciousCount },
  ];

  // Format money properly
  const formatMoney = (n: number) => {
    if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
    if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'K';
    return '$' + n.toFixed(2);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1 text-sm">Real-time monitoring of accounting transactions</p>
        </div>
        <button onClick={loadData} disabled={refreshing} className="btn btn-primary disabled:opacity-50">
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Transactions"
          value={(stats?.total_transactions || 0).toLocaleString()}
          icon={Activity}
          color="blue"
          trend="All records"
        />
        <StatCard
          label="Suspicious"
          value={(stats?.suspicious || 0).toLocaleString()}
          icon={AlertTriangle}
          color="red"
          trend="Requires review"
        />
        <StatCard
          label="Total Amount"
          value={formatMoney(stats?.total_amount || 0)}
          icon={DollarSign}
          color="green"
          trend="Money monitored"
        />
        <StatCard
          label="Flag Rate"
          value={(stats?.flag_rate || 0).toFixed(2) + '%'}
          icon={TrendingUp}
          color="orange"
          trend="Detection ratio"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Activity size={20} className="text-blue-600" /> Transaction Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                dataKey="value"
                label={({ name, percent }) => name + ' ' + ((percent || 0) * 100).toFixed(1) + '%'}
              >
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(value: any) => value.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" /> Detection Metrics
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: any) => value.toLocaleString()} />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-600" /> Recent Anomalies
        </h3>
        {anomalies.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Shield size={48} className="mx-auto mb-2 text-green-500" />
            <p className="text-sm">No recent anomalies detected</p>
          </div>
        ) : (
          <div className="space-y-2">
            {anomalies.slice(0, 5).map(a => (
              <div key={a.anomaly_id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={18} className="text-red-500" />
                  <div>
                    <div className="font-mono text-sm font-semibold">{a.transaction_id}</div>
                    <div className="text-xs text-slate-500">Score: {(a.anomaly_score || 0).toFixed(3)}</div>
                  </div>
                </div>
                <span className="badge bg-red-100 text-red-700">{(a.severity || 'normal').toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
