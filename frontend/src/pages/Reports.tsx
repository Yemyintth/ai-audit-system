import { useState } from 'react';
import { FileText, Download, BarChart3 } from 'lucide-react';

export default function Reports() {
  const [type, setType] = useState('anomaly');

  const reports = [
    { id: 'anomaly', label: 'Anomaly Summary Report' },
    { id: 'high_risk', label: 'High-Risk Transactions' },
    { id: 'evaluation', label: 'Model Evaluation Report' },
    { id: 'monthly', label: 'Monthly Audit Report' },
  ];

  const generate = (format: string) => {
    let csv = 'Report Type,' + type + '\nGenerated,' + new Date().toISOString() + '\n\n';
    csv += 'Transaction ID,Anomaly Score,Severity\n';
    csv += 'TXN-DEMO-001,0.94,HIGH\nTXN-DEMO-002,0.87,HIGH\nTXN-DEMO-003,0.72,MEDIUM\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-report-' + type + '.' + format;
    a.click();
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-3 text-slate-800">
          <FileText size={32} /> Reports
        </h2>
        <p className="text-slate-500 mt-1">Generate audit reports for export</p>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-4">Report Type</h3>
        <div className="space-y-2">
          {reports.map(r => (
            <label key={r.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-50 cursor-pointer">
              <input type="radio" name="report" checked={type === r.id} onChange={() => setType(r.id)} className="w-4 h-4" />
              <span className="font-medium">{r.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex gap-2 flex-wrap">
          <button onClick={() => generate('csv')} className="btn btn-primary">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => generate('txt')} className="btn btn-primary">
            <Download size={16} /> Export TXT
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <BarChart3 size={20} /> Summary Preview
        </h3>
        <pre className="bg-slate-50 p-4 rounded-lg text-xs overflow-x-auto">
{`ANOMALOUS TRANSACTION AUDIT REPORT
=================================

Total Transactions:    75,016
Anomalous:             2,850
High Risk:             420
Medium Risk:           1,130
Low Risk:              1,300

Detection Model:       Ensemble
Top Features:          Amount, Z-Score, Time, Frequency`}
        </pre>
      </div>
    </div>
  );
}
