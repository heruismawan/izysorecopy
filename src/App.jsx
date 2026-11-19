import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import POSView from './views/POSView';
import InventoryView from './views/InventoryView';
import TradeInView from './views/TradeInView';
import TransactionsView from './views/TransactionsView';
import WarrantyView from './views/WarrantyView';
import ReportsView from './views/ReportsView';
import UserManagementView from './views/UserManagementView';
import LoginView from './views/LoginView';
import ServisView from './views/ServisView';
import { Menu, LogOut, Moon, Sun, RefreshCw } from 'lucide-react';
import logoImg from './assets/logo.png';

function ThemeTransitionOverlay() {
  const { isThemeTransitioning, transitioningTo } = useApp();
  
  return (
    <div 
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-slate-100/40 dark:bg-slate-900/40 backdrop-blur-xl transition-all duration-500 ease-in-out pointer-events-none
        ${isThemeTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}
      `}
    >
       <div className={`transform transition-all duration-700 ease-out ${isThemeTransitioning ? 'scale-100 rotate-0' : 'scale-50 -rotate-180'}`}>
          {transitioningTo === 'dark' ? (
             <Moon size={120} strokeWidth={1} className="text-slate-800 dark:text-slate-200 drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]" />
          ) : (
             <Sun size={120} strokeWidth={1} className="text-orange-500 drop-shadow-[0_0_40px_rgba(249,115,22,0.5)]" />
          )}
       </div>
    </div>
  );
}

function AppContent() {
  const [activeView, setActiveView] = useState('pos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, currentUser, setCurrentUser } = useApp();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // If not logged in, render the login view
  if (!currentUser) {
    return <LoginView />;
  }

  // Render the views with CSS block/hidden instead of unmounting them
  // to prevent losing state (e.g. form inputs) when switching tabs.

  return (
    <div className="flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 min-h-screen font-sans antialiased text-slate-700 dark:text-slate-200 select-none overflow-hidden">
      
      {/* Mobile Top Bar Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/40 px-4 flex justify-between items-center z-35">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="Izy Store Logo" className="w-8 h-8 object-contain rounded-full border border-orange-100/50" />
          <h1 className="text-base font-black tracking-wide text-orange-700 dark:text-orange-400 m-0">
            izy store
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh button for mobile */}
          <button
            onClick={() => window.location.reload()}
            className="p-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-100/50 dark:border-orange-900/30 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={16} strokeWidth={2.5} />
          </button>
          
          {/* Quick Ganti Akun button for mobile */}
          <button
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin keluar dan ganti akun?')) {
                localStorage.removeItem('authToken');
                setCurrentUser(null);
                setActiveView('pos');
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100/50 dark:border-red-900/30 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer font-extrabold uppercase text-[9px] tracking-wider"
            title="Keluar / Ganti Akun"
          >
            <LogOut size={12} strokeWidth={2.5} />
            <span>Ganti Akun</span>
          </button>
          
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-350 border border-slate-200/40 dark:border-slate-700/50 shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <Menu size={16} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* Spacer to push content below the fixed header on mobile */}
      <div className="h-16 md:hidden shrink-0" />

      {/* Responsive Sidebar Panel: Desktop Sidebar / Mobile slide-out overlay drawer */}
      <div className={`
        fixed inset-0 z-40 md:relative md:z-auto md:flex md:w-auto transition-all duration-300
        ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible md:opacity-100 md:visible'}
      `}>
        {/* Backdrop for mobile */}
        <div 
          className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
        {/* Sidebar Component container */}
        <div 
          onClick={() => setIsSidebarOpen(false)} // Close sidebar when clicking empty space
          className={`
            relative z-50 md:z-auto h-full flex w-full md:w-auto transition-transform duration-300 ease-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div onClick={(e) => e.stopPropagation()} className="h-full flex">
            <Sidebar 
              activeView={activeView} 
              setActiveView={(view) => {
                setActiveView(view);
                setIsSidebarOpen(false); // Auto close menu drawer on mobile item click
              }} 
              closeMobileDrawer={() => setIsSidebarOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Floating Main Content Area */}
      <main className="flex-1 min-w-0 h-[calc(100dvh-5rem)] md:h-[calc(100dvh-2rem)] overflow-y-auto p-4 md:p-6 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-white/60 dark:border-slate-800/40 shadow-neo dark:shadow-neo-dark-lg m-2 md:m-4 md:ml-2 transition-all duration-300">
        <div className="mx-auto max-w-7xl min-h-full">
          <div className={`min-h-full ${activeView === 'pos' || (activeView === 'reports' && currentUser?.role !== 'owner') ? 'block animate-fade-in-slide' : 'hidden'}`}>
            <POSView />
          </div>
          <div className={`min-h-full ${activeView === 'inventory' ? 'block animate-fade-in-slide' : 'hidden'}`}>
            <InventoryView />
          </div>
          <div className={`min-h-full ${activeView === 'tradein' ? 'block animate-fade-in-slide' : 'hidden'}`}>
            <TradeInView />
          </div>
          <div className={`min-h-full ${activeView === 'servis' ? 'block animate-fade-in-slide' : 'hidden'}`}>
            <ServisView />
          </div>
          <div className={`min-h-full ${activeView === 'transactions' ? 'block animate-fade-in-slide' : 'hidden'}`}>
            <TransactionsView />
          </div>
          <div className={`min-h-full ${activeView === 'warranty' ? 'block animate-fade-in-slide' : 'hidden'}`}>
            <WarrantyView />
          </div>
          {currentUser?.role === 'owner' && (
            <>
              <div className={`min-h-full ${activeView === 'reports' ? 'block animate-fade-in-slide' : 'hidden'}`}>
                <ReportsView />
              </div>
              <div className={`min-h-full ${activeView === 'usermanagement' ? 'block animate-fade-in-slide' : 'hidden'}`}>
                <UserManagementView />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <ThemeTransitionOverlay />
      <AppContent />
    </AppProvider>
  );
}

export default App;
