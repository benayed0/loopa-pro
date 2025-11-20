import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ApiService } from '../../core/services/api.service';
import { Merchant, Order } from '../../core/models/user.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, LoaderComponent],
  template: `
    <div class="page fade-in">
      <app-header
        [title]="'Commandes'"
        [subtitle]="'Consultez et gérez vos commandes'"
      >
        <button class="btn btn-secondary" (click)="loadOrders()">
          <span>🔄</span> Actualiser
        </button>
      </app-header>

      <div class="page-content">
        @if (loading()) {
          <app-loader [message]="'Chargement des commandes...'"></app-loader>
        } @else if (merchants().length === 0) {
          <div class="empty-state card">
            <div class="empty-icon">🏪</div>
            <h3>Aucun restaurant</h3>
            <p>Créez d'abord un restaurant pour voir les commandes</p>
            <a href="/merchants" class="btn btn-primary btn-lg">
              <span>🏪</span> Créer un restaurant
            </a>
          </div>
        } @else {
          <!-- Filters -->
          <div class="filters-bar card">
            <div class="filter-group">
              <label class="filter-label">
                <span>🏪</span> Restaurant
              </label>
              <select class="filter-select" [(ngModel)]="selectedMerchantFilter" (change)="filterOrders()">
                <option value="">Tous les restaurants</option>
                @for (merchant of merchants(); track merchant._id) {
                  <option [value]="merchant._id">{{ merchant.name }}</option>
                }
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">
                <span>📊</span> Statut paiement
              </label>
              <select class="filter-select" [(ngModel)]="paymentStatusFilter" (change)="filterOrders()">
                <option value="">Tous</option>
                <option value="pending">En attente</option>
                <option value="paid">Payé</option>
              </select>
            </div>

            <div class="filter-group">
              <label class="filter-label">
                <span>💳</span> Méthode
              </label>
              <select class="filter-select" [(ngModel)]="paymentMethodFilter" (change)="filterOrders()">
                <option value="">Toutes</option>
                <option value="card">Carte</option>
                <option value="cash">Espèces</option>
              </select>
            </div>
          </div>

          @if (filteredOrders().length === 0) {
            <div class="empty-state card">
              <div class="empty-icon">🛒</div>
              <h3>Aucune commande</h3>
              <p>Les commandes apparaîtront ici en temps réel</p>
            </div>
          } @else {
            <!-- Stats Summary -->
            <div class="stats-grid">
              <div class="stat-card card">
                <div class="stat-icon">🛒</div>
                <div class="stat-content">
                  <div class="stat-value">{{ filteredOrders().length }}</div>
                  <div class="stat-label">Commandes</div>
                </div>
              </div>

              <div class="stat-card card">
                <div class="stat-icon">💰</div>
                <div class="stat-content">
                  <div class="stat-value">{{ calculateTotal() }}€</div>
                  <div class="stat-label">Total</div>
                </div>
              </div>

              <div class="stat-card card">
                <div class="stat-icon">⭐</div>
                <div class="stat-content">
                  <div class="stat-value">{{ calculateTotalPoints() }}</div>
                  <div class="stat-label">Points distribués</div>
                </div>
              </div>

              <div class="stat-card card">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                  <div class="stat-value">{{ calculatePaidOrders() }}</div>
                  <div class="stat-label">Payées</div>
                </div>
              </div>
            </div>

            <!-- Orders List -->
            <div class="orders-list">
              @for (order of filteredOrders(); track order._id) {
                <div class="order-card card">
                  <div class="order-header">
                    <div class="order-info">
                      <div class="order-id">
                        <span class="order-icon">🛒</span>
                        <span class="order-number">#{{ order._id.slice(-6) }}</span>
                      </div>
                      <div class="order-meta">
                        <span class="meta-item">
                          <span>🏪</span> {{ getMerchantName(order.merchant) }}
                        </span>
                        <span class="meta-item">
                          <span>🪑</span> Table {{ order.table.number }}
                        </span>
                        <span class="meta-item">
                          <span>📅</span> {{ formatDate(order.createdAt) }}
                        </span>
                      </div>
                    </div>

                    <div class="order-badges">
                      <span class="badge" [class]="'badge-' + order.paymentStatus">
                        {{ order.paymentStatus === 'paid' ? '✅ Payé' : '⏳ En attente' }}
                      </span>
                      <span class="badge badge-method">
                        {{ order.paymentMethod === 'card' ? '💳 Carte' : '💵 Espèces' }}
                      </span>
                    </div>
                  </div>

                  <div class="order-body">
                    <!-- Customer Info -->
                    @if (order.customer.name || order.customer.phone) {
                      <div class="customer-info">
                        <span class="customer-icon">👤</span>
                        <div class="customer-details">
                          @if (order.customer.name) {
                            <span class="customer-name">{{ order.customer.name }}</span>
                          }
                          @if (order.customer.phone) {
                            <span class="customer-phone">{{ order.customer.phone }}</span>
                          }
                        </div>
                      </div>
                    }

                    <!-- Order Items -->
                    <div class="order-items">
                      @for (item of order.items; track $index) {
                        <div class="order-item">
                          <span class="item-quantity">{{ item.quantity }}x</span>
                          <span class="item-name">Item</span>
                          <span class="item-price">{{ item.price }}€</span>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="order-footer">
                    <div class="order-total">
                      <div class="total-row">
                        <span class="total-label">Total</span>
                        <span class="total-value">{{ order.total }}€</span>
                      </div>
                      <div class="points-row">
                        <span class="points-icon">⭐</span>
                        <span class="points-value">+{{ order.pointsEarned }} points</span>
                      </div>
                    </div>

                    @if (order.paymentStatus === 'pending') {
                      <button class="btn btn-primary btn-sm" (click)="markAsPaid(order._id)">
                        <span>✅</span> Marquer comme payé
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; background: var(--loopa-gray-50); }
    .page-content { padding: 2rem; max-width: 1400px; margin: 0 auto; }
    .empty-state { text-align: center; padding: 4rem 2rem; }
    .empty-icon { font-size: 5rem; margin-bottom: 1.5rem; }
    .empty-state h3 { font-size: 1.5rem; color: var(--loopa-gray-900); margin-bottom: 0.5rem; }
    .empty-state p { color: var(--loopa-gray-600); margin-bottom: 2rem; }

    /* Filters */
    .filters-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    .filter-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .filter-label { font-weight: 600; color: var(--loopa-gray-900); display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
    .filter-select {
      padding: 0.75rem 1rem; border: 2px solid var(--loopa-gray-300); border-radius: 12px;
      font-size: 1rem; font-family: inherit; background: white; cursor: pointer; transition: all 0.2s;
    }
    .filter-select:focus { outline: none; border-color: var(--loopa-violet-600); box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1); }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
    .stat-icon {
      font-size: 2.5rem;
      background: linear-gradient(135deg, var(--loopa-violet-100), var(--loopa-violet-200));
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-content { flex: 1; }
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--loopa-violet-600);
      line-height: 1;
      margin-bottom: 0.25rem;
    }
    .stat-label {
      font-size: 0.875rem;
      color: var(--loopa-gray-600);
      font-weight: 500;
    }

    /* Orders List */
    .orders-list { display: flex; flex-direction: column; gap: 1.5rem; }

    .order-card {
      padding: 1.5rem;
      transition: all 0.3s ease;
    }
    .order-card:hover { box-shadow: var(--shadow-xl); }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--loopa-gray-100);
    }

    .order-info { flex: 1; }
    .order-id {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }
    .order-icon { font-size: 1.5rem; }
    .order-number {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--loopa-gray-900);
    }

    .order-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--loopa-gray-600);
    }

    .order-badges { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .badge {
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .badge-pending { background: var(--loopa-amber-100); color: var(--loopa-amber-700); }
    .badge-paid { background: #d1fae5; color: #065f46; }
    .badge-method { background: var(--loopa-gray-100); color: var(--loopa-gray-700); }

    .order-body { margin-bottom: 1.5rem; }

    .customer-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--loopa-violet-50);
      border-radius: 12px;
      margin-bottom: 1rem;
    }
    .customer-icon { font-size: 1.5rem; }
    .customer-details { display: flex; flex-direction: column; gap: 0.25rem; }
    .customer-name { font-weight: 600; color: var(--loopa-gray-900); }
    .customer-phone { font-size: 0.875rem; color: var(--loopa-gray-600); }

    .order-items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .order-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: var(--loopa-gray-50);
      border-radius: 8px;
    }
    .item-quantity {
      font-weight: 700;
      color: var(--loopa-violet-600);
      min-width: 40px;
    }
    .item-name { flex: 1; color: var(--loopa-gray-900); font-weight: 500; }
    .item-price { font-weight: 600; color: var(--loopa-gray-700); }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.5rem;
      border-top: 2px solid var(--loopa-gray-100);
    }

    .order-total { display: flex; flex-direction: column; gap: 0.5rem; }
    .total-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .total-label { font-size: 1rem; font-weight: 600; color: var(--loopa-gray-700); }
    .total-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--loopa-violet-600);
    }
    .points-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--loopa-amber-600);
      font-weight: 600;
    }
    .points-icon { font-size: 1rem; }

    @media (max-width: 768px) {
      .filters-bar { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
      .order-header { flex-direction: column; gap: 1rem; }
      .order-footer { flex-direction: column; align-items: stretch; gap: 1rem; }
    }
  `]
})
export class OrdersComponent implements OnInit {
  private apiService = inject(ApiService);

  merchants = signal<Merchant[]>([]);
  orders = signal<Order[]>([]);
  filteredOrders = signal<Order[]>([]);
  loading = signal(true);

  selectedMerchantFilter = '';
  paymentStatusFilter = '';
  paymentMethodFilter = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    this.apiService.getMerchants().subscribe({
      next: (merchants) => {
        this.merchants.set(merchants);
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error loading merchants:', error);
        this.loading.set(false);
      }
    });
  }

  loadOrders() {
    this.apiService.getOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.filteredOrders.set(orders);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading.set(false);
      }
    });
  }

  filterOrders() {
    let filtered = this.orders();

    if (this.selectedMerchantFilter) {
      filtered = filtered.filter(order =>
        typeof order.merchant === 'string'
          ? order.merchant === this.selectedMerchantFilter
          : order.merchant._id === this.selectedMerchantFilter
      );
    }

    if (this.paymentStatusFilter) {
      filtered = filtered.filter(order => order.paymentStatus === this.paymentStatusFilter);
    }

    if (this.paymentMethodFilter) {
      filtered = filtered.filter(order => order.paymentMethod === this.paymentMethodFilter);
    }

    this.filteredOrders.set(filtered);
  }

  getMerchantName(merchant: any): string {
    if (typeof merchant === 'string') {
      const m = this.merchants().find(m => m._id === merchant);
      return m?.name || 'Restaurant inconnu';
    }
    return merchant.name || 'Restaurant inconnu';
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;

    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateTotal(): number {
    return this.filteredOrders().reduce((sum, order) => sum + order.total, 0).toFixed(2) as any;
  }

  calculateTotalPoints(): number {
    return this.filteredOrders().reduce((sum, order) => sum + order.pointsEarned, 0);
  }

  calculatePaidOrders(): number {
    return this.filteredOrders().filter(order => order.paymentStatus === 'paid').length;
  }

  markAsPaid(orderId: string) {
    if (!confirm('Marquer cette commande comme payée ?')) return;

    this.apiService.updateOrder(orderId, { paymentStatus: 'paid' }).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (error) => {
        alert('Erreur: ' + (error.error?.message || 'Erreur inconnue'));
      }
    });
  }
}
