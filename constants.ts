
import { Product, UnitType, Sale, PaymentMethod } from './types';

export const SHOP_NAME = "GODWILL SHOP";
export const CURRENCY = "Ksh";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Afa Maize Flour 2kg',
    sku: 'FLR-001',
    category: 'Cereals',
    unit: UnitType.PIECE,
    stock: 45,
    costPrice: 180,
    normalPrice: 210,
    wholesaleThreshold: 12,
    wholesalePrice: 195,
    reorderLevel: 10,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400'
  },
  {
    id: 'p2',
    name: 'Sugar (Loose)',
    sku: 'SGR-002',
    category: 'Groceries',
    unit: UnitType.KG,
    stock: 120,
    costPrice: 110,
    normalPrice: 150,
    wholesaleThreshold: 10,
    wholesalePrice: 135,
    reorderLevel: 20,
    image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?q=80&w=400'
  },
  {
    id: 'p3',
    name: 'Fresh Milk 1L',
    sku: 'MLK-003',
    category: 'Dairy',
    unit: UnitType.LITER,
    stock: 24,
    costPrice: 65,
    normalPrice: 85,
    wholesaleThreshold: 6,
    wholesalePrice: 75,
    reorderLevel: 5,
    image: 'https://images.unsplash.com/photo-1563636619-e910ef44755d?q=80&w=400'
  },
  {
    id: 'p4',
    name: 'Cooking Oil 3L',
    sku: 'OIL-004',
    category: 'Groceries',
    unit: UnitType.LITER,
    stock: 15,
    costPrice: 480,
    normalPrice: 580,
    wholesaleThreshold: 4,
    wholesalePrice: 520,
    reorderLevel: 3,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbadcbaf?q=80&w=400'
  },
  {
    id: 'p5',
    name: 'Bar Soap 800g',
    sku: 'DET-005',
    category: 'Homecare',
    unit: UnitType.PIECE,
    stock: 60,
    costPrice: 140,
    normalPrice: 190,
    wholesaleThreshold: 10,
    wholesalePrice: 165,
    reorderLevel: 15,
    image: 'https://images.unsplash.com/photo-1605264964528-06403738d6dc?q=80&w=400'
  },
  {
    id: 'p6',
    name: 'Tea Leaves 50g',
    sku: 'TEA-006',
    category: 'Beverages',
    unit: UnitType.PIECE,
    stock: 8,
    costPrice: 25,
    normalPrice: 45,
    wholesaleThreshold: 20,
    wholesalePrice: 35,
    reorderLevel: 10,
    image: 'https://images.unsplash.com/photo-1544787210-2211d7c309c7?q=80&w=400'
  },
  {
    id: 'p7',
    name: 'Table Salt 1kg',
    sku: 'SLT-007',
    category: 'Groceries',
    unit: UnitType.PIECE,
    stock: 100,
    costPrice: 25,
    normalPrice: 40,
    wholesaleThreshold: 10,
    wholesalePrice: 32,
    reorderLevel: 25,
    image: 'https://images.unsplash.com/photo-1518110925478-2dc5fd2d129d?q=80&w=400'
  },
  {
    id: 'p8',
    name: 'Matchbox (Pack of 10)',
    sku: 'MCH-008',
    category: 'General',
    unit: UnitType.PIECE,
    stock: 2,
    costPrice: 35,
    normalPrice: 60,
    wholesaleThreshold: 5,
    wholesalePrice: 50,
    reorderLevel: 5,
    image: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?q=80&w=400'
  },
  {
    id: 'p9',
    name: 'Rice (Biryani) 5kg',
    sku: 'RIC-009',
    category: 'Cereals',
    unit: UnitType.PIECE,
    stock: 30,
    costPrice: 750,
    normalPrice: 950,
    wholesaleThreshold: 5,
    wholesalePrice: 850,
    reorderLevel: 5,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400'
  },
  {
    id: 'p10',
    name: 'Wheat Flour 2kg',
    sku: 'FLR-010',
    category: 'Cereals',
    unit: UnitType.PIECE,
    stock: 40,
    costPrice: 175,
    normalPrice: 205,
    wholesaleThreshold: 12,
    wholesalePrice: 185,
    reorderLevel: 8,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400'
  }
];

export const MOCK_SALES: Sale[] = [
  {
    id: 'GW-882901',
    timestamp: new Date(Date.now() - 3600000 * 2),
    cashier: 'Lead Cashier',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 2,
        unitPrice: 210,
        isWholesale: false,
        total: 420
      },
      {
        product: INITIAL_PRODUCTS[2],
        quantity: 1,
        unitPrice: 85,
        isWholesale: false,
        total: 85
      }
    ],
    subtotal: 505,
    tax: 40.40,
    discount: 0,
    total: 545.40,
    paymentMethod: PaymentMethod.CASH,
    amountReceived: 1000,
    change: 454.60,
    isRetail: true,
    costOfGoodsSold: 425
  },
  {
    id: 'GW-882902',
    timestamp: new Date(Date.now() - 3600000),
    cashier: 'Lead Cashier',
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 12,
        unitPrice: 135, // Wholesale rate triggered
        isWholesale: true,
        total: 1620
      }
    ],
    subtotal: 1620,
    tax: 129.60,
    discount: 20,
    total: 1729.60,
    paymentMethod: PaymentMethod.MPESA,
    amountReceived: 1729.60,
    change: 0,
    isRetail: false,
    costOfGoodsSold: 1320
  },
  {
    id: 'GW-882903',
    timestamp: new Date(Date.now() - 600000),
    cashier: 'Main Counter',
    items: [
      {
        product: INITIAL_PRODUCTS[8],
        quantity: 1,
        unitPrice: 950,
        isWholesale: false,
        total: 950
      },
      {
        product: INITIAL_PRODUCTS[7],
        quantity: 1,
        unitPrice: 60,
        isWholesale: false,
        total: 60
      }
    ],
    subtotal: 1010,
    tax: 80.80,
    discount: 0,
    total: 1090.80,
    paymentMethod: PaymentMethod.SPLIT,
    amountReceived: 1100,
    change: 9.20,
    isRetail: true,
    costOfGoodsSold: 785
  }
];
