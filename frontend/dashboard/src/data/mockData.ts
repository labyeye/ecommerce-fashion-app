import { DashboardData } from '../types/dashboard';

export const mockData: DashboardData = {
  metrics: [
    {
      title: 'Revenue Today',
      value: '$12,847',
      change: 12.3,
      changeType: 'positive',
      icon: 'DollarSign'
    },
    {
      title: 'Orders Today',
      value: '184',
      change: -5.2,
      changeType: 'negative',
      icon: 'ShoppingBag'
    },
    {
      title: 'Average Order Value',
      value: '$69.82',
      change: 8.1,
      changeType: 'positive',
      icon: 'TrendingUp'
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: -1.8,
      changeType: 'negative',
      icon: 'Target'
    },
    {
      title: 'Weekly Revenue',
      value: '$87,234',
      change: 15.7,
      changeType: 'positive',
      icon: 'BarChart3'
    },
    {
      title: 'Customer Lifetime Value',
      value: '$245.67',
      change: 4.2,
      changeType: 'positive',
      icon: 'Users'
    }
  ],
  customers: [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      lifetimeValue: 1250.50,
      totalOrders: 12,
      lastActivity: '2024-01-15',
      segment: 'VIP',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'm.chen@email.com',
      lifetimeValue: 89.99,
      totalOrders: 2,
      lastActivity: '2024-01-10',
      segment: 'New',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.r@email.com',
      lifetimeValue: 450.75,
      totalOrders: 8,
      lastActivity: '2023-12-10',
      segment: 'At-Risk',
      status: 'Inactive'
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'd.kim@email.com',
      lifetimeValue: 320.25,
      totalOrders: 5,
      lastActivity: '2024-01-14',
      segment: 'Regular',
      status: 'Active'
    }
  ],
  orders: [
    {
      id: 'ORD-001',
      customer: 'Sarah Johnson',
      total: 125.99,
      status: 'Shipped',
      date: '2024-01-15',
      items: 3
    },
    {
      id: 'ORD-002',
      customer: 'Michael Chen',
      total: 89.99,
      status: 'Processing',
      date: '2024-01-15',
      items: 2
    },
    {
      id: 'ORD-003',
      customer: 'Emily Rodriguez',
      total: 45.50,
      status: 'Pending',
      date: '2024-01-14',
      items: 1
    },
    {
      id: 'ORD-004',
      customer: 'David Kim',
      total: 199.99,
      status: 'Delivered',
      date: '2024-01-13',
      items: 4
    }
  ],
  products: [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      sku: 'WBH-001',
      stock: 45,
      price: 129.99,
      sales: 234,
      profit: 45.2,
      returnRate: 2.1,
      status: 'In Stock'
    },
    {
      id: '2',
      name: 'Smart Fitness Tracker',
      sku: 'SFT-005',
      stock: 8,
      price: 89.99,
      sales: 156,
      profit: 38.5,
      returnRate: 1.8,
      status: 'Low Stock'
    },
    {
      id: '3',
      name: 'USB-C Power Bank',
      sku: 'UCB-010',
      stock: 0,
      price: 39.99,
      sales: 89,
      profit: 22.1,
      returnRate: 3.5,
      status: 'Out of Stock'
    },
    {
      id: '4',
      name: 'Wireless Charging Pad',
      sku: 'WCP-003',
      stock: 120,
      price: 24.99,
      sales: 78,
      profit: 18.9,
      returnRate: 1.2,
      status: 'In Stock'
    }
  ],
  campaigns: [
    {
      id: '1',
      name: 'VIP20 - 20% VIP Discount',
      type: 'Discount Code',
      usage: 145,
      revenue: 12500,
      conversionRate: 8.5,
      status: 'Active'
    },
    {
      id: '2',
      name: 'Welcome Email Series',
      type: 'Email',
      usage: 2340,
      revenue: 45000,
      conversionRate: 12.3,
      status: 'Active'
    },
    {
      id: '3',
      name: 'Instagram Holiday Campaign',
      type: 'Social',
      usage: 567,
      revenue: 18900,
      conversionRate: 6.7,
      status: 'Ended'
    }
  ]
};