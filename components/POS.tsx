
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Product, CartItem, Sale, PaymentMethod, UnitType } from '../types';
import { 
  Search, Plus, Minus, CheckCircle2, 
  Trash2, Smartphone, Landmark, Share2, 
  Printer, Calculator, AlertCircle, X, Loader2
} from 'lucide-react';
import { CURRENCY, SHOP_NAME } from '../constants';

interface POSProps {
  products: Product[];
  onCompleteSale: (sale: Sale) => void;
  isDayClosed: boolean;
  shopSettings?: any;
  isDarkMode: boolean;
}

const POS: React.FC<POSProps> = ({ products = [], onCompleteSale, isDayClosed, isDarkMode, shopSettings }) => {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [stockError, setStockError] = useState<{id: string, msg: string} | null>(null);

  const filteredProducts = useMemo(() => {
    return (products || []).filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const subtotal = useMemo(() => {
    return (cart || []).reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }, [cart]);

  const taxDisplay = subtotal * 0.08;
  const total = subtotal; 

  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    // requestAnimationFrame ensures the browser has rendered the print-only div
    requestAnimationFrame(() => {
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 50);
    });
  }, []);

  // Optimized Instant Auto-Print Hook
  useEffect(() => {
    if (showSuccess && lastSale && shopSettings?.autoPrintReceipts) {
      handlePrint();
    }
  }, [showSuccess, lastSale, shopSettings, handlePrint]);

  useEffect(() => {
    if (paymentMethod !== PaymentMethod.CASH) {
      setAmountReceived(total);
    }
  }, [paymentMethod, total]);

  const changeDue = Math.max(0, (amountReceived || 0) - total);
  
  const hasInventoryConflict = cart.some(item => {
    const liveProduct = products.find(p => p.id === item.product.id);
    return liveProduct ? item.quantity > liveProduct.stock : true;
  });

  const isCompleteDisabled = (cart || []).length === 0 || isDayClosed || hasInventoryConflict || (paymentMethod === PaymentMethod.CASH && (amountReceived || 0) < total);

  const triggerStockError = (id: string, msg: string) => {
    setStockError({ id, msg });
    setTimeout(() => setStockError(null), 2500);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const liveProduct = products.find(p => p.id === productId);
    if (!liveProduct) return;

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === productId);
      if (existingIndex === -1) return prev;

      const newCart = [...prev];
      const item = newCart[existingIndex];
      const newQty = Math.max(0, item.quantity + delta);

      if (delta > 0 && newQty > liveProduct.stock) {
        triggerStockError(productId, `Only ${liveProduct.stock} available`);
        return prev;
      }

      if (newQty === 0) {
        return newCart.filter((_, idx) => idx !== existingIndex);
      }

      const isWholesale = newQty >= liveProduct.wholesaleThreshold;
      const unitPrice = isWholesale ? liveProduct.wholesalePrice : liveProduct.normalPrice;
      
      newCart[existingIndex] = {
        ...item,
        quantity: newQty,
        unitPrice,
        isWholesale,
        total: unitPrice * newQty
      };
      
      return newCart;
    });
  };

  const addToCart = (product: Product) => {
    if (isDayClosed || product.stock <= 0) return;
    
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      
      if (existingIndex > -1) {
        const item = prev[existingIndex];
        const newQty = item.quantity + 1;

        if (newQty > product.stock) {
          triggerStockError(product.id, `Only ${product.stock} available`);
          return prev;
        }

        const newCart = [...prev];
        const isWholesale = newQty >= product.wholesaleThreshold;
        const unitPrice = isWholesale ? product.wholesalePrice : product.normalPrice;
        
        newCart[existingIndex] = {
          ...item,
          quantity: newQty,
          unitPrice,
          isWholesale,
          total: unitPrice * newQty
        };
        return newCart;
      }
      
      return [...prev, {
        product,
        quantity: 1,
        unitPrice: product.normalPrice,
        isWholesale: false,
        total: product.normalPrice
      }];
    });
  };

  const handleCheckout = () => {
    if (isCompleteDisabled) return;
    
    if (hasInventoryConflict) {
      alert("Inventory error: One or more items in your cart exceed available stock. Please adjust.");
      return;
    }

    const sale: Sale = {
      id: `GW-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      timestamp: new Date(),
      cashier: 'Main Counter',
      items: [...cart],
      subtotal,
      tax: taxDisplay,
      discount: 0,
      total,
      paymentMethod,
      amountReceived: amountReceived || 0,
      change: changeDue,
      isRetail: !cart.some(item => item.isWholesale),
      costOfGoodsSold: cart.reduce((acc, i) => acc + (i.product.costPrice * i.quantity), 0)
    };
    onCompleteSale(sale);
    setLastSale(sale);
    setShowSuccess(true);
    setCart([]);
    setAmountReceived(0);
  };

  const quickCashOptions = [50, 100, 200, 500, 1000];

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

      {sale.paymentMethod === PaymentMethod.CASH && (
        <div className="space-y-1 border-t border-dashed border-black pt-2 mb-6 uppercase font-bold text-[8px]">
          <div className="flex justify-between"><span>PAID (CASH):</span><span>{sale.amountReceived.toFixed(2)}</span></div>
          <div className="flex justify-between font-black text-[9px]"><span>CHANGE:</span><span>{sale.change.toFixed(2)}</span></div>
        </div>
      )}

      <div className="text-center pt-4 border-t border-dashed border-black space-y-4">
         <div>
            <p className="font-black uppercase text-[9px] mb-1">{shopSettings?.footer || "Thank you for shopping!"}</p>
            <p className="text-[7px] font-bold uppercase tracking-widest text-gray-600">Goods once sold are not returnable</p>
         </div>
         <div className="pt-2 flex flex-col items-center">
            <div className="border border-black px-4 py-1 text-[7px] font-black uppercase">Official Copy</div>
            <p className="text-[6px] text-gray-400 mt-2">POWERED BY GODWILL POS V1.0</p>
         </div>
      </div>
    </div>
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-6rem)] font-sans">
      {/* PRODUCTS SECTION */}
      <div className={`flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden no-print`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-black mb-3 tracking-tight">Products</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full h-10 border border-gray-200 rounded-xl pl-11 pr-4 outline-none focus:ring-2 focus:ring-urgency/10 transition-all text-sm font-medium"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {filteredProducts.map(p => {
              const isLowStock = p.stock <= p.reorderLevel && p.stock > 0;
              const isOutOfStock = p.stock <= 0;
              const currentInCart = cart.find(i => i.product.id === p.id)?.quantity || 0;
              const hasCartLimit = currentInCart >= p.stock;

              return (
                <button 
                  key={p.id} 
                  disabled={isOutOfStock || hasCartLimit}
                  onClick={() => addToCart(p)} 
                  className={`group text-left border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col bg-white relative ${isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed' : ''} ${(hasCartLimit && !isOutOfStock) ? 'opacity-70' : ''}`}
                >
                  <div className="aspect-square w-full relative overflow-hidden bg-gray-50">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    
                    {isOutOfStock ? (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2 text-center">
                        <span className="text-white font-black text-[10px] uppercase leading-tight">Out of Stock</span>
                      </div>
                    ) : hasCartLimit ? (
                      <div className="absolute inset-0 bg-orange-500/20 flex items-center justify-center p-2 text-center">
                         <span className="bg-white text-orange-600 font-black text-[8px] uppercase px-2 py-1 rounded shadow-sm">Limit Reached</span>
                      </div>
                    ) : isLowStock ? (
                      <div className="absolute top-1.5 right-1.5 bg-urgency text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-sm">Low Stock</div>
                    ) : null}
                  </div>
                  <div className="p-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight uppercase tracking-tight">{p.name}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[9px] text-gray-400 font-semibold uppercase">{p.category}</p>
                        <p className={`text-[8px] font-black uppercase ${p.stock <= p.reorderLevel ? 'text-red-500' : 'text-teal'}`}>In: {p.stock}</p>
                      </div>
                    </div>
                    <p className="text-[10px] font-black mt-1 text-gray-900">{CURRENCY} {p.normalPrice.toFixed(2)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CART & PAYMENT SECTION */}
      <div className="w-[400px] shrink-0 rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden no-print">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-black tracking-tight">Checkout</h2>
          <button onClick={() => setCart([])} className="flex items-center gap-2 px-3 py-1.5 bg-[#F44336] text-white rounded-lg text-[9px] font-black uppercase shadow-sm hover:bg-red-600 transition-colors">
            <Trash2 size={12} /> Clear
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!cart || cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-200 gap-2 py-10">
              <Calculator size={40} strokeWidth={1} />
              <p className="text-[9px] font-black uppercase tracking-widest">Cart is empty</p>
            </div>
          ) : cart.map(item => {
            const liveProduct = products.find(p => p.id === item.product.id);
            const isAtStockLimit = liveProduct ? item.quantity >= liveProduct.stock : true;
            const showingError = stockError?.id === item.product.id;

            return (
              <div key={item.product.id} className="relative group/item border-b border-gray-50 pb-3 last:border-0">
                <div className={`grid grid-cols-12 items-center gap-1.5 transition-all ${showingError ? 'translate-x-1' : ''}`}>
                  <div className="col-span-6">
                    <h4 className="text-[11px] font-bold text-gray-900 line-clamp-1">{item.product.name}</h4>
                    <p className="text-[9px] text-gray-400 font-bold">
                      {item.isWholesale ? (
                        <span className="text-urgency">WS Rate: {CURRENCY} {item.unitPrice.toFixed(2)}</span>
                      ) : (
                        <span>{CURRENCY} {item.unitPrice.toFixed(2)}</span>
                      )}
                    </p>
                  </div>
                  <div className="col-span-3 flex items-center justify-center gap-1.5">
                    <button onClick={() => updateQuantity(item.product.id, -1)} className="w-5 h-5 flex items-center justify-center border border-gray-100 rounded-full text-gray-400 hover:text-gray-900"><Minus size={10} /></button>
                    <span className="text-[11px] font-black w-3 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, 1)} 
                      disabled={isAtStockLimit}
                      className={`w-5 h-5 flex items-center justify-center border border-gray-100 rounded-full transition-all ${isAtStockLimit ? 'opacity-20 cursor-not-allowed border-orange-200 bg-orange-50' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-1.5 text-right">
                    <p className="text-[11px] font-black">{CURRENCY} {item.total.toFixed(2)}</p>
                    <button onClick={e => { e.stopPropagation(); updateQuantity(item.product.id, -item.quantity); }} className="text-red-300 hover:text-red-500 transition-colors ml-1"><Trash2 size={10} /></button>
                  </div>
                </div>
                {showingError && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-urgency text-white text-[8px] font-black px-2 py-0.5 rounded shadow-lg z-10 uppercase whitespace-nowrap flex items-center gap-1">
                    <AlertCircle size={8} /> {stockError.msg}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-white border-t border-gray-100 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-bold text-gray-400">
              <span className="uppercase tracking-widest">Subtotal</span>
              <span className="text-gray-900">{CURRENCY} {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[9px] text-gray-400 font-bold">
              <span className="uppercase tracking-widest">VAT (8%)</span>
              <span>{CURRENCY} {taxDisplay.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-black tracking-tight uppercase">Payable Total</span>
              <span className="text-2xl font-black text-gray-900 tracking-tighter">{CURRENCY} {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300">Payment Channel</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setPaymentMethod(PaymentMethod.CASH)} className={`flex items-center justify-center gap-2 h-10 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${paymentMethod === PaymentMethod.CASH ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 text-gray-400'}`}>
                <Landmark size={14} /> Cash
              </button>
              <button onClick={() => setPaymentMethod(PaymentMethod.MPESA)} className={`flex items-center justify-center gap-2 h-10 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${paymentMethod === PaymentMethod.MPESA ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 text-gray-400'}`}>
                <Smartphone size={14} /> M-Pesa
              </button>
            </div>
          </div>

          {paymentMethod === PaymentMethod.CASH && cart.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-xl space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex justify-between items-center">
                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Cash In</p>
                 <div className="flex gap-1">
                    {quickCashOptions.map(val => (
                      <button key={val} onClick={() => setAmountReceived(prev => (prev || 0) + val)} className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[8px] font-black hover:bg-gray-100">+{val}</button>
                    ))}
                 </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-black text-[11px] text-gray-400">{CURRENCY}</span>
                <input type="number" className="w-full h-9 bg-white border border-gray-200 rounded-lg pl-10 pr-3 font-black text-sm outline-none focus:ring-2 focus:ring-urgency/10" value={amountReceived || ''} placeholder="0.00" onChange={e => setAmountReceived(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-200/50">
                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Change Due</p>
                 <p className={`text-sm font-black ${changeDue > 0 ? 'text-teal' : 'text-gray-300'}`}>{CURRENCY} {changeDue.toFixed(2)}</p>
              </div>
            </div>
          )}

          <button onClick={handleCheckout} disabled={isCompleteDisabled} className={`w-full h-12 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg ${isCompleteDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' : 'bg-urgency text-white hover:bg-urgency/90 active:scale-[0.98] shadow-orange-200'}`}>
            Finalize Sale
          </button>
        </div>
      </div>

      {/* SUCCESS DIALOG WITH RECEIPT PREVIEW */}
      {showSuccess && lastSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 no-print overflow-y-auto">
           <div className="bg-white dark:bg-gray-900 rounded-[3rem] max-w-4xl w-full flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">
              
              {/* Printing Overlay */}
              {isPrinting && (
                <div className="absolute inset-0 z-[110] bg-white/50 backdrop-blur-[2px] flex flex-col items-center justify-center animate-in fade-in">
                  <div className="bg-gray-900 text-white px-8 py-6 rounded-[2rem] flex flex-col items-center gap-4 shadow-2xl">
                    <Loader2 size={32} className="animate-spin text-urgency" />
                    <span className="font-black text-xs uppercase tracking-widest">Spooling to Printer...</span>
                  </div>
                </div>
              )}

              {/* Receipt Preview Side */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-8 flex items-center justify-center overflow-y-auto max-h-[90vh]">
                 <div className="scale-110">
                    <ReceiptContent sale={lastSale} />
                 </div>
              </div>

              {/* Action Side */}
              <div className="w-full md:w-[350px] p-10 flex flex-col justify-center text-center space-y-8 bg-white dark:bg-gray-900">
                <div className="w-20 h-20 bg-teal text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                   <CheckCircle2 size={40} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Sale Recorded</h3>
                  <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest">Reference: {lastSale.id}</p>
                </div>
                
                {lastSale.paymentMethod === PaymentMethod.CASH && (
                  <div className="p-5 bg-gray-50 dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Return Change</p>
                    <p className="text-3xl font-black text-teal tracking-tighter">{CURRENCY} {lastSale.change.toFixed(2)}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <button 
                    onClick={handlePrint} 
                    className="w-full py-4 bg-urgency text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-urgency/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Printer size={18} /> PRINT RECEIPT
                  </button>
                  <button onClick={() => setShowSuccess(false)} className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    Close & New Sale
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* ACTUAL PRINT-ONLY INVISIBLE ELEMENT */}
      {lastSale && (
        <div className="print-only">
          <ReceiptContent sale={lastSale} />
        </div>
      )}
    </div>
  );
};

export default POS;
