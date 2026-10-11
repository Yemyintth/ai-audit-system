import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, AlertTriangle, Activity, Settings, Brain, FileText, Shield, Database, ChevronDown, Users, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Anomalies from './pages/Anomalies';
import Admin from './pages/Admin';
import MLAnalysis from './pages/MLAnalysis';
import AuditReview from './pages/AuditReview';
import Reports from './pages/Reports';
import DataGeneration from './pages/DataGeneration';
import Bots from './pages/Bots';
import Models from './pages/Models';
import TransactionDetail from './pages/TransactionDetail';

interface NavGroup {
  label: string;
  icon: any;
  items: { path: string; label: string; icon: any }[];
}

function Layout({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => { setOpenDropdown(null); setMobileMenu(false); }, [loc.pathname]);

  const navGroups: NavGroup[] = [
    { label: 'Overview', icon: LayoutDashboard, items: [{ path: '/', label: 'Dashboard', icon: LayoutDashboard }] },
    { label: 'Data', icon: Database, items: [
      { path: '/transactions', label: 'Transactions', icon: CreditCard },
      { path: '/data-generation', label: 'Data Generation', icon: Database },
      { path: '/bots', label: 'Bots Info', icon: Users },
    ]},
    { label: 'Detection', icon: Brain, items: [
      { path: '/anomalies', label: 'Anomalies', icon: AlertTriangle },
      { path: '/ml-analysis', label: 'ML Analysis', icon: Brain },
      { path: '/models', label: 'ML Models', icon: BookOpen },
    ]},
    { label: 'Audit', icon: Shield, items: [
      { path: '/audit-review', label: 'Audit Review', icon: Shield },
      { path: '/reports', label: 'Reports', icon: FileText },
    ]},
    { label: 'Admin', icon: Settings, items: [{ path: '/admin', label: 'Admin Panel', icon: Settings }] },
  ];

  const isGroupActive = (group: NavGroup) => group.items.some(i => i.path === loc.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-slate-900 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-blue-600 p-2 rounded-lg"><Activity size={22} /></div>
            <div>
              <h1 className="font-bold text-base leading-tight">AI Audit System</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Risk Assessment Platform</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {navGroups.map(group => {
              const GroupIcon = group.icon;
              const active = isGroupActive(group);
              const isOpen = openDropdown === group.label;
              const isSingle = group.items.length === 1;
              if (isSingle) {
                return (
                  <Link key={group.label} to={group.items[0].path}
                    className={'px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-medium ' + (active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800')}>
                    <GroupIcon size={16} />
                    <span>{group.label}</span>
                  </Link>
                );
              }
              return (
                <div key={group.label} className="relative">
                  <button onClick={() => setOpenDropdown(isOpen ? null : group.label)}
                    className={'px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-medium ' + (active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800')}>
                    <GroupIcon size={16} />
                    <span>{group.label}</span>
                    <ChevronDown size={12} className={isOpen ? 'rotate-180' : ''} />
                  </button>
                  {isOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-slate-800 rounded-lg shadow-xl min-w-[200px] py-2 z-50">
                      {group.items.map(item => {
                        const ItemIcon = item.icon;
                        const itemActive = loc.pathname === item.path;
                        return (
                          <Link key={item.path} to={item.path}
                            className={'px-4 py-2 flex items-center gap-3 text-sm ' + (itemActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white')}>
                            <ItemIcon size={14} />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 rounded hover:bg-slate-800">
            <Activity size={20} />
          </button>
        </div>

        {mobileMenu && (
          <div className="lg:hidden bg-slate-800 px-4 py-2">
            {navGroups.map(group => (
              <div key={group.label} className="mb-2">
                <div className="text-xs font-semibold text-slate-400 px-2 py-1">{group.label}</div>
                {group.items.map(item => {
                  const ItemIcon = item.icon;
                  const itemActive = loc.pathname === item.path;
                  return (
                    <Link key={item.path} to={item.path}
                      className={'px-3 py-2 flex items-center gap-2 text-sm rounded ' + (itemActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700')}>
                      <ItemIcon size={14} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6" onClick={() => setOpenDropdown(null)}>{children}</main>
      <footer className="bg-slate-900 text-slate-400 text-center py-3 text-xs">AI Audit System - Master Project 2024</footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/:id" element={<TransactionDetail />} />
          <Route path="/anomalies" element={<Anomalies />} />
          <Route path="/ml-analysis" element={<MLAnalysis />} />
          <Route path="/models" element={<Models />} />
          <Route path="/audit-review" element={<AuditReview />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/data-generation" element={<DataGeneration />} />
          <Route path="/bots" element={<Bots />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
export default App;
