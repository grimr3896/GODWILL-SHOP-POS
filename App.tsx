
import React, { useState, useEffect, useCallback } from 'react';
import { Tab, Product, Sale, ZReport, PaymentMethod } from './types';
import { INITIAL_PRODUCTS, MOCK_SALES, SHOP_NAME } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import POS from './components/POS';
import SalesHistory from './components/SalesHistory';
import Reports from './components/Reports';
import Admin from './components/Admin';
import { Shield, Lock, Unlock, ArrowRight } from 'lucide-react';

const LoginScreen: React.FC<{ onAuthorize: () => void, isDarkMode: boolean, systemPassword: string }> = ({ onAuthorize, isDarkMode, systemPassword }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === systemPassword) {
      onAuthorize();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-[1000] p-6 transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0f18]' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md p-10 rounded-[3rem] shadow-2xl border transition-all duration-300 ${error ? 'border-red-500 scale-105' : 'border-white/5'} ${isDarkMode ? 'bg-[#121926] shadow-black/50' : 'bg-white shadow-gray-200'}`}>
        <div className="flex flex-col items-center text-center space-y-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-inner ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <Shield size={40} className={error ? 'text-red-500' : 'text-urgency'} />
          </div>
          
          <div className="space-y-2">
            <h1 className={`text-2xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{SHOP_NAME}</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Secure Access Terminal</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                autoFocus
                placeholder="Enter Access Key..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full h-14 pl-12 pr-4 rounded-2xl text-sm font-bold outline-none transition-all border ${
                  error 
                    ? 'border-red-500 bg-red-500/5' 
                    : isDarkMode 
                      ? 'bg-gray-900 border-gray-700 focus:border-urgency text-white' 
                      : 'bg-gray-50 border-gray-200 focus:border-urgency text-gray-900'
                }`}
              />
            </div>
            
            <button
              type="submit"
              className="w-full h-14 bg-urgency text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-urgency/20 hover:bg-urgency/90 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Unlock System <ArrowRight size={16} />
            </button>
          </form>

          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">Authentication Failed</p>}
          <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Hardware ID: {navigator.userAgent.slice(0, 15)}</p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.POS);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [isDayClosed, setIsDayClosed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPersistent, setIsPersistent] = useState(false);
  const [storageUsage, setStorageUsage] = useState(0);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);
  const [currentZReport, setCurrentZReport] = useState<ZReport | null>(null);
  const [zReportHistory, setZReportHistory] = useState<ZReport[]>([]);
  
  const [shopSettings, setShopSettings] = useState({
    name: SHOP_NAME,
    footer: "Thank you for shopping at Godwill Shop! Quality is our promise.",
    autoBackupThreshold: 50,
    autoPrintReceipts: true,
    systemPassword: "626-JARVIS",
    inventoryPassword: "626-JARVIS"
  });

  const updateStorageMetrics = useCallback(async () => {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      setStorageUsage(used);
      
      const persistent = await navigator.storage.persisted();
      setIsPersistent(persistent);
    }
    const localUsed = JSON.stringify(localStorage).length;
    setStorageUsage(localUsed);
  }, []);

  // Hydration logic
  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem('godwill_products');
      const savedSales = localStorage.getItem('godwill_sales');
      const savedSettings = localStorage.getItem('godwill_settings');
      const savedTheme = localStorage.getItem('godwill_theme');
      const savedClosure = localStorage.getItem('godwill_day_closed');
      const savedZReport = localStorage.getItem('godwill_last_zreport');
      const savedZHistory = localStorage.getItem('godwill_zreport_history');
      
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedSales) {
        setSales(JSON.parse(savedSales).map((s: any) => ({ ...s, timestamp: new Date(s.timestamp) })));
      }
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Ensure new fields exist even if restoring from older backup
        setShopSettings({
          ...shopSettings,
          ...parsedSettings,
          systemPassword: parsedSettings.systemPassword || "626-JARVIS",
          inventoryPassword: parsedSettings.inventoryPassword || "626-JARVIS"
        });
      }
      if (savedTheme) setIsDarkMode(savedTheme === 'dark');
      if (savedClosure === 'true') setIsDayClosed(true);
      if (savedZReport) setCurrentZReport(JSON.parse(savedZReport));
      if (savedZHistory) setZReportHistory(JSON.parse(savedZHistory));
      
      updateStorageMetrics();
    } catch (err) {
      console.error("Storage loading failed", err);
    }
  }, [updateStorageMetrics]);

  // Persistence logic
  useEffect(() => {
    localStorage.setItem('godwill_products', JSON.stringify(products));
    localStorage.setItem('godwill_sales', JSON.stringify(sales));
    localStorage.setItem('godwill_settings', JSON.stringify(shopSettings));
    localStorage.setItem('godwill_theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('godwill_day_closed', isDayClosed.toString());
    localStorage.setItem('godwill_zreport_history', JSON.stringify(zReportHistory));
    if (currentZReport) localStorage.setItem('godwill_last_zreport', JSON.stringify(currentZReport));
    
    updateStorageMetrics();
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#111827';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F9FAFB';
    }
  }, [products, sales, shopSettings, isDarkMode, isDayClosed, currentZReport, zReportHistory, updateStorageMetrics]);

  const handleUpdateProduct = useCallback((updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  }, []);

  const handleAddProduct = useCallback((newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const handleDeleteProduct = useCallback((id: string) => {
    if (window.confirm("Delete this product?")) setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleCompleteSale = useCallback((sale: Sale) => {
    if (isDayClosed) return;
    setSales(prev => [sale, ...prev]);
    setProducts(prev => prev.map(p => {
      const soldItem = sale.items.find(item => item.product.id === p.id);
      if (soldItem) return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
      return p;
    }));
  }, [isDayClosed]);

  const handleCloseDay = useCallback(() => {
    if (window.confirm("End Shift and Save Z-Report? Terminal will be locked until next session.")) {
      const todayDate = new Date().toDateString();
      const todaysSales = sales.filter(s => new Date(s.timestamp).toDateString() === todayDate);
      
      const gross = todaysSales.reduce((acc, s) => acc + s.subtotal, 0);
      const discounts = todaysSales.reduce((acc, s) => acc + s.discount, 0);
      const net = todaysSales.reduce((acc, s) => acc + s.total, 0);
      const cash = todaysSales.filter(s => s.paymentMethod === PaymentMethod.CASH).reduce((acc, s) => acc + s.total, 0);
      const mpesa = todaysSales.filter(s => s.paymentMethod === PaymentMethod.MPESA).reduce((acc, s) => acc + s.total, 0);
      const split = todaysSales.filter(s => s.paymentMethod === PaymentMethod.SPLIT).reduce((acc, s) => acc + s.total, 0);
      
      const itemMap: Record<string, number> = {};
      todaysSales.forEach(s => s.items.forEach(i => {
        itemMap[i.product.name] = (itemMap[i.product.name] || 0) + i.quantity;
      }));
      const topItems = Object.entries(itemMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, qty]) => ({ name, qty }));

      const zReport: ZReport = {
        date: todayDate,
        openTime: todaysSales.length > 0 ? new Date(Math.min(...todaysSales.map(s => s.timestamp.getTime()))).toLocaleTimeString() : new Date().toLocaleTimeString(),
        closeTime: new Date().toLocaleTimeString(),
        totalSales: todaysSales.length,
        grossSales: gross,
        discounts: discounts,
        netSales: net,
        cashTotal: cash,
        mpesaTotal: mpesa,
        splitTotal: split,
        topItems
      };

      const newHistory = [...zReportHistory, zReport];
      setZReportHistory(newHistory);
      setCurrentZReport(zReport);
      setIsDayClosed(true);
      
      alert("Shift Closed. Z-Report has been archived. You can download or print it from the Dashboard.");
    }
  }, [sales, zReportHistory]);

  const handleBackup = useCallback(() => {
    const data = JSON.stringify({ products, sales, shopSettings, currentZReport, isDayClosed, zReportHistory });
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Full_POS_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  }, [products, sales, shopSettings, currentZReport, isDayClosed, zReportHistory]);

  const handleRestore = useCallback((data: any) => {
    if (data.products) setProducts(data.products);
    if (data.sales) setSales(data.sales.map((s: any) => ({ ...s, timestamp: new Date(s.timestamp) })));
    if (data.shopSettings) setShopSettings(data.shopSettings);
    if (data.currentZReport) setCurrentZReport(data.currentZReport);
    if (data.zReportHistory) setZReportHistory(data.zReportHistory);
    if (typeof data.isDayClosed === 'boolean') setIsDayClosed(data.isDayClosed);
    alert("Full System Restore Complete. All historical data recovered.");
  }, []);

  const renderContent = () => {
    const commonProps = { isDarkMode, toggleTheme: () => setIsDarkMode(!isDarkMode) };
    switch (activeTab) {
      case Tab.POS: return <POS products={products} onCompleteSale={handleCompleteSale} isDayClosed={isDayClosed} shopSettings={shopSettings} isDarkMode={isDarkMode} />;
      case Tab.DASHBOARD: return <Dashboard sales={sales} products={products} onCloseDay={handleCloseDay} isDayClosed={isDayClosed} zReport={currentZReport} zReportHistory={zReportHistory} {...commonProps} />;
      case Tab.INVENTORY: return <Inventory products={products} inventoryPassword={shopSettings.inventoryPassword} onUpdateProduct={handleUpdateProduct} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} {...commonProps} />;
      case Tab.HISTORY: return <SalesHistory sales={sales} shopSettings={shopSettings} {...commonProps} />;
      case Tab.REPORTS: return <Reports sales={sales} products={products} isDarkMode={isDarkMode} shopSettings={shopSettings} />;
      case Tab.ADMIN: return <Admin products={products} settings={shopSettings} setSettings={setShopSettings} onPurgeSales={() => setSales([])} onResetSystem={() => { localStorage.clear(); window.location.reload(); }} onBackup={handleBackup} onRestore={handleRestore} isPersistent={isPersistent} storageUsage={storageUsage} lastBackupDate={lastBackupDate} onUpdateProduct={handleUpdateProduct} {...commonProps} />;
      default: return <POS products={products} onCompleteSale={handleCompleteSale} isDayClosed={isDayClosed} shopSettings={shopSettings} isDarkMode={isDarkMode} />;
    }
  };

  if (!isAuthorized) {
    return <LoginScreen onAuthorize={() => setIsAuthorized(true)} isDarkMode={isDarkMode} systemPassword={shopSettings.systemPassword} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-primary'}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        <div className={`mx-auto min-h-full ${activeTab === Tab.POS ? 'p-6' : 'p-8 max-w-[2000px]'}`}>{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
