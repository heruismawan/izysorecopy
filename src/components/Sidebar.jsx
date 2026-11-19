import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  Smartphone, 
  RefreshCw, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  UserCheck, 
  FileText,
  Sun,
  Moon,
  LogOut,
  Wrench,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Sidebar = ({ activeView, setActiveView, closeMobileDrawer }) => {
  const { currentUser, setCurrentUser, theme, toggleTheme } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [dragX, setDragX] = useState(0); // For smooth swipe feedback

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
    setDragX(0);
  };

  const handleTouchMove = (e) => {
    if (touchStartX === null || touchStartY === null) return;
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    
    const diffX = currentX - touchStartX;
    const diffY = currentY - touchStartY;

    // Determine if it's a horizontal swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Prevent default scrolling when swiping horizontally
      // Note: passive: false is needed on the event listener for preventDefault to work properly,
      // but simple visual feedback can just use state
      
      // Calculate allowed drag
      let allowedDrag = diffX;
      
      // If mobile, we are swiping to close the drawer
      if (window.innerWidth < 768) {
        if (diffX < 0) { // Swiping left to close
          allowedDrag = diffX;
        } else {
          allowedDrag = 0; // Don't drag right past the edge
        }
      } else {
        // Desktop collapsing
        if (isCollapsed && diffX < 0) allowedDrag = 0; // Already collapsed, don't go further left
        if (!isCollapsed && diffX > 0) allowedDrag = 0; // Already expanded, don't go further right
      }
      
      setDragX(allowedDrag);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    // Only trigger horizontal swipe if X movement is significant and greater than Y movement
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        // Swiped left
        if (window.innerWidth < 768) {
          closeMobileDrawer?.();
        } else {
          setIsCollapsed(true);
        }
      } else {
        // Swiped right
        if (window.innerWidth >= 768) {
          setIsCollapsed(false);
        }
      }
    }
    
    setDragX(0);
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const menuItems = [
    {
      id: 'pos',
      label: 'POS / Kasir',
      icon: ShoppingBag,
      allowedRoles: ['kasir', 'kepala toko', 'owner'],
      color: 'hover:text-orange-600 hover:bg-orange-50 dark:hover:text-orange-400 dark:hover:bg-orange-950/20'
    },
    {
      id: 'inventory',
      label: 'Stok / Inventory',
      icon: Smartphone,
      allowedRoles: ['kasir', 'kepala toko', 'owner'],
      color: 'hover:text-emerald-600 hover:bg-emerald-50 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/20'
    },
    {
      id: 'tradein',
      label: 'Tukar Tambah',
      icon: RefreshCw,
      allowedRoles: ['kasir', 'kepala toko', 'owner'],
      color: 'hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950/20'
    },
    {
      id: 'servis',
      label: 'Transaksi Servis',
      icon: Wrench,
      allowedRoles: ['kasir', 'kepala toko', 'owner'],
      color: 'hover:text-amber-600 hover:bg-amber-50 dark:hover:text-amber-400 dark:hover:bg-amber-950/20'
    },
    {
      id: 'transactions',
      label: 'Riwayat Penjualan',
      icon: FileText,
      allowedRoles: ['kasir', 'kepala toko', 'owner'],
      color: 'hover:text-orange-600 hover:bg-orange-50 dark:hover:text-orange-400 dark:hover:bg-orange-950/20'
    },
    {
      id: 'warranty',
      label: 'Cek Garansi',
      icon: ShieldCheck,
      allowedRoles: ['kasir', 'kepala toko', 'owner'],
      color: 'hover:text-purple-600 hover:bg-purple-50 dark:hover:text-purple-400 dark:hover:bg-purple-950/20'
    },
    {
      id: 'reports',
      label: 'Laporan Keuangan',
      icon: TrendingUp,
      allowedRoles: ['owner'],
      color: 'hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-950/20'
    },
    {
      id: 'usermanagement',
      label: 'Manajemen Akun',
      icon: Users,
      allowedRoles: ['owner'],
      color: 'hover:text-slate-800 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800/40'
    }
  ];



  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: dragX !== 0 ? `translateX(${dragX}px)` : 'translateX(0px)',
        transition: dragX !== 0 ? 'none' : 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}
      className={`${isCollapsed ? 'w-[88px]' : 'w-64'} bg-white dark:bg-slate-900 rounded-3xl border border-white/60 dark:border-slate-800/40 shadow-neo dark:shadow-neo-dark h-[calc(100dvh-2rem)] m-4 flex flex-col justify-between overflow-y-auto scrollbar-none sticky top-4`}
    >
      {/* Sidebar Top: Logo / Brand & Dark Mode Toggle */}
      <div>
        <div className={`p-4 bg-orange-100/30 dark:bg-orange-950/10 border-b border-slate-100 dark:border-slate-800/40 text-left flex ${isCollapsed ? 'flex-col justify-center gap-4' : 'justify-between gap-2'} items-center relative`}>
          {/* Toggle Collapse Button for Mouse Users */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="absolute top-2 right-2 p-1 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 hover:bg-orange-200 hover:scale-110 transition-all z-10"
              title="Kecilkan Sidebar"
            >
              <ChevronLeft size={14} />
            </button>
          )}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="absolute top-1 right-1 p-1 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 hover:bg-orange-200 hover:scale-110 transition-all z-10"
              title="Perbesar Sidebar"
            >
              <ChevronRight size={14} />
            </button>
          )}

          <div className={`flex items-center ${isCollapsed ? 'justify-center mt-2' : 'gap-2.5 min-w-0'}`}>
            <img src={logoImg} alt="Izy Store Logo" className="w-9 h-9 object-contain rounded-full border border-orange-100/50 dark:border-orange-900/30 shadow-sm" />
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-black tracking-wide text-orange-700 dark:text-orange-400 m-0 truncate">
                  izy store
                </h1>
                <p className="text-[8px] font-extrabold uppercase tracking-widest text-orange-600 dark:text-orange-450 mt-0.5 opacity-85">
                  POS-Gadget v1.0
                </p>
              </div>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/40 dark:border-slate-700/50 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 ${!isCollapsed ? 'mr-5' : ''}`}
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {theme === 'dark' ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-slate-600" />}
          </button>
        </div>

        {/* Sidebar Middle: Menu Items */}
        <nav className="p-4 flex flex-col gap-2.5">
          {menuItems.map((item) => {
            const isAllowed = item.allowedRoles.includes(currentUser.role);
            if (!isAllowed) return null;

            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                title={isCollapsed ? item.label : ''}
                className={`
                  w-full py-3 rounded-2xl font-bold uppercase text-[10px] tracking-wider flex items-center 
                  text-left transition-all duration-200 select-none cursor-pointer border border-transparent
                  ${isCollapsed ? 'justify-center px-0' : 'gap-3.5 px-4.5'}
                  ${isActive 
                    ? 'bg-slate-800 dark:bg-orange-500 text-white dark:text-slate-950 shadow-md dark:shadow-[inset_0_2px_4px_rgba(255,255,255,0.35),_0_8px_16px_rgba(249,115,22,0.2)] scale-100 border-white/20 dark:border-orange-400/20' 
                    : `bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-[inset_0_2px_3px_rgba(255,255,255,0.8),_0_2px_4px_rgba(15,23,42,0.04)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),_0_2px_4px_rgba(0,0,0,0.15)] ${item.color} hover:scale-[1.03] hover:shadow-md active:scale-[0.97]`
                  }
                `}
              >
                <Icon size={16} strokeWidth={2.5} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Bottom: Active Session & Log Out */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-950/20">
        <div className={`w-full bg-white dark:bg-slate-800/80 border border-slate-200/20 dark:border-slate-700/30 rounded-2xl shadow-neo dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),_0_4px_8px_rgba(0,0,0,0.3)] ${isCollapsed ? 'p-2 flex flex-col gap-3 items-center relative' : 'px-4 py-3.5 flex flex-col gap-3'}`}>
          
          {/* User Session Info */}
          <div className={`flex items-center select-none ${isCollapsed ? 'justify-center' : 'justify-between w-full'}`}>
            {!isCollapsed ? (
              <>
                <div className="text-left min-w-0">
                  <div className="text-xs font-black text-slate-700 dark:text-slate-200 truncate max-w-[150px] flex items-center gap-1.5">
                    <UserCheck size={14} className="text-emerald-500 shrink-0" />
                    <span className="truncate">{currentUser.name}</span>
                  </div>
                  {currentUser.email && (
                    <div className="text-[9px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[150px]">
                      {currentUser.email}
                    </div>
                  )}
                  <div className="text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">
                    Role: <span className="bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded-lg text-[8px] font-black">{currentUser.role}</span>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 border border-white dark:border-slate-800 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse shrink-0" />
              </>
            ) : (
              <div className="relative mt-1">
                <UserCheck size={20} className="text-emerald-500" title={currentUser.name} />
                <div className="w-2 h-2 rounded-full bg-emerald-400 border border-white dark:border-slate-800 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse absolute -top-1 -right-1" />
              </div>
            )}
          </div>

          {/* Refresh Manual Button */}
          <button
            onClick={() => window.location.reload()}
            className={`w-full mb-2 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm select-none ${isCollapsed ? 'px-0 gap-0' : 'gap-2'}`}
            title="Refresh Data"
          >
            <RefreshCw size={isCollapsed ? 16 : 12} strokeWidth={2.5} />
            {!isCollapsed && <span>Refresh Data</span>}
          </button>

          {/* Log Out Button */}
          <button
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin keluar dari IZYstore?')) {
                localStorage.removeItem('authToken');
                setCurrentUser(null);
                setActiveView('pos');
              }
            }}
            className={`w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/25 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/40 dark:border-red-900/30 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm select-none ${isCollapsed ? 'px-0 gap-0' : 'gap-2'}`}
            title="Keluar Akun"
          >
            <LogOut size={isCollapsed ? 16 : 12} strokeWidth={2.5} />
            {!isCollapsed && <span>Keluar Sistem</span>}
          </button>

        </div>
      </div>
    </div>
  );
};
export default Sidebar;
