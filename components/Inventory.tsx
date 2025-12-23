
import React, { useState, useMemo, useRef } from 'react';
import { Product, UnitType } from '../types';
import { Search, Plus, MoreHorizontal, Download, Upload, Image as ImageIcon, Trash2, Edit, X, Camera, Link as LinkIcon, Lock } from 'lucide-react';
import { CURRENCY } from '../constants';

interface InventoryProps {
  products: Product[];
  onUpdateProduct: (p: Product) => void;
  onAddProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  isDarkMode: boolean;
  inventoryPassword: string;
}

const Inventory: React.FC<InventoryProps> = ({ products = [], onUpdateProduct, onAddProduct, onDeleteProduct, isDarkMode, inventoryPassword }) => {
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  
  // Security Gate State
  const [isPasswordGateOpen, setIsPasswordGateOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'ADD' | 'EDIT', payload?: Product } | null>(null);

  const safeToFixed = (val: any, dec: number = 2) => {
    const n = parseFloat(val);
    return isNaN(n) ? (0).toFixed(dec) : n.toFixed(dec);
  };

  const filteredProducts = useMemo(() => 
    (products || []).filter(p => p && (
      (p.name || "").toLowerCase().includes(search.toLowerCase()) || 
      (p.sku || "").toLowerCase().includes(search.toLowerCase())
    )), [products, search]);

  const handleBulkExport = () => {
    const data = JSON.stringify(products, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleBulkImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            imported.forEach(p => {
              if (products.some(existing => existing.id === p.id)) {
                onUpdateProduct(p);
              } else {
                onAddProduct(p);
              }
            });
            alert("Inventory updated successfully!");
          }
        } catch (err) {
          alert("Invalid file format.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const openSecurityGate = (type: 'ADD' | 'EDIT', payload?: Product) => {
    setPendingAction({ type, payload });
    setIsPasswordGateOpen(true);
    setPasswordInput('');
    setPasswordError(false);
  };

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === inventoryPassword) {
      if (pendingAction?.type === 'ADD') setIsAdding(true);
      else if (pendingAction?.type === 'EDIT' && pendingAction.payload) setEditingProduct(pendingAction.payload);
      
      setIsPasswordGateOpen(false);
      setPendingAction(null);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300 pb-10">
      <div className="flex justify-between items-center mb-8 no-print">
        <h1 className="text-2xl font-black">Inventory Management</h1>
        <div className="flex gap-4">
          <button 
            onClick={handleBulkImport}
            className={`border border-border px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white'}`}
          >
            <Upload size={16} />
            Bulk Import
          </button>
          <button 
            onClick={handleBulkExport}
            className={`border border-border px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white'}`}
          >
            <Download size={16} />
            Export
          </button>
          <button onClick={() => openSecurityGate('ADD')} className="bg-urgency text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-urgency/20 hover:scale-[1.02] active:scale-95 transition-all">
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      <div className={`rounded-xl border border-border shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <div className="p-6 border-b border-border no-print">
          <h3 className="font-bold text-lg mb-1">Stock Registry</h3>
          <p className="text-sm text-gray-400 mb-4">View and edit current product availability across all units.</p>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by Name, SKU or Category..." 
              className={`w-full border border-border rounded-lg py-2 pl-10 pr-4 outline-none text-sm focus:ring-1 focus:ring-urgency ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50'}`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className={`font-bold uppercase tracking-wider border-b border-border ${isDarkMode ? 'bg-gray-900/50 text-gray-500' : 'bg-gray-50 text-gray-400'}`}>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Unit</th>
                <th className="px-6 py-4">Cost</th>
                <th className="px-6 py-4">Retail</th>
                <th className="px-6 py-4">Wholesale</th>
                <th className={`px-6 py-4 text-center font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>QTY</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length > 0 ? filteredProducts.map(p => (
                <tr key={p.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                      {p.image ? (
                        <img src={p.image} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={16} className="text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold">{p.name || "Unnamed Product"}</td>
                  <td className="px-6 py-4 text-gray-400 uppercase">{p.sku || "N/A"}</td>
                  <td className="px-6 py-4 text-gray-500">{p.category || "General"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase ${ (p.stock || 0) <= (p.reorderLevel || 0) ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                      {(p.stock || 0) <= (p.reorderLevel || 0) ? 'Reorder' : 'Healthy'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">{p.unit}</td>
                  <td className="px-6 py-4 text-gray-500">{CURRENCY} {safeToFixed(p.costPrice)}</td>
                  <td className="px-6 py-4 font-bold">{CURRENCY} {safeToFixed(p.normalPrice)}</td>
                  <td className="px-6 py-4 text-urgency font-bold">{CURRENCY} {safeToFixed(p.wholesalePrice)}</td>
                  <td className={`px-6 py-4 font-black text-center ${(p.stock || 0) <= (p.reorderLevel || 0) ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{safeToFixed(p.stock, 1)}</td>
                  <td className="px-6 py-4 text-right relative no-print">
                    <button 
                      onClick={() => setMenuOpenId(menuOpenId === p.id ? null : p.id)}
                      className="p-2 text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {menuOpenId === p.id && (
                      <div className={`absolute right-12 top-0 z-10 w-32 rounded-lg border border-border shadow-xl py-2 text-left animate-in fade-in slide-in-from-right-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <button 
                          onClick={() => { openSecurityGate('EDIT', p); setMenuOpenId(null); }}
                          className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-bold"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button 
                          onClick={() => { onDeleteProduct(p.id); setMenuOpenId(null); }}
                          className="w-full px-4 py-2 flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 text-xs font-bold"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={11} className="py-20 text-center text-gray-400 italic font-medium">
                    No products matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Gate Pop-up */}
      {isPasswordGateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-8 rounded-[2.5rem] border shadow-2xl transition-all duration-200 ${passwordError ? 'border-red-500 shake' : 'border-border'} ${isDarkMode ? 'bg-[#1a212c]' : 'bg-white'}`}>
            <div className="flex flex-col items-center space-y-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <Lock size={28} className={passwordError ? 'text-red-500' : 'text-urgency'} />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-black uppercase">Mutation Guard</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Authorized Access Only</p>
              </div>
              <form onSubmit={handleGateSubmit} className="w-full space-y-4">
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter Mutation Key..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className={`w-full h-12 px-4 rounded-xl text-xs font-bold outline-none border transition-all ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white focus:border-urgency' : 'bg-gray-50 border-gray-200 focus:border-urgency text-gray-900'}`}
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsPasswordGateOpen(false)} className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>Cancel</button>
                  <button type="submit" className="flex-1 h-12 bg-urgency text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-urgency/20">Verify</button>
                </div>
              </form>
              {passwordError && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest animate-pulse">Incorrect Key</p>}
            </div>
          </div>
        </div>
      )}

      {(editingProduct || isAdding) && (
        <ProductForm 
          initialData={editingProduct || undefined} 
          isDarkMode={isDarkMode}
          onSave={(p: Product) => {
            if (isAdding) onAddProduct({ ...p, id: Date.now().toString() });
            else onUpdateProduct(p);
            setEditingProduct(null);
            setIsAdding(false);
          }}
          onClose={() => { setEditingProduct(null); setIsAdding(false); }}
        />
      )}
    </div>
  );
};

const ProductForm = ({ initialData, onSave, onClose, isDarkMode }: any) => {
  const [form, setForm] = useState<Product>(initialData || {
    id: '', name: '', sku: '', category: '', unit: UnitType.PIECE, stock: 0,
    costPrice: 0, normalPrice: 0, wholesaleThreshold: 1, wholesalePrice: 0, reorderLevel: 0,
    image: ''
  });
  
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Could not access camera.");
      setIsCameraActive(false);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setForm({ ...form, image: dataUrl });
    stopCamera();
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setForm({ ...form, image: '' });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className={`rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-border ${isDarkMode ? 'bg-[#1a212c]' : 'bg-white'}`}>
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black">{initialData ? 'Update Product' : 'Create New Product'}</h3>
            <p className="text-xs text-gray-400 font-medium">All sales will automatically reference these pricing and stock rules.</p>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }} className="text-gray-400 hover:text-red-500 transition-all p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <X size={20}/>
          </button>
        </div>
        
        <div className="p-8 grid grid-cols-12 gap-8 max-h-[80vh] overflow-y-auto">
          {/* Image Management Section */}
          <div className="col-span-12 md:col-span-5 space-y-4">
            <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
               <button 
                 type="button"
                 onClick={() => setImageSource('upload')}
                 className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${imageSource === 'upload' ? 'bg-white dark:bg-gray-800 shadow-sm text-urgency' : 'text-gray-400'}`}
               >
                 <Upload size={14} /> Local File
               </button>
               <button 
                 type="button"
                 onClick={() => { stopCamera(); setImageSource('url'); }}
                 className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${imageSource === 'url' ? 'bg-white dark:bg-gray-800 shadow-sm text-urgency' : 'text-gray-400'}`}
               >
                 <LinkIcon size={14} /> Image URL
               </button>
            </div>

            <div className={`relative aspect-square border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {isCameraActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 flex gap-3">
                    <button type="button" onClick={takePhoto} className="bg-urgency text-white px-6 py-2 rounded-full font-black text-[10px] uppercase shadow-lg">Capture</button>
                    <button type="button" onClick={stopCamera} className="bg-gray-800/80 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase">Cancel</button>
                  </div>
                </div>
              ) : form.image ? (
                <div className="group w-full h-full">
                  <img src={form.image} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                    <button type="button" onClick={clearImage} className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-xl"><Trash2 size={20} /></button>
                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Click to change</p>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => imageSource === 'upload' ? fileInputRef.current?.click() : null}
                  className="p-10 text-center cursor-pointer group"
                >
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {imageSource === 'upload' ? <ImageIcon size={32} className="text-gray-300" /> : <LinkIcon size={32} className="text-gray-300" />}
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                    {imageSource === 'upload' ? 'Upload from device' : 'Paste link below'}
                  </p>
                  {imageSource === 'upload' && (
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); startCamera(); }}
                      className="mt-4 flex items-center gap-2 bg-urgency/10 text-urgency px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider mx-auto hover:bg-urgency/20"
                    >
                      <Camera size={14} /> Use Camera
                    </button>
                  )}
                </div>
              )}
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            
            {imageSource === 'url' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Remote Image URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input 
                    className={`w-full border border-border rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:ring-1 focus:ring-urgency ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}
                    placeholder="https://images.unsplash.com/photo..."
                    value={form.image.startsWith('data:') ? '' : form.image}
                    onChange={e => setForm({...form, image: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <form className="col-span-12 md:col-span-7 grid grid-cols-2 gap-4" onSubmit={e => { e.preventDefault(); onSave(form); }}>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Product Name</label>
              <input required className={`w-full border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-urgency/10 font-bold text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SKU / Barcode</label>
              <input required className={`w-full border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-urgency/10 font-bold text-sm uppercase ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`} value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
              <input required className={`w-full border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-urgency/10 font-bold text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`} value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pricing Unit</label>
              <select className={`w-full border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-urgency/10 font-bold text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`} value={form.unit} onChange={e => setForm({...form, unit: e.target.value as UnitType})}>
                <option value={UnitType.PIECE}>Individual Piece</option>
                <option value={UnitType.KG}>Kilogram (kg)</option>
                <option value={UnitType.LITER}>Litre (l)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cost per Unit</label>
              <input type="number" step="0.01" className={`w-full border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-urgency/10 font-bold text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`} value={form.costPrice} onChange={e => setForm({...form, costPrice: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Retail Price</label>
              <input type="number" step="0.01" className={`w-full border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-urgency/10 font-black text-sm text-teal ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`} value={form.normalPrice} onChange={e => setForm({...form, normalPrice: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Wholesale Price</label>
              <input type="number" step="0.01" className={`w-full border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-urgency/10 font-black text-sm text-urgency ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`} value={form.wholesalePrice} onChange={e => setForm({...form, wholesalePrice: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Wholesale Trigger Qty</label>
              <input type="number" className={`w-full border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-urgency/10 font-bold text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`} value={form.wholesaleThreshold} onChange={e => setForm({...form, wholesaleThreshold: parseFloat(e.target.value) || 1})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Current Stock</label>
              <input type="number" className={`w-full border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-urgency/10 font-bold text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`} value={form.stock} onChange={e => setForm({...form, stock: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Reorder Alert Level</label>
              <input type="number" className={`w-full border border-border rounded-xl p-3 outline-none focus:ring-2 focus:ring-urgency/10 font-bold text-sm ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white'}`} value={form.reorderLevel} onChange={e => setForm({...form, reorderLevel: parseFloat(e.target.value) || 0})} />
            </div>
            
            <div className="col-span-2 flex justify-end gap-3 mt-8">
              <button type="button" onClick={() => { stopCamera(); onClose(); }} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Discard</button>
              <button type="submit" className="px-12 py-3 bg-urgency text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-urgency/90 shadow-xl shadow-urgency/20 active:scale-95 transition-all">Save To Inventory</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
