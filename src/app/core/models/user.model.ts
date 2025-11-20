export interface User {
  _id: string;
  email: string;
  name?: string;
  merchants: Merchant[];
  roles: ('owner' | 'manager' | 'staff')[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Merchant {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  tables?: Table[];
  menu?: Menu[];
}

export interface Table {
  _id: string;
  merchant: Merchant;
  number: string;
}

export interface Menu {
  _id: string;
  merchant: Merchant;
  categories: MenuCategory[];
}

export interface MenuCategory {
  _id: string;
  name: string;
  emoji: string;
  order: number;
  items: MenuItem[];
}

export interface MenuItem {
  _id: string;
  merchant: string;
  name: string;
  emoji: string;
  description: string;
  price: number;
  points: number;
  isAvailable: boolean;
}

export interface Order {
  _id: string;
  merchant: Merchant;
  table: Table;
  customer: Customer;
  items: OrderItem[];
  total: number;
  pointsEarned: number;
  paymentMethod: 'cash' | 'card';
  paymentStatus: 'pending' | 'paid';
  createdAt: Date;
}

export interface OrderItem {
  itemId: string;
  quantity: number;
  price: number;
}

export interface Customer {
  _id: string;
  deviceId: string;
  phone?: string;
  email?: string;
  name?: string;
  totalPoints: number;
  orders: string[];
}
