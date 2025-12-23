
import React, { useMemo, useState, useCallback } from 'react';
import { Sale, Product, PaymentMethod } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { 
  Download, Calendar as CalIcon, ChevronDown, BarChart3, TrendingUp, 
  Package, DollarSign, History, AlertTriangle, Printer, FileText, 
  ArrowRight, Users, PieChart as PieIcon, ArrowUpRight, ArrowDownRight,
  UserCheck, Tag, Briefcase, Activity, Loader2
} from 'lucide-react';
import { CURRENCY, SHOP_NAME } from '../constants';

interface ReportsProps {
  sales: Sale[];
  products: Product[];
  isDarkMode: boolean;
  shopSettings?: any;
}

type ReportCategory = 'SALES' | 'INVENTORY' | 'FINANCIAL' | 'OPERATIONAL';
type ReportType = 
  | 'DAILY_SUMMARY' | 'DATE_RANGE' | 'RETAIL_WHOLESALE' | 'CASHIER'
  | 'STOCK_LEVELS' | 'STOCK_MOVEMENT' | 'LOW_STOCK' 
  | 'PAYMENTS' | 'DISCOUNTS' | 'PROFIT'
  | 'EOD_LOG';

const Reports: React.FC<ReportsProps> = ({ sales = [], products = [], isDarkMode, shopSettings }) => {
  const [activeReport, setActiveReport] = useState<ReportType>('DAILY_SUMMARY');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const safeNum = (val: any) => isNaN(parseFloat(val)) ? 0 : parseFloat(val);
  const fmt = (val: any, dec: number = 2) => safeNum(val).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const saleDate = new Date(s.timestamp).toISOString().split('T')[0];
      return saleDate >= startDate && saleDate <= endDate;
    });
  }, [sales, startDate, endDate]);

  const handleExportCSV = () => {
    const reportName = activeReport.toLowerCase().replace('_', ' ');
    const headers = "Metric,Value\n";
    const data = "Generated At," + new Date().toLocaleString() + "\nReport," + reportName + "\n";
    const blob = new Blob([headers + data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Godwill_${activeReport}_${startDate}.csv`;
    a.click();
  };

  const menuItems: { category: ReportCategory; label: string; icon: React.ReactNode; reports: { type: ReportType; label: string }[] }[] = [
    {
      category: 'SALES',
      label: 'Sales Reports',
      icon: <TrendingUp size={16} />,
      reports: [
        { type: 'DAILY_SUMMARY', label: 'Daily Sales Summary' },
        { type: 'DATE_RANGE', label: 'Date Range Sales' },
        { type: 'RETAIL_WHOLESALE', label: 'Retail vs Wholesale' },
        { type: 'CASHIER', label: 'Cashier Performance' },
      ]
    },
    {
      category: 'INVENTORY',
      label: 'Inventory Reports',
      icon: <Package size={16} />,
      reports: [
        { type: 'STOCK_LEVELS', label: 'Current Stock Levels' },
        { type: 'STOCK_MOVEMENT', label: 'Stock Movement Log' },
        { type: 'LOW_STOCK', label: 'Low Stock & Reorder' },
      ]
    },
    {
      category: 'FINANCIAL',
      label: 'Financial Reports',
      icon: <DollarSign size={16} />,
      reports: [
        { type: 'PAYMENTS', label: 'Payment Methods' },
        { type: 'DISCOUNTS', label: 'Discounts Given' },
        { type: 'PROFIT', label: 'Profit Snapshot' },
      ]
    },
    {
      category: 'OPERATIONAL',
      label: 'Operational',
      icon: <Briefcase size={16} />,
      reports: [
        { type: 'EOD_LOG', label: 'End-of-Day Log' },
      ]
    }
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 animate-in fade-in duration-500">
      <div className={`w-72 shrink-0 rounded-3xl border border-border shadow-sm flex flex-col no-print ${isDarkMode ? 'bg-[#1A1F2C] border-gray-700' : 'bg-white'}`}>
        <div className="p-6 border-b border-border dark:border-gray-700">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Report Engine</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar">
          {menuItems.map(cat => (
            <div key={cat.category} className="space-y-2">
              <div className="flex items-center gap-2 px-3 mb-3">
                <span className="text-urgency">{cat.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{cat.label}</span>
              </div>
              <div className="space-y-1">
                {cat.reports.map(report => (
                  <button
                    key={report.type}
                    onClick={() => setActiveReport(report.type)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                      activeReport === report.type 
                        ? 'bg-urgency text-white shadow-lg shadow-urgency/20' 
                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {report.label}
                    {activeReport === report.type && <ArrowRight size={14} />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`flex-1 rounded-3xl border border-border shadow-sm flex flex-col overflow-hidden ${isDarkMode ? 'bg-[#1A1F2C] border-gray-700' : 'bg-white'}`}>
        <div className="p-6 border-b border-border dark:border-gray-700 flex justify-between items-center no-print">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Date From</p>
              <input type="date" className={`text-xs font-bold p-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-urgency ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'}`} value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Date To</p>
              <input type="date" className={`text-xs font-bold p-2 rounded-lg border border-border outline-none focus:ring-1 focus:ring-urgency ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white'}`} value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExportCSV} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
              <Download size={14} /> EXPORT CSV
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {activeReport === 'DAILY_SUMMARY' && <DailySummaryReport sales={filteredSales} isDarkMode={isDarkMode} fmt={fmt} currency={CURRENCY} />}
          {activeReport === 'RETAIL_WHOLESALE' && <RetailWholesaleReport sales={filteredSales} isDarkMode={isDarkMode} fmt={fmt} currency={CURRENCY} />}
          {activeReport === 'STOCK_MOVEMENT' && <StockMovementReport sales={filteredSales} isDarkMode={isDarkMode} fmt={fmt} currency={CURRENCY} />}
          {activeReport === 'LOW_STOCK' && <LowStockReport products={products} isDarkMode={isDarkMode} fmt={fmt} />}
          {activeReport === 'STOCK_LEVELS' && <StockLevelsReport products={products} isDarkMode={isDarkMode} fmt={fmt} currency={CURRENCY} />}
          {activeReport === 'PAYMENTS' && <PaymentsReport sales={filteredSales} isDarkMode={isDarkMode} fmt={fmt} currency={CURRENCY} />}
          {activeReport === 'DATE_RANGE' && <DateRangeSales sales={filteredSales} isDarkMode={isDarkMode} fmt={fmt} currency={CURRENCY} />}
          {activeReport === 'CASHIER' && <CashierReport sales={filteredSales} isDarkMode={isDarkMode} fmt={fmt} currency={CURRENCY} />}
          {activeReport === 'DISCOUNTS' && <DiscountsReport sales={filteredSales} isDarkMode={isDarkMode} fmt={fmt} currency={CURRENCY} />}
          {activeReport === 'PROFIT' && <ProfitReport sales={filteredSales} isDarkMode={isDarkMode} fmt={fmt} currency={CURRENCY} />}
          {activeReport === 'EOD_LOG' && <EodLogReport sales={filteredSales} isDarkMode={isDarkMode} fmt={fmt} currency={CURRENCY} />}
        </div>
      </div>
    </div>
  );
};

/* --- SUB-REPORT COMPONENTS --- */

const SummaryCard = ({ label, value, icon, color = 'text-gray-900', isDarkMode }: any) => (
  <div className={`p-6 rounded-[2rem] border border-border shadow-sm flex flex-col justify-between ${isDarkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-gray-50'}`}>
    <div className="flex justify-between items-center mb-4">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
      <span className={`p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${color}`}>{icon}</span>
    </div>
    <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
  </div>
);

const DailySummaryReport = ({ sales, isDarkMode, fmt, currency }: any) => {
  const stats = useMemo(() => {
    const total = sales.reduce((acc, s) => acc + s.total, 0);
    const txCount = sales.length;
    const items = sales.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0), 0);
    const retailTotal = sales.filter(s => s.isRetail).reduce((acc, s) => acc + s.total, 0);
    const wholesaleTotal = sales.filter(s => !s.isRetail).reduce((acc, s) => acc + s.total, 0);
    return { total, txCount, items, retailTotal, wholesaleTotal };
  }, [sales]);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard label="Total Revenue" value={`${currency} ${fmt(stats.total)}`} icon={<DollarSign size={18}/>} color="text-urgency" isDarkMode={isDarkMode} />
        <SummaryCard label="Transactions" value={stats.txCount} icon={<FileText size={18}/>} isDarkMode={isDarkMode} />
        <SummaryCard label="Items Sold" value={stats.items} icon={<Package size={18}/>} isDarkMode={isDarkMode} />
        <SummaryCard label="Retail Revenue" value={`${currency} ${fmt(stats.retailTotal)}`} icon={<ArrowUpRight size={18}/>} color="text-teal" isDarkMode={isDarkMode} />
        <SummaryCard label="Wholesale Revenue" value={`${currency} ${fmt(stats.wholesaleTotal)}`} icon={<ArrowDownRight size={18}/>} color="text-urgency" isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

const ProfitReport = ({ sales, isDarkMode, fmt, currency }: any) => {
  const stats = useMemo(() => {
    const revenue = sales.reduce((acc, s) => acc + s.total, 0);
    const cogs = sales.reduce((acc, s) => acc + (s.costOfGoodsSold || 0), 0);
    const profit = revenue - cogs;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { revenue, cogs, profit, margin };
  }, [sales]);

  const data = [{ name: 'Revenue', value: stats.revenue }, { name: 'Cost of Goods', value: stats.cogs }, { name: 'Net Profit', value: stats.profit }];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SummaryCard label="Revenue" value={`${currency} ${fmt(stats.revenue)}`} icon={<DollarSign size={18}/>} color="text-urgency" isDarkMode={isDarkMode} />
        <SummaryCard label="Total COGS" value={`${currency} ${fmt(stats.cogs)}`} icon={<Package size={18}/>} color="text-gray-400" isDarkMode={isDarkMode} />
        <SummaryCard label="Gross Profit" value={`${currency} ${fmt(stats.profit)}`} icon={<TrendingUp size={18}/>} color="text-teal" isDarkMode={isDarkMode} />
        <SummaryCard label="Margin (%)" value={`${stats.margin.toFixed(1)}%`} icon={<Activity size={18}/>} color="text-highlight" isDarkMode={isDarkMode} />
      </div>

      <div className={`p-8 rounded-[2rem] border border-border ${isDarkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-white'}`}>
        <h4 className="text-sm font-black uppercase tracking-widest mb-6">Financial Comparison</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#F3F4F6'} />
              <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 2 ? '#2D9C91' : index === 1 ? '#9CA3AF' : '#FF6D1F'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const CashierReport = ({ sales, isDarkMode, fmt, currency }: any) => {
  const data = useMemo(() => {
    const map: Record<string, { tx: number, rev: number }> = {};
    sales.forEach(s => {
      const c = s.cashier || 'Unknown';
      if (!map[c]) map[c] = { tx: 0, rev: 0 };
      map[c].tx++;
      map[c].rev += s.total;
    });
    return Object.entries(map).map(([name, stats]) => ({ name, ...stats }));
  }, [sales]);

  return (
    <div className={`rounded-2xl border border-border overflow-hidden ${isDarkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-white'}`}>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className={`font-black uppercase tracking-widest border-b border-border ${isDarkMode ? 'bg-gray-900/50 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
            <th className="px-6 py-4">Cashier Name</th>
            <th className="px-6 py-4 text-center">Transactions</th>
            <th className="px-6 py-4 text-right">Revenue Generated</th>
            <th className="px-6 py-4 text-right">Avg Ticket Size</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-gray-700">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <td className="px-6 py-4 flex items-center gap-3 font-bold"><UserCheck size={14} className="text-urgency" /> {row.name}</td>
              <td className="px-6 py-4 text-center font-bold">{row.tx}</td>
              <td className="px-6 py-4 text-right font-black">{currency} {fmt(row.rev)}</td>
              <td className="px-6 py-4 text-right text-gray-400">{currency} {fmt(row.rev / row.tx)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StockLevelsReport = ({ products, isDarkMode, fmt, currency }: any) => {
  const totalValuation = products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);
  const totalPotential = products.reduce((acc, p) => acc + (p.stock * p.normalPrice), 0);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard label="Inventory Valuation (Cost)" value={`${currency} ${fmt(totalValuation)}`} icon={<Package size={18}/>} color="text-gray-400" isDarkMode={isDarkMode} />
        <SummaryCard label="Potential Revenue (Retail)" value={`${currency} ${fmt(totalPotential)}`} icon={<DollarSign size={18}/>} color="text-teal" isDarkMode={isDarkMode} />
      </div>
      <div className={`rounded-2xl border border-border overflow-hidden ${isDarkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-white'}`}>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className={`font-black uppercase tracking-widest border-b border-border ${isDarkMode ? 'bg-gray-900/50 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-center">Stock</th>
              <th className="px-6 py-4 text-right">Unit Value</th>
              <th className="px-6 py-4 text-right">Total Valuation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-gray-700">
            {products.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 font-bold">{p.name}</td>
                <td className="px-6 py-4 text-gray-400">{p.category}</td>
                <td className={`px-6 py-4 text-center font-black ${p.stock <= p.reorderLevel ? 'text-red-500' : ''}`}>{p.stock} {p.unit}</td>
                <td className="px-6 py-4 text-right font-medium">{currency} {fmt(p.costPrice)}</td>
                <td className="px-6 py-4 text-right font-black">{currency} {fmt(p.stock * p.costPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DiscountsReport = ({ sales, isDarkMode, fmt, currency }: any) => {
  const totalDiscounts = sales.reduce((acc, s) => acc + (s.discount || 0), 0);
  const discountSales = sales.filter(s => s.discount > 0);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard label="Total Discounts Given" value={`${currency} ${fmt(totalDiscounts)}`} icon={<Tag size={18}/>} color="text-red-500" isDarkMode={isDarkMode} />
        <SummaryCard label="Discounted Transactions" value={discountSales.length} icon={<FileText size={18}/>} isDarkMode={isDarkMode} />
      </div>
      <div className={`rounded-2xl border border-border overflow-hidden ${isDarkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-white'}`}>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className={`font-black uppercase tracking-widest border-b border-border ${isDarkMode ? 'bg-gray-900/50 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
              <th className="px-6 py-4">Sale ID</th>
              <th className="px-6 py-4">Cashier</th>
              <th className="px-6 py-4 text-right">Discount Amt</th>
              <th className="px-6 py-4 text-right">Sale Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-gray-700">
            {discountSales.length > 0 ? discountSales.map((s, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 font-black">{s.id}</td>
                <td className="px-6 py-4">{s.cashier}</td>
                <td className="px-6 py-4 text-right font-bold text-red-500">{currency} {fmt(s.discount)}</td>
                <td className="px-6 py-4 text-right font-black">{currency} {fmt(s.total)}</td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="py-20 text-center text-gray-400 italic font-medium">No discounted sales in this period.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EodLogReport = ({ sales, isDarkMode, fmt, currency }: any) => {
  const closedSales = sales.filter(s => s.dayClosed);
  return (
    <div className={`rounded-2xl border border-border overflow-hidden ${isDarkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-white'}`}>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className={`font-black uppercase tracking-widest border-b border-border ${isDarkMode ? 'bg-gray-900/50 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
            <th className="px-6 py-4">Receipt ID</th>
            <th className="px-6 py-4">Finalized At</th>
            <th className="px-6 py-4 text-right">Total Finalized</th>
            <th className="px-6 py-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-gray-700">
          {closedSales.length > 0 ? closedSales.map((s, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <td className="px-6 py-4 font-black">{s.id}</td>
              <td className="px-6 py-4 text-gray-400">{new Date(s.timestamp).toLocaleString()}</td>
              <td className="px-6 py-4 text-right font-black">{currency} {fmt(s.total)}</td>
              <td className="px-6 py-4 text-center"><span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[9px] font-black tracking-widest">CLOSED</span></td>
            </tr>
          )) : (
             <tr><td colSpan={4} className="py-20 text-center text-gray-400 italic">No closed shift logs found for this date range.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const RetailWholesaleReport = ({ sales, isDarkMode, fmt, currency }: any) => {
  const data = useMemo(() => [
    { name: 'Retail', value: sales.filter(s => s.isRetail).reduce((acc, s) => acc + s.total, 0) },
    { name: 'Wholesale', value: sales.filter(s => !s.isRetail).reduce((acc, s) => acc + s.total, 0) }
  ], [sales]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
      <div className={`p-8 rounded-3xl border border-border ${isDarkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-white'}`}>
        <h4 className="text-sm font-black uppercase tracking-widest mb-6">Revenue Distribution</h4>
        <div className="h-64 flex items-center justify-center">
           <ResponsiveContainer width="100%" height="100%">
             <PieChart>
               <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">
                  <Cell fill="#2D9C91" />
                  <Cell fill="#FF6D1F" />
               </Pie>
               <Tooltip />
             </PieChart>
           </ResponsiveContainer>
        </div>
      </div>
      <div className="space-y-4">
        {data.map(item => (
          <div key={item.name} className={`p-6 rounded-3xl border border-border flex justify-between items-center ${isDarkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-gray-50'}`}>
            <div>
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.name} Total</p>
               <p className="text-xl font-black mt-1">{currency} {fmt(item.value)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StockMovementReport = ({ sales, isDarkMode, fmt, currency }: any) => {
  const logs = useMemo(() => {
    return sales.flatMap(s => s.items.map(item => ({
      date: s.timestamp,
      product: item.product.name,
      type: 'SALE',
      qty: item.quantity,
      unit: item.product.unit,
      value: item.total
    }))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales]);

  return (
    <div className={`rounded-2xl border border-border overflow-hidden ${isDarkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-white'}`}>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className={`font-black uppercase tracking-widest border-b border-border ${isDarkMode ? 'bg-gray-900/50 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
            <th className="px-6 py-4">Timestamp</th>
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4 text-center">Quantity</th>
            <th className="px-6 py-4 text-right">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-gray-700">
          {logs.map((log, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <td className="px-6 py-4 text-gray-400">{new Date(log.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
              <td className="px-6 py-4 font-bold">{log.product}</td>
              <td className="px-6 py-4"><span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[9px] font-black tracking-widest">SALE</span></td>
              <td className="px-6 py-4 text-center font-bold text-red-500">-{log.qty} {log.unit}</td>
              <td className="px-6 py-4 text-right font-black">{currency} {fmt(log.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const LowStockReport = ({ products, isDarkMode, fmt }: any) => {
  const lowStock = products.filter(p => p.stock <= p.reorderLevel);
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
          <AlertTriangle size={20} />
          <p className="text-xs font-bold uppercase tracking-widest">System Alert: {lowStock.length} items require immediate restocking</p>
       </div>
       <div className={`rounded-2xl border border-border overflow-hidden ${isDarkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-white'}`}>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className={`font-black uppercase tracking-widest border-b border-border ${isDarkMode ? 'bg-gray-900/50 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4 text-center">In Stock</th>
              <th className="px-6 py-4 text-center">Reorder Lvl</th>
              <th className="px-6 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-gray-700">
            {lowStock.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 font-bold">{p.name}</td>
                <td className="px-6 py-4 text-center font-black text-red-500">{p.stock.toFixed(1)}</td>
                <td className="px-6 py-4 text-center font-bold">{p.reorderLevel}</td>
                <td className="px-6 py-4 text-right"><span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-500 text-white">LOW STOCK</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PaymentsReport = ({ sales, isDarkMode, fmt, currency }: any) => {
  const methods = useMemo(() => {
    const counts: Record<string, number> = {};
    sales.forEach(s => { counts[s.paymentMethod] = (counts[s.paymentMethod] || 0) + s.total; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [sales]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {methods.map(m => (
        <div key={m.name} className={`p-8 rounded-[2rem] border border-border flex flex-col items-center text-center ${isDarkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-gray-50'}`}>
           <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-6 text-urgency"><PieIcon size={24} /></div>
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{m.name}</p>
           <p className="text-2xl font-black">{currency} {fmt(m.value)}</p>
        </div>
      ))}
    </div>
  );
};

const DateRangeSales = ({ sales, isDarkMode, fmt, currency }: any) => {
  return (
    <div className={`rounded-2xl border border-border overflow-hidden ${isDarkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-white'}`}>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className={`font-black uppercase tracking-widest border-b border-border ${isDarkMode ? 'bg-gray-900/50 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Time</th>
            <th className="px-6 py-4">Segment</th>
            <th className="px-6 py-4 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-gray-700">
          {sales.map((s, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <td className="px-6 py-4 font-black">{s.id}</td>
              <td className="px-6 py-4 text-gray-400">{new Date(s.timestamp).toLocaleTimeString()}</td>
              <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${s.isRetail ? 'bg-teal/10 text-teal' : 'bg-urgency/10 text-urgency'}`}>{s.isRetail ? 'Retail' : 'Wholesale'}</span></td>
              <td className="px-6 py-4 text-right font-black">{currency} {fmt(s.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
