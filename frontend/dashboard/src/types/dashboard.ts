export interface MetricCard {
  title: string;
  value: string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  lifetimeValue: number;
  totalOrders: number;
  lastActivity: string;
  segment: 'VIP' | 'Regular' | 'At-Risk' | 'New';
  status: 'Active' | 'Inactive';
}

export interface Order {
  id: string;
  customer: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  items: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  sales: number;
  profit: number;
  returnRate: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Campaign {
  id: string;
  name: string;
  type: 'Discount Code' | 'Email' | 'Social';
  usage: number;
  revenue: number;
  conversionRate: number;
  status: 'Active' | 'Paused' | 'Ended';
}

export interface DashboardData {
  metrics: MetricCard[];
  customers: Customer[];
  orders: Order[];
  products: Product[];
  campaigns: Campaign[];
}