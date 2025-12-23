
import React, { useState, useMemo } from 'react';
import { Sale, PaymentMethod } from '../types';
import { Search, Download, Calendar, MoreHorizontal, FileText, Printer, X } from 'lucide-react';
import { CURRENCY, SHOP_NAME } from '../constants';

interface SalesHistoryProps {
  sales: Sale[];
  shopSettings: any;
  isDarkMode: boolean;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ sales, shopSettings, isDarkMode }) => {
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const filteredSales = useMemo(() => 
    sales.filter(s => 
      s.id.toLowerCase().includes(search.toLowerCase()) || 
      s.items.some(i => i.product.name.toLowerCase().includes(search.toLowerCase()))
    ), [sales, search]);

  const handleExportCSV = () => {
    const headers = "Receipt No,Date,Total,Payment,Items\n";
    const rows = filteredSales.map(s => 
      `${s.id},${s.timestamp.toISOString()},${s.total},${s.paymentMethod},"${s.items.map(i => i.product.name).join(', ')}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleReprint = (sale: Sale) => {
    setSelectedSale(sale);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const ReceiptContent = ({ sale }: { sale: Sale }) => (
    <div className="thermal-paper text-[10px] leading-tight">
      <div className="text-center mb-6 space-y-1">
        <h1 className="text-lg font-black uppercase tracking-tighter">{shopSettings?.name || SHOP_NAME}</h1>
        <p className="text-[8px] font-bold uppercase tracking-widest leading-none">Litein, Kericho County</p>
        <p className="text-[7px] font-bold uppercase tracking-widest">Tel: 07XX XXX XXX</p>
        <div className="border-b border-dashed border-black pt-2"></div>
      </div>
      
      <div className="space-y-1 mb-4 text-[8px] uppercase font-bold">
        <div className="flex justify-between"><span>RECEIPT #:</span><span>{sale.id}</span></div>
        <div className="flex justify-between"><span>DATE:</span><span>{new Date(sale.timestamp).toLocaleDateString()}</span></div>
        <div className="flex justify-between"><span>TIME:</span><span>{new Date(sale.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
        <div className="flex justify-between"><span>CASHIER:</span><span>{sale.cashier}</span></div>
        <div className="flex justify-between"><span>PAYMENT:</span><span>{sale.paymentMethod}</span></div>
      </div>

      <div className="border-t border-b border-dashed border-black py-2 mb-4 space-y-3">
         {sale.items.map((item, idx) => (
           <div key={idx} className="space-y-1">
             <div className="flex justify-between font-black text-[9px]">
               <span className="uppercase">{item.product.name} {item.isWholesale ? '[WHOLESALE]' : ''}</span>
             </div>
             <div className="flex justify-between items-end pl-2">
               <span className="text-[8px] font-medium">{item.quantity.toFixed(2)} {item.product.unit} x {item.unitPrice.toFixed(2)}</span>
               <span className="font-black text-[9px]">{item.total.toFixed(2)}</span>
             </div>
           </div>
         ))}
      </div>

      <div className="space-y-1 mb-4 text-right uppercase font-bold text-[9px]">
        <div className="flex justify-between"><span>SUBTOTAL:</span><span>{sale.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>VAT (8%):</span><span>{sale.tax.toFixed(2)}</span></div>
        <div className="flex justify-between text-sm font-black pt-1 border-t border-dashed border-black mt-1">
          <span>TOTAL ({CURRENCY}):</span>
          <span>{sale.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center pt-4 border-t border-dashed border-black space-y-4">
         <div>
            <p className="font-black uppercase text-[9px] mb-1">{shopSettings?.footer || "Thank you for shopping!"}</p>
            <p className="text-[7px] font-bold uppercase tracking-widest text-gray-600">RE-PRINTED COPY</p>
         </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8 no-print">
        <h1 className="text-2xl font-black">Sales History</h1>
        <button 
          onClick={handleExportCSV}
          className={`border border-border px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white'}`}
        >
          <Download size={16} />
          Export to CSV
        </button>
      </div>

      <div className={`rounded-xl border border-border shadow-sm overflow-hidden no-print ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <div className="p-6 border-b border-border">
          <h3 className="font-bold text-lg mb-1">Transaction Ledger</h3>
          <p className="text-sm text-gray-400 mb-6">Auditable archive of all point-of-sale activities.</p>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by receipt or product name..." 
                className={`w-full border border-border rounded-lg py-2 pl-10 pr-4 text-xs outline-none focus:ring-1 focus:ring-urgency ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`font-bold border-b border-border uppercase tracking-wider ${isDarkMode ? 'bg-gray-900/50 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
                <th className="px-6 py-4">Receipt No</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSales.length > 0 ? filteredSales.map(sale => (
                <tr key={sale.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}>
                  <td className="px-6 py-4 font-black text-gray-900 dark:text-white">{sale.id}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {sale.timestamp.toLocaleDateString()}, {sale.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-center font-medium">{sale.items.length} Units</td>
                  <td className="px-6 py-4 text-right font-black text-urgency">{CURRENCY} {sale.total.toFixed(2)}</td>
                  <td className="px-6 py-4 uppercase font-bold text-gray-400 text-[10px]">{sale.paymentMethod}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setMenuOpenId(menuOpenId === sale.id ? null : sale.id)}
                      className="p-2 text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {menuOpenId === sale.id && (
                      <div className={`absolute right-12 top-0 z-10 w-36 rounded-lg border border-border shadow-xl py-2 text-left animate-in fade-in slide-in-from-right-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <button 
                          onClick={() => { setSelectedSale(sale); setMenuOpenId(null); }}
                          className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-bold"
                        >
                          <FileText size={14}/> Details
                        </button>
                        <button 
                          onClick={() => { handleReprint(sale); setMenuOpenId(null); }}
                          className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-bold"
                        >
                          <Printer size={14}/> Reprint
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 italic">No historical records match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Detail Modal showing actual receipt layout */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 no-print overflow-y-auto">
          <div className={`rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
             <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-tighter">Receipt Archive</h3>
                <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
             </div>
             <div className="p-10 bg-gray-50 dark:bg-gray-800 flex flex-col items-center max-h-[70vh] overflow-y-auto">
                <div className="scale-110 mb-4">
                  <ReceiptContent sale={selectedSale} />
                </div>
             </div>
             <div className="p-6 bg-white dark:bg-gray-900 flex gap-3">
                <button 
                  onClick={() => handleReprint(selectedSale)}
                  className="flex-1 py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3"
                >
                  <Printer size={18} /> Print Again
                </button>
                <button 
                  onClick={() => setSelectedSale(null)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                  Close
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Invisible print element */}
      {selectedSale && (
        <div className="print-only">
          <ReceiptContent sale={selectedSale} />
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
