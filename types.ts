
export enum UnitType {
  KG = 'Kg',
  LITER = 'Litre',
  PIECE = 'Piece'
}

export enum PaymentMethod {
  CASH = 'Cash',
  MPESA = 'Mpesa',
  SPLIT = 'Split'
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: UnitType;
  stock: number;
  costPrice: number;
  normalPrice: number;
  wholesaleThreshold: number;
  wholesalePrice: number;
  reorderLevel: number;
  image?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  isWholesale: boolean;
  total: number;
}

export interface Sale {
  id: string;
  timestamp: Date;
  cashier: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountReceived: number;
  change: number;
  isRetail: boolean;
  costOfGoodsSold: number;
  dayClosed?: boolean;
}

export interface ZReport {
  date: string;
  openTime: string;
  closeTime: string;
  totalSales: number;
  grossSales: number;
  discounts: number;
  netSales: number;
  cashTotal: number;
  mpesaTotal: number;
  splitTotal: number;
  topItems: { name: string, qty: number }[];
}

export enum Tab {
  POS = 'Point of Sale',
  DASHBOARD = 'Dashboard',
  INVENTORY = 'Inventory',
  HISTORY = 'Sales History',
  REPORTS = 'Reports & Analytics',
  ADMIN = 'Admin'
}
