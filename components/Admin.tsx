
import React, { useState, useRef } from 'react';
import { 
  Settings, Shield, User, Database, Info, Save, Trash2, Download, 
  CheckCircle2, RotateCcw, Activity, AlertCircle, HardDrive, Printer, ExternalLink, Zap, Terminal, Upload, Lock, Key
} from 'lucide-react';

interface AdminProps {
  products: any[];
  onUpdateProduct: (p: any) => void;
  settings: any;
  setSettings: (s: any) => void;
  onPurgeSales: () => void;
  onResetSystem: () => void;
  onBackup: () => void;
  onRestore: (data: any) => void;
  isPersistent: boolean;
  storageUsage: number;
  lastBackupDate: string | null;
  isDarkMode: boolean;
}

const Admin: React.FC<AdminProps> = ({ 
  products, onUpdateProduct, settings, setSettings, onPurgeSales, 
  onResetSystem, onBackup, onRestore, isPersistent, storageUsage, lastBackupDate, isDarkMode 
}) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [showSuccess, setShowSuccess] = useState(false);
  const [testPrintActive, setTestPrintActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = () => {
    setSettings(localSettings);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleTestPrint = () => {
    setTestPrintActive(true);
    setTimeout(() => {
      window.print();
      setTestPrintActive(false);
    }, 150);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (window.confirm("Restore this backup? All current data will be overwritten.")) {
          onRestore(json);
        }
      } catch (err) {
        alert("Invalid backup file. Use a valid Godwill POS JSON backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const usageMB = (storageUsage / 1024 / 1024).toFixed(2);
  const usagePercent = Math.min(100, (storageUsage / (5 * 1024 * 1024)) * 100);

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-3xl font-black">System Administration</h2>
          <p className="text-gray-400 mt-1">Configure global business logic and hardware integration.</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 text-green-500 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg animate-in slide-in-from-top-2">
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold">Settings Saved</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
        
        {/* Printer & Hardware Configuration */}
        <div className={`p-8 rounded-2xl border border-border shadow-sm space-y-6 md:col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
           <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-urgency">
              <Printer size={24} />
              <h3 className="font-black uppercase tracking-wider text-sm">Printer & OS Integration</h3>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLocalSettings({...localSettings, autoPrintReceipts: !localSettings.autoPrintReceipts})}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${localSettings.autoPrintReceipts ? 'bg-urgency text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-400'}`}
              >
                <Zap size={14} /> Instant Print: {localSettings.autoPrintReceipts ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
               <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-border">
                  <div className="flex items-center gap-2 mb-3 text-highlight">
                    <Terminal size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal">Pro Tip: Silent Printing</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    To bypass the print dialog and achieve 100% instant printing, launch your browser with the <code className="bg-white dark:bg-gray-800 px-1 rounded font-black text-urgency">--kiosk-printing</code> flag.
                  </p>
               </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-3">
               <button 
                 onClick={handleTestPrint}
                 className="w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
               >
                 <Printer size={16} /> Send Test To OS Spooler
               </button>
            </div>
          </div>
        </div>

        {/* Security & Access Control */}
        <div className={`p-8 rounded-2xl border border-border shadow-sm space-y-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <div className="flex items-center gap-3 text-red-500">
            <Shield size={24} />
            <h3 className="font-black uppercase tracking-wider text-sm">Security Protocols</h3>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Main System Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text"
                  value={localSettings.systemPassword} 
                  onChange={e => setLocalSettings({...localSettings, systemPassword: e.target.value})}
                  className={`w-full border border-border rounded-xl py-3 pl-10 pr-3 outline-none focus:ring-1 focus:ring-urgency text-sm font-medium ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}`} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Inventory Mutation Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text"
                  value={localSettings.inventoryPassword} 
                  onChange={e => setLocalSettings({...localSettings, inventoryPassword: e.target.value})}
                  className={`w-full border border-border rounded-xl py-3 pl-10 pr-3 outline-none focus:ring-1 focus:ring-urgency text-sm font-medium ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}`} 
                />
              </div>
            </div>
            <button 
              onClick={handleSaveSettings}
              className="w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-black text-sm shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Lock size={18} /> Update Access Keys
            </button>
          </div>
        </div>

        {/* Shop Settings */}
        <div className={`p-8 rounded-2xl border border-border shadow-sm space-y-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <div className="flex items-center gap-3 text-teal">
            <Settings size={24} />
            <h3 className="font-black uppercase tracking-wider text-sm">Business Identity</h3>
          </div>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Store Name (Receipt Header)</label>
              <input 
                value={localSettings.name} 
                onChange={e => setLocalSettings({...localSettings, name: e.target.value})}
                className={`w-full border border-border rounded-xl p-3 outline-none focus:ring-1 focus:ring-urgency text-sm font-medium ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}`} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Footer Policy Note</label>
              <textarea 
                value={localSettings.footer}
                onChange={e => setLocalSettings({...localSettings, footer: e.target.value})}
                className={`w-full border border-border rounded-xl p-3 h-28 outline-none focus:ring-1 focus:ring-urgency text-sm font-medium resize-none ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}`} 
              />
            </div>
            <button 
              onClick={handleSaveSettings}
              className="w-full py-4 bg-urgency text-white rounded-xl font-black text-sm shadow-lg shadow-urgency/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> Save Shop Profile
            </button>
          </div>
        </div>

        {/* SYSTEM DATABASE */}
        <div className={`p-8 rounded-2xl border border-border shadow-sm space-y-6 md:col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <div className="flex items-center gap-3 text-red-500">
            <Database size={24} />
            <h3 className="font-black uppercase tracking-wider text-sm text-red-500">System Database</h3>
          </div>
          
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-[#4A5568]/20 dark:bg-[#1A1F2C] border border-[#2D3748]/10">
               <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-black text-[#A0AEC0] uppercase tracking-widest">Storage Usage</p>
                  <p className="text-[10px] font-black text-[#A0AEC0] uppercase">{usageMB}MB</p>
               </div>
               <div className="h-2 w-full bg-[#2D3748] rounded-full overflow-hidden">
                  <div className="h-full bg-teal shadow-[0_0_10px_#2D9C91]" style={{ width: `${usagePercent}%` }}></div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={onBackup}
                className="py-4 bg-[#2D9C91] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#2D9C91]/30"
              >
                <Download size={18} /> Global Backup
              </button>

              <button 
                onClick={handleRestoreClick}
                className="py-4 bg-white text-[#1A202C] border border-gray-100 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                <Upload size={18} className="text-[#1A202C]" /> Restore All
              </button>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileChange} 
            />
          </div>
        </div>
      </div>

      {/* TEST PRINT CONTENT */}
      {testPrintActive && (
        <div className="print-only">
          <div className="thermal-paper text-center space-y-4">
             <div className="border-b-2 border-black pb-4 mb-4">
                <h1 className="text-xl font-black uppercase tracking-tighter">PRINTER TEST</h1>
             </div>
             <div className="space-y-2 text-[10px] font-bold uppercase">
                <div className="flex justify-between"><span>DATE:</span><span>{new Date().toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span>SPOOL:</span><span>SUCCESS</span></div>
             </div>
             <div className="h-20"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
