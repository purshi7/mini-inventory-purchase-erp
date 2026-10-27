
const API_BASE = "/api";

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.message ??
        errorBody?.detail ??
        `Request failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<T>;
}

export interface Vendor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVendor {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}


export interface VendorPayment {
  id: number;
  vendorId: number;
  vendorName: string;
  idempotencyKey: string;
  amount: number;
  paymentDate: string;
  method: string;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface VendorOutstanding {
  vendorId: number;
  vendorName: string;
  totalPurchaseAmount: number;
  totalPaid: number;
  outstandingAmount: number;
}

export interface CreatePayment {
  vendorId: number;
  idempotencyKey: string;
  amount: number;
  paymentDate: string;
  method: string;
  referenceNumber?: string;
  notes?: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  unit: string;
  currentStock: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProduct {
  sku: string;
  name: string;
  description?: string;
  unit: string;
}

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  vendorName: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  notes?: string;
  items: PurchaseOrderItem[];
}

export interface CreatePurchaseOrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrder {
  vendorId: number;
  notes?: string;
  items: CreatePurchaseOrderItem[];
}

export interface GoodsReceiptResult {
  message: string;
  receiptId: number;
  receiptNumber: string;
}

export interface CreateGoodsReceiptItem {
  purchaseOrderItemId: number;
  receivedQuantity: number;
}

export interface CreateGoodsReceipt {
  purchaseOrderId: number;
  idempotencyKey: string;
  notes?: string;
  items: CreateGoodsReceiptItem[];
}

export const api = {
  getVendors: () => request<Vendor[]>("/vendors"),

  getPayments: () => request<VendorPayment[]>("/vendor-payments"),

  getOutstanding: () =>
    request<VendorOutstanding[]>("/vendor-payments/outstanding"),

  createPayment: (payment: CreatePayment) =>
    request<VendorPayment>("/vendor-payments", {
      method: "POST",
      body: JSON.stringify(payment),
    }),

    getProducts: () => request<Product[]>("/products"),

createProduct: (product: CreateProduct) =>
  request<Product>("/products", {
    method: "POST",
    body: JSON.stringify(product),
  }),

  
updateProduct: (id: number, product: CreateProduct) =>
  request<Product>(`/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(product),
  }),

  
createVendor: (vendor: CreateVendor) =>
  request<Vendor>("/vendors", {
    method: "POST",
    body: JSON.stringify(vendor),
  }),

updateVendor: (id: number, vendor: CreateVendor) =>
  request<Vendor>(`/vendors/${id}`, {
    method: "PUT",
    body: JSON.stringify(vendor),
  }),

getPurchaseOrders: () =>
  request<PurchaseOrder[]>("/purchase-orders"),

createGoodsReceipt: (receipt: CreateGoodsReceipt) =>
  request<GoodsReceiptResult>("/goods-receipts", {
    method: "POST",
    body: JSON.stringify(receipt),
  }),

createPurchaseOrder: (order: CreatePurchaseOrder) =>
  request<PurchaseOrder>("/purchase-orders", {
    method: "POST",
    body: JSON.stringify(order),
  }),

  
};
