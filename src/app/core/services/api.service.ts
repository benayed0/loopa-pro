import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Merchant, Menu, MenuItem, Order, Table } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000';

  // ===== Auth =====
  requestMagicLink(email: string): Observable<{ message: string; magicToken?: string }> {
    return this.http.post<{ message: string; magicToken?: string }>(
      `${this.API_URL}/users/auth/request-magic-link`,
      { email }
    );
  }

  verifyMagicToken(token: string): Observable<{ message: string; accessToken: string; user: User }> {
    return this.http.post<{ message: string; accessToken: string; user: User }>(
      `${this.API_URL}/users/auth/verify`,
      { token }
    );
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/me`);
  }

  // ===== Users =====
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${id}`);
  }

  createUser(userData: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users`, userData);
  }

  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/users/${id}`, userData);
  }

  deleteUser(id: string): Observable<User> {
    return this.http.delete<User>(`${this.API_URL}/users/${id}`);
  }

  // ===== Merchants =====
  getMerchants(): Observable<Merchant[]> {
    return this.http.get<Merchant[]>(`${this.API_URL}/merchant`);
  }

  getMerchant(id: string): Observable<Merchant> {
    return this.http.get<Merchant>(`${this.API_URL}/merchant/${id}`);
  }

  createMerchant(merchantData: Partial<Merchant>): Observable<Merchant> {
    return this.http.post<Merchant>(`${this.API_URL}/merchant`, merchantData);
  }

  updateMerchant(id: string, merchantData: Partial<Merchant>): Observable<Merchant> {
    return this.http.patch<Merchant>(`${this.API_URL}/merchant/${id}`, merchantData);
  }

  deleteMerchant(id: string): Observable<Merchant> {
    return this.http.delete<Merchant>(`${this.API_URL}/merchant/${id}`);
  }

  // ===== Tables =====
  getTables(): Observable<Table[]> {
    return this.http.get<Table[]>(`${this.API_URL}/table`);
  }

  getTable(id: string): Observable<Table> {
    return this.http.get<Table>(`${this.API_URL}/table/${id}`);
  }

  createTable(tableData: Partial<Table>): Observable<Table> {
    return this.http.post<Table>(`${this.API_URL}/table`, tableData);
  }

  updateTable(id: string, tableData: Partial<Table>): Observable<Table> {
    return this.http.patch<Table>(`${this.API_URL}/table/${id}`, tableData);
  }

  deleteTable(id: string): Observable<Table> {
    return this.http.delete<Table>(`${this.API_URL}/table/${id}`);
  }

  // ===== Menus =====
  getMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.API_URL}/menu`);
  }

  getMenu(id: string): Observable<Menu> {
    return this.http.get<Menu>(`${this.API_URL}/menu/${id}`);
  }

  createMenu(menuData: Partial<Menu>): Observable<Menu> {
    return this.http.post<Menu>(`${this.API_URL}/menu`, menuData);
  }

  updateMenu(id: string, menuData: Partial<Menu>): Observable<Menu> {
    return this.http.patch<Menu>(`${this.API_URL}/menu/${id}`, menuData);
  }

  deleteMenu(id: string): Observable<Menu> {
    return this.http.delete<Menu>(`${this.API_URL}/menu/${id}`);
  }

  addItemToCategory(menuId: string, categoryId: string, itemId: string): Observable<Menu> {
    return this.http.post<Menu>(
      `${this.API_URL}/menu/${menuId}/category/${categoryId}/item/${itemId}`,
      {}
    );
  }

  reorderCategories(menuId: string, newOrder: { id: string; order: number }[]): Observable<Menu> {
    return this.http.post<Menu>(
      `${this.API_URL}/menu/${menuId}/reorder`,
      { newOrderArray: newOrder }
    );
  }

  createMenuCategory(menuId: string, categoryData: { name: string; emoji: string; order: number }): Observable<Menu> {
    return this.http.post<Menu>(
      `${this.API_URL}/menu/${menuId}/category`,
      categoryData
    );
  }

  deleteMenuCategory(menuId: string, categoryId: string): Observable<Menu> {
    return this.http.delete<Menu>(
      `${this.API_URL}/menu/${menuId}/category/${categoryId}`
    );
  }

  // ===== Menu Items =====
  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.API_URL}/menu-item`);
  }

  getMenuItem(id: string): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.API_URL}/menu-item/${id}`);
  }

  createMenuItem(itemData: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.API_URL}/menu-item`, itemData);
  }

  updateMenuItem(id: string, itemData: Partial<MenuItem>): Observable<MenuItem> {
    return this.http.patch<MenuItem>(`${this.API_URL}/menu-item/${id}`, itemData);
  }

  deleteMenuItem(id: string): Observable<MenuItem> {
    return this.http.delete<MenuItem>(`${this.API_URL}/menu-item/${id}`);
  }

  // ===== Orders =====
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_URL}/order`);
  }

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.API_URL}/order/${id}`);
  }

  createOrder(orderData: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(`${this.API_URL}/order`, orderData);
  }

  updateOrder(id: string, orderData: Partial<Order>): Observable<Order> {
    return this.http.patch<Order>(`${this.API_URL}/order/${id}`, orderData);
  }

  deleteOrder(id: string): Observable<Order> {
    return this.http.delete<Order>(`${this.API_URL}/order/${id}`);
  }

  // ===== QR Codes =====
  getTableQRCode(tableId: string, baseUrl?: string): Observable<{ tableId: string; url: string; image: string }> {
    let url = `${this.API_URL}/qrcode/table/${tableId}/image`;
    if (baseUrl) {
      url += `?baseUrl=${encodeURIComponent(baseUrl)}`;
    }
    return this.http.get<{ tableId: string; url: string; image: string }>(url);
  }

  downloadTableQRCode(tableId: string, baseUrl?: string): string {
    const params = baseUrl ? `?baseUrl=${encodeURIComponent(baseUrl)}` : '';
    return `${this.API_URL}/qrcode/table/${tableId}/download${params}`;
  }
}
