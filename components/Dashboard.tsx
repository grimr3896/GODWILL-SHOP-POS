
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Sale, Product, ZReport } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  ShoppingCart, AlertCircle, DollarSign, Search, Sun, Moon, Bell, 
  TrendingUp, CreditCard, Printer, FileCheck, Loader2, X, CheckCircle2, 
  Save, Download, FileText, History, Trash2, Archive
} from 'lucide-react';
import { CURRENCY, SHOP_NAME } from '../constants';

interface DashboardProps {
  sales: Sale[];
  products: Product[];
  onCloseDay: () => void;
  isDayClosed: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
  zReport: ZReport | null;
  zReportHistory: ZReport[];
}

/**
 * Robust Save utility that tries the "Save As" picker first
 */
const robustSave = async (content: string, fileName: string) => {
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: 'Text Document',
          accept: { 'text/plain': ['.txt'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return true;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return false;
      // Fallback below
    }
  }

  // Traditional Download Fallback
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  return true;
};

const ZReportContent = ({ report }: { report: ZReport }) => (
  <div className="thermal-paper text-[10px] border-2 border-dashed border-gray-200 shadow-xl select-none">
    <div className="text-center mb-8 space-y-1">
      <h1 className="text-lg font-black uppercase tracking-tighter">Z - REPORT</h1>
      <p className="text-[9px] font-black uppercase tracking-widest">{SHOP_NAME}</p>
      <p className="text-[7px] uppercase tracking-widest font-bold">End of Day Reconciliation</p>
      <div className="border-b border-dashed border-black pt-4"></div>
    </div>
    
    <div className="space-y-1 mb-6 uppercase font-bold text-[8px]">
      <div className="flex justify-between"><span>DATE:</span><span>{report.date}</span></div>
      <div className="flex justify-between"><span>TERMINAL:</span><span>POS-01 (MAIN)</span></div>
      <div className="flex justify-between"><span>OPENED:</span><span>{report.openTime}</span></div>
      <div className="flex justify-between"><span>CLOSED:</span><span>{report.closeTime}</span></div>
      <div className="flex justify-between"><span>OPERATOR:</span><span>MANAGER</span></div>
    </div>

    <div className="border-t border-b border-dashed border-black py-3 mb-6 space-y-2">
      <p className="font-black uppercase text-[9px] text-center border-b border-black pb-1 mb-2">SALES METRICS</p>
      <div className="space-y-1 font-bold">
        <div className="flex justify-between"><span>TX COUNT:</span><span>{report.totalSales}</span></div>
        <div className="flex justify-between"><span>GROSS SALES:</span><span>{CURRENCY} {report.grossSales.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>TOTAL DISCOUNTS:</span><span>{report.discounts.toFixed(2)}</span></div>
        <div className="flex justify-between font-black text-sm border-t border-dashed border-black pt-1 mt-1">
          <span>NET REVENUE:</span><span>{CURRENCY} {report.netSales.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="border-b border-dashed border-black py-3 mb-6 space-y-2">
      <p className="font-black uppercase text-[9px] text-center border-b border-black pb-1 mb-2">PAYMENT CHANNELS</p>
      <div className="space-y-1 font-bold uppercase">
        <div className="flex justify-between"><span>CASH TOTAL:</span><span>{CURRENCY} {report.cashTotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>M-PESA TOTAL:</span><span>{CURRENCY} {report.mpesaTotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>SPLIT PAYMENTS:</span><span>{CURRENCY} {report.splitTotal.toFixed(2)}</span></div>
      </div>
    </div>

    <div className="border-b border-dashed border-black py-3 mb-6 space-y-2">
      <p className="font-black uppercase text-[9px] text-center border-b border-black pb-1 mb-2">PRODUCT PERFORMANCE</p>
      <div className="space-y-1 font-bold">
        {report.topItems.map((item, idx) => (
          <div key={idx} className="flex justify-between text-[8px]">
            <span className="uppercase truncate w-32">{item.name}</span>
            <span>{item.qty.toFixed(0)} SOLD</span>
          </div>
        ))}
      </div>
    </div>

    <div className="space-y-3 mb-8 pt-2">
      <p className="font-black uppercase text-[9px] text-center">CASH RECONCILIATION</p>
      <div className="space-y-2 font-black uppercase text-[8px]">
         <div className="flex justify-between"><span>EXPECTED CASH:</span><span>{CURRENCY} {report.cashTotal.toFixed(2)}</span></div>
         <div className="flex justify-between items-end"><span>COUNTED CASH:</span><span className="border-b border-black w-24 h-4"></span></div>
         <div className="flex justify-between items-end"><span>VARIANCE (+/-):</span><span className="border-b border-black w-24 h-4"></span></div>
      </div>
    </div>

    <div className="text-center pt-6 border-t border-dashed border-black space-y-3">
       <div className="flex flex-col items-center">
          <div className="bg-black text-white px-4 py-1 text-[8px] font-black uppercase tracking-widest">SYSTEM CLOSED</div>
       </div>
       <p className="text-[6px] text-gray-400 mt-4 font-bold uppercase tracking-tighter">OFFICIAL Z-RECONCILIATION COPY</p>
    </div>
    <div className="h-10"></div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ sales = [], products = [], onCloseDay, isDayClosed, isDarkMode, toggleTheme, zReport, zReportHistory = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'TX' | 'Z'>('TX');
  const notificationRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todaySales = (sales || []).filter(s => s && s.timestamp && new Date(s.timestamp).toDateString() === today);
    const revenue = todaySales.reduce((acc, s) => acc + (s.total || 0), 0);
    const profit = todaySales.reduce((acc, s) => acc + ((s.total || 0) - (s.costOfGoodsSold || 0)), 0);
    const transactions = todaySales.length;
    const lowStockCount = (products || []).filter(p => p && (p.stock || 0) <= (p.reorderLevel || 0)).length;
    return { revenue, profit, transactions, lowStockCount, todaySales };
  }, [sales, products]);

  const trendData = useMemo(() => {
    const days = 7;
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toDateString();
      const daySales = (sales || []).filter(s => s && s.timestamp && new Date(s.timestamp).toDateString() === dateStr);
      result.push({
        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
        sales: daySales.reduce((acc, s) => acc + (s.total || 0), 0)
      });
    }
    return result;
  }, [sales]);

  const filteredItems = useMemo(() => {
    if (activeHistoryTab === 'TX') {
      return stats.todaySales
        .filter(s => s.id && s.id.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 20);
    } else {
      return (zReportHistory || [])
        .filter(r => r.date.toLowerCase().includes(searchQuery.toLowerCase()))
        .reverse();
    }
  }, [stats.todaySales, zReportHistory, activeHistoryTab, searchQuery]);

  const handlePrintZ = useCallback(() => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 200);
  }, []);

  const handleSaveZ = async (report: ZReport) => {
    const content = `
========================================
Z-REPORT: ${SHOP_NAME}
========================================
DATE:      ${report.date}
TERMINAL:  POS-01 (MAIN)
OPENED:    ${report.openTime}
CLOSED:    ${report.closeTime}
========================================

SALES METRICS:
----------------------------------------
TX COUNT:       ${report.totalSales}
GROSS SALES:    ${CURRENCY} ${report.grossSales.toFixed(2)}
DISCOUNTS:      ${report.discounts.toFixed(2)}
NET REVENUE:    ${CURRENCY} ${report.netSales.toFixed(2)}

PAYMENT CHANNELS:
----------------------------------------
CASH TOTAL:     ${CURRENCY} ${report.cashTotal.toFixed(2)}
M-PESA TOTAL:   ${CURRENCY} ${report.mpesaTotal.toFixed(2)}
SPLIT TOTAL:    ${CURRENCY} ${report.splitTotal.toFixed(2)}

TOP PERFORMING ITEMS:
----------------------------------------
${report.topItems.map(item => `${item.name.padEnd(25)} ${item.qty.toFixed(0)} units`).join('\n')}

========================================
        SHIFT OFFICIALLY ARCHIVED
========================================
Generated by Godwill POS Engine
    `.trim();

    await robustSave(content, `Z-Report_${report.date.replace(/ /g, '_')}.txt`);
  };

  const handleSaveReceipt = async (sale: Sale) => {
    const content = `
========================================
GODWILL SHOP - RECEIPT
========================================
RECEIPT #:  ${sale.id}
DATE:       ${new Date(sale.timestamp).toLocaleDateString()}
TIME:       ${new Date(sale.timestamp).toLocaleTimeString()}
PAYMENT:    ${sale.paymentMethod}
========================================

ITEMS:
----------------------------------------
${sale.items.map(item => `${item.product.name.padEnd(25)} ${item.quantity.toFixed(1)} ${item.product.unit} @ ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)}`).join('\n')}

----------------------------------------
SUBTOTAL:   ${sale.subtotal.toFixed(2)}
TAX (8%):   ${sale.tax.toFixed(2)}
TOTAL:      ${CURRENCY} ${sale.total.toFixed(2)}
========================================
       THANK YOU FOR SHOPPING!
========================================
    `.trim();

    await robustSave(content, `Receipt_${sale.id}.txt`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      <header className="flex justify-between items-center no-print relative">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Terminal Control</h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Audit, Analysis & Archive</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-6 bg-[#1A1F2C] p-3 px-6 rounded-[1.8rem] shadow-xl border border-white/5 relative h-14 z-[60]">
             <button onClick={toggleTheme} className="text-gray-400 hover:text-white transition-all transform active:scale-90">
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button onClick={() => setShowNotifications(!showNotifications)} className={`text-gray-400 hover:text-white transition-all transform active:scale-90 relative`}>
               <Bell size={20} />
               {stats.lowStockCount > 0 && <div className="absolute top-0 right-0 w-2 h-2 bg-urgency rounded-full"></div>}
             </button>
           </div>
           
           <button
              onClick={isDayClosed ? () => zReport && handleSaveZ(zReport) : onCloseDay}
              className={`flex items-center gap-4 px-10 py-4 rounded-[1.8rem] text-[13px] font-black uppercase tracking-[0.05em] transition-all shadow-2xl h-14 ${isDayClosed ? 'bg-teal text-white shadow-teal/30 hover:scale-[1.02]' : 'bg-urgency text-white hover:scale-[1.02] active:scale-[0.98] shadow-urgency/40'}`}
            >
              {isDayClosed ? <Download size={20} /> : <Archive size={20} />}
              {isDayClosed ? 'DOWNLOAD LATEST Z-REPORT' : 'FINALIZE SHIFT & ARCHIVE'}
            </button>
        </div>
      </header>

      {isDayClosed && zReport ? (
        <div className="no-print animate-in slide-in-from-top-6 duration-700 flex flex-col lg:flex-row gap-10 bg-teal/5 dark:bg-teal-950/20 p-12 rounded-[3.5rem] border border-teal-100 dark:border-teal-900/30">
           <div className="flex-1 space-y-8">
              <div className="flex items-center gap-6">
                 <div className="p-5 bg-white dark:bg-teal-900 rounded-full shadow-2xl text-teal">
                    <CheckCircle2 size={48} />
                 </div>
                 <div>
                    <h2 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">Shift Secured</h2>
                    <p className="text-[11px] font-black text-teal uppercase tracking-[0.3em] mt-2">Z-Report Saved to System Registry</p>
                 </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-base text-gray-600 dark:text-gray-300 font-medium leading-relaxed max-w-xl">
                  Transaction logging is suspended. You can now save the audit file to your computer's local drive or print the high-integrity slip for physical record keeping.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button onClick={() => handleSaveZ(zReport)} className="px-10 py-5 bg-teal text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    <Save size={20} /> CHOOSE SAVE LOCATION
                  </button>
                  <button onClick={handlePrintZ} className="px-10 py-5 bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-700 rounded-2xl font-black text-xs uppercase tracking-[0.15em] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                    <Printer size={20} /> Print Duplicate
                  </button>
                </div>
              </div>
           </div>
           <div className="flex justify-center lg:justify-end">
              <ZReportContent report={zReport} />
           </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 no-print">
        <StatCard icon={<DollarSign size={24}/>} label="Shift Revenue" value={`${CURRENCY} ${stats.revenue.toLocaleString()}`} subtitle="Gross sales recorded" isDarkMode={isDarkMode} />
        <StatCard icon={<TrendingUp size={24}/>} label="Shift Profit" value={`${CURRENCY} ${stats.profit.toLocaleString()}`} subtitle="Revenue - COGS" isDarkMode={isDarkMode} color="text-teal" />
        <StatCard icon={<ShoppingCart size={24}/>} label="Total Tx" value={stats.transactions.toString()} subtitle="Sales processed" isDarkMode={isDarkMode} />
        <StatCard icon={<AlertCircle size={24}/>} label="Inventory Alerts" value={stats.lowStockCount.toString()} subtitle="Low stock items" isAlert={stats.lowStockCount > 0} isDarkMode={isDarkMode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print animate-in fade-in duration-700">
        <div className={`lg:col-span-7 p-10 rounded-[2rem] border border-border shadow-sm flex flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black">Archive Registry</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Transaction & Z-Report History</p>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
               <button onClick={() => setActiveHistoryTab('TX')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeHistoryTab === 'TX' ? 'bg-white dark:bg-gray-800 shadow-sm text-urgency' : 'text-gray-400'}`}>Transactions</button>
               <button onClick={() => setActiveHistoryTab('Z')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeHistoryTab === 'Z' ? 'bg-white dark:bg-gray-800 shadow-sm text-urgency' : 'text-gray-400'}`}>Z-Reports</button>
            </div>
          </div>
          
          <div className="mb-6 relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
             <input 
               type="text" 
               placeholder={activeHistoryTab === 'TX' ? "Search Transaction ID..." : "Search Date..."}
               className={`w-full border border-border rounded-xl py-3 pl-12 pr-4 text-xs outline-none focus:ring-2 focus:ring-urgency/10 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}`}
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar max-h-[500px]">
             {filteredItems.length > 0 ? filteredItems.map((item: any, idx: number) => (
               <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 dark:border-gray-700 hover:border-urgency transition-all group">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl group-hover:bg-urgency group-hover:text-white transition-all text-gray-400">
                        {activeHistoryTab === 'TX' ? <FileText size={18} /> : <Archive size={18} />}
                     </div>
                     <div>
                        <p className={`font-black text-xs ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{activeHistoryTab === 'TX' ? item.id : item.date}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">
                           {activeHistoryTab === 'TX' ? new Date(item.timestamp).toLocaleTimeString() : `${item.totalSales} Transactions`}
                        </p>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <p className="font-black text-xs text-urgency">{CURRENCY} {(activeHistoryTab === 'TX' ? item.total : item.netSales).toLocaleString()}</p>
                     <button 
                       onClick={() => activeHistoryTab === 'TX' ? handleSaveReceipt(item) : handleSaveZ(item)}
                       className="p-2 text-gray-300 hover:text-teal transition-colors"
                     >
                        <Download size={18} />
                     </button>
                  </div>
               </div>
             )) : (
               <p className="text-center py-20 text-gray-400 text-xs font-bold uppercase tracking-widest">No archive items found</p>
             )}
          </div>
        </div>

        <div className={`lg:col-span-5 p-10 rounded-[2rem] border border-border shadow-sm flex flex-col ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <h3 className="text-xl font-black mb-10">Sales Velocity</h3>
          <div className="flex-1 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="dashboardTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6D1F" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FF6D1F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#374151" : "#F3F4F6"} />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} stroke={isDarkMode ? "#9CA3AF" : "#6B7280"} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#FF6D1F" strokeWidth={4} fillOpacity={1} fill="url(#dashboardTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {zReport && <div className="print-only"><ZReportContent report={zReport} /></div>}
    </div>
  );
};

const StatCard = ({ icon, label, value, subtitle, isAlert, color, isDarkMode }: any) => (
  <div className={`p-8 rounded-[2rem] border border-border shadow-sm transition-all hover:shadow-xl group ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
    <div className="flex justify-between items-start mb-6">
      <div className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">{label}</div>
      <div className={`${isAlert ? 'text-white bg-red-500' : 'text-gray-400 bg-gray-50 dark:bg-gray-700'} p-3 rounded-2xl`}>{icon}</div>
    </div>
    <div className={`text-3xl font-black tracking-tighter ${color || (isAlert ? 'text-red-500' : 'text-gray-900 dark:text-white')}`}>{value}</div>
    <div className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">{subtitle}</div>
  </div>
);

export default Dashboard;
