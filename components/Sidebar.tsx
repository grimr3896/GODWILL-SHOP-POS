
import React from 'react';
import { Tab } from '../types';
import { LayoutDashboard, Package, History, BarChart3, Settings, LogOut, ShoppingCart } from 'lucide-react';
import { SHOP_NAME } from '../constants';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { name: Tab.POS, icon: <ShoppingCart size={18} /> },
    { name: Tab.DASHBOARD, icon: <LayoutDashboard size={18} /> },
    { name: Tab.INVENTORY, icon: <Package size={18} /> },
    { name: Tab.HISTORY, icon: <History size={18} /> },
    { name: Tab.REPORTS, icon: <BarChart3 size={18} /> },
    { name: Tab.ADMIN, icon: <Settings size={18} /> },
  ];

  return (
    <aside className="w-64 dark-sidebar flex flex-col no-print h-full shrink-0">
      <div className="p-8 border-b border-white/5">
        <h1 className="text-lg font-black text-white flex items-center gap-2">
          {SHOP_NAME}
        </h1>
        <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black mt-1">Advanced POS</p>
      </div>

      <nav className="flex-1 py-6">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.name)}
            className={`w-full flex items-center gap-3 px-8 py-3.5 transition-all duration-300 relative group ${
              activeTab === item.name
                ? 'text-white'
                : 'text-white/40 hover:text-white/80'
            }`}
          >
            {activeTab === item.name && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-urgency shadow-[0_0_15px_#FF6D1F]"></div>
            )}
            <span className={`transition-colors duration-300 ${activeTab === item.name ? 'text-urgency' : ''}`}>
              {item.icon}
            </span>
            <span className="text-xs font-black tracking-tight">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-white/5">
        <button className="flex items-center gap-3 text-white/30 hover:text-red-400 transition-colors w-full group">
          <LogOut size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
