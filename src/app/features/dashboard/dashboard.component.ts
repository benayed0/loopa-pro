import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <div class="dashboard-page">
      <app-header
        [title]="'Bienvenue, ' + getUserName()"
        [subtitle]="'Voici un aperçu de votre activité'"
      ></app-header>

      <div class="dashboard-content">
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-icon">🏪</div>
            <div class="stat-details">
              <h3 class="stat-value">{{ stats.merchants() }}</h3>
              <p class="stat-label">Restaurants</p>
            </div>
          </div>

          <div class="stat-card card">
            <div class="stat-icon">📋</div>
            <div class="stat-details">
              <h3 class="stat-value">{{ stats.menus() }}</h3>
              <p class="stat-label">Menus actifs</p>
            </div>
          </div>

          <div class="stat-card card">
            <div class="stat-icon">🛒</div>
            <div class="stat-details">
              <h3 class="stat-value">{{ stats.orders() }}</h3>
              <p class="stat-label">Commandes</p>
            </div>
          </div>

          <div class="stat-card card">
            <div class="stat-icon">📱</div>
            <div class="stat-details">
              <h3 class="stat-value">{{ stats.tables() }}</h3>
              <p class="stat-label">Tables</p>
            </div>
          </div>
        </div>

        <div class="actions-grid">
          <div class="action-card card">
            <div class="action-icon">🏪</div>
            <h3>Gérer mes restaurants</h3>
            <p>Ajoutez, modifiez ou supprimez vos établissements</p>
            <a routerLink="/merchants" class="btn btn-primary">
              Voir les restaurants
            </a>
          </div>

          <div class="action-card card">
            <div class="action-icon">📋</div>
            <h3>Gérer mes menus</h3>
            <p>Créez et organisez vos menus et articles</p>
            <a routerLink="/menus" class="btn btn-primary">
              Voir les menus
            </a>
          </div>

          <div class="action-card card">
            <div class="action-icon">🛒</div>
            <h3>Voir les commandes</h3>
            <p>Consultez et gérez les commandes en temps réel</p>
            <a routerLink="/orders" class="btn btn-primary">
              Voir les commandes
            </a>
          </div>

          <div class="action-card card">
            <div class="action-icon">📱</div>
            <h3>QR Codes</h3>
            <p>Générez des QR codes pour vos tables</p>
            <a routerLink="/qrcodes" class="btn btn-primary">
              Générer QR Codes
            </a>
          </div>
        </div>

        <div class="welcome-section card">
          <h2>🎉 Bienvenue sur Loopa Pro</h2>
          <p>
            Loopa Pro est votre solution complète pour gérer vos restaurants digitaux.
            Créez vos menus, gérez vos commandes et fidélisez vos clients en toute simplicité.
          </p>
          <div class="features-list">
            <div class="feature">
              <span class="feature-icon">✨</span>
              <span>Menus digitaux interactifs</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🔒</span>
              <span>Gestion sécurisée par magic link</span>
            </div>
            <div class="feature">
              <span class="feature-icon">⚡</span>
              <span>Commandes en temps réel</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🎁</span>
              <span>Programme de fidélité intégré</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      min-height: 100vh;
      background: var(--loopa-gray-50);
    }

    .dashboard-content {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.5rem;
    }

    .stat-icon {
      font-size: 3rem;
    }

    .stat-details {
      flex: 1;
    }

    .stat-value {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--loopa-violet-600);
      margin: 0 0 0.25rem 0;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--loopa-gray-600);
      font-weight: 600;
      margin: 0;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .action-card {
      padding: 2rem;
      text-align: center;
    }

    .action-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .action-card h3 {
      font-size: 1.25rem;
      color: var(--loopa-gray-900);
      margin-bottom: 0.5rem;
    }

    .action-card p {
      font-size: 0.875rem;
      color: var(--loopa-gray-600);
      margin-bottom: 1.5rem;
    }

    .welcome-section {
      padding: 2rem;
    }

    .welcome-section h2 {
      font-size: 1.875rem;
      margin-bottom: 1rem;
    }

    .welcome-section > p {
      font-size: 1rem;
      color: var(--loopa-gray-600);
      margin-bottom: 2rem;
      line-height: 1.75;
    }

    .features-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--loopa-gray-50);
      border-radius: 12px;
      font-weight: 600;
      color: var(--loopa-gray-700);
    }

    .feature-icon {
      font-size: 1.5rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  apiService = inject(ApiService);

  stats = {
    merchants: signal(0),
    menus: signal(0),
    orders: signal(0),
    tables: signal(0),
  };

  ngOnInit() {
    this.loadStats();
  }

  getUserName(): string {
    return this.authService.currentUser()?.name || 'Utilisateur';
  }

  loadStats() {
    // Charger les statistiques depuis l'API
    this.apiService.getMerchants().subscribe({
      next: (merchants) => this.stats.merchants.set(merchants.length),
      error: (err) => console.error('Error loading merchants:', err)
    });

    this.apiService.getMenus().subscribe({
      next: (menus) => this.stats.menus.set(menus.length),
      error: (err) => console.error('Error loading menus:', err)
    });

    this.apiService.getOrders().subscribe({
      next: (orders) => this.stats.orders.set(orders.length),
      error: (err) => console.error('Error loading orders:', err)
    });

    this.apiService.getTables().subscribe({
      next: (tables) => this.stats.tables.set(tables.length),
      error: (err) => console.error('Error loading tables:', err)
    });
  }
}
