
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './Theme';
import { DashboardIcon, AnalyticsIcon, KnowledgeBaseIcon, SettingsIcon } from './Icons';
import { Button } from './ui/CommonUI';

type AdminView = 'dashboard' | 'analytics' | 'kb' | 'settings';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => {
    return (
        <button onClick={onClick} className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 ${isActive ? 'bg-cyan-500/20 text-cyan-500 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            <span className="w-6 h-6 mr-3">{icon}</span>
            <span className="font-medium">{label}</span>
        </button>
    );
};

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-white/80 dark:bg-[#112E4A]/80 backdrop-blur-sm border-b border-slate-200 dark:border-[#334155] p-4 flex justify-between items-center sticky top-0 z-10">
      <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Admin Panel</h1>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button onClick={() => navigate('/')} variant="secondary">End-User View</Button>
      </div>
    </header>
  );
};


const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeView, setActiveView }) => {
    const navItems = [
        { id: 'dashboard', icon: <DashboardIcon className="w-full h-full" />, label: 'Dashboard' },
        { id: 'analytics', icon: <AnalyticsIcon className="w-full h-full" />, label: 'Analytics' },
        { id: 'kb', icon: <KnowledgeBaseIcon className="w-full h-full" />, label: 'Knowledge Base' },
        { id: 'settings', icon: <SettingsIcon className="w-full h-full" />, label: 'Settings' },
    ];

    return (
    <div className="min-h-screen flex text-slate-800 dark:text-slate-200">
      <aside className="w-64 bg-slate-100 dark:bg-[#061C31] p-4 flex-shrink-0 border-r border-slate-200 dark:border-[#334155]">
        <div className="flex items-center mb-8">
            <svg className="w-10 h-10 text-cyan-500 dark:text-cyan-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path></svg>
            <h1 className="text-2xl font-bold ml-2">PredictiveOps</h1>
        </div>
        <nav className="space-y-2">
            {navItems.map(item => (
                <NavItem 
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    isActive={activeView === item.id}
                    onClick={() => setActiveView(item.id as AdminView)}
                />
            ))}
        </nav>
      </aside>
      <main className="flex-1 bg-slate-50 dark:bg-[#0A2540]">
        <AdminHeader />
        <div className="p-8">
            {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
