export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  products_count?: number;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  active: number;
  category_id: number;
  category_name?: string;
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  subtotal: number;
  stock: number;
}

export interface CartSummary {
  items: CartItem[];
  total: number;
  count: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal?: number;
}

export interface Order {
  id: number;
  user_id: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  items?: OrderItem[];
  items_count?: number;
  user_name?: string;
}
// Adicionamos o <T> para tornar a interface genérica
export interface ApiResponse<T> {
    success: boolean;
    data: T;          // Aqui o dado será do tipo que você passar (Produto, Pedido, etc)
    message?: string;
}

export interface PaginatedResponse<T> {
  products: T[];
  total: number;
  page: number;
  pages: number;
}