/* ─── Produto ─── */

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  available: boolean;
  order?: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  emoji?: string;
  order?: number;
}

/* ─── Pedido ─── */

export type OrderMode = "mesa" | "balcao";
export type OrderStatus = "novo" | "prep" | "pronto" | "entregue";

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface Order {
  id?: string;
  mode: OrderMode;
  mesa?: number;           // preenchido se mode === "mesa"
  clientName?: string;     // preenchido se mode === "balcao"
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/* ─── Cart ─── */

export interface CartState {
  items: CartItem[];
  mode: OrderMode | null;
  mesa: number | null;
  clientName: string | null;
}

/* ─── Config loja ─── */

export interface StoreConfig {
  name: string;
  open: boolean;
  message?: string;
}
