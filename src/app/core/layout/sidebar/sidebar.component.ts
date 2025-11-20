import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: ('owner' | 'manager' | 'staff')[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">∞</span>
          <span class="logo-text">Loopa Pro</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        @for (item of navItems; track item.route) {
          @if (!item.roles || canAccessRoute(item.roles)) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-item"
            >
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        }
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            {{ getUserInitials() }}
          </div>
          <div class="user-details">
            <p class="user-name">{{ authService.currentUser()?.name || 'Utilisateur' }}</p>
            <p class="user-email">{{ authService.currentUser()?.email }}</p>
          </div>
        </div>
        <button class="btn-logout" (click)="logout()">
          <span>🚪</span> Déconnexion
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--sidebar-width);
      background: linear-gradient(180deg, var(--loopa-violet-800) 0%, var(--loopa-violet-900) 100%);
      display: flex;
      flex-direction: column;
      z-index: 100;
      box-shadow: var(--shadow-xl);
    }

    /* Header */
    .sidebar-header {
      padding: 2rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
    }

    .logo-icon {
      font-size: 2rem;
      font-weight: 700;
      transform: rotate(90deg);
    }

    .logo-text {
      font-size: 1.5rem;
      font-weight: 700;
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 1.5rem 0;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9375rem;
      transition: all var(--transition-fast);
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: white;
    }

    .nav-item.active {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border-left-color: var(--loopa-amber-400);
    }

    .nav-icon {
      font-size: 1.25rem;
      width: 1.5rem;
      text-align: center;
    }

    .nav-label {
      flex: 1;
    }

    /* Footer */
    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--loopa-amber-500);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
    }

    .user-details {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.75rem;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-logout {
      width: 100%;
      padding: 0.625rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-logout:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    /* Scrollbar pour la navigation */
    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
    }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Merchants', icon: '🏪', route: '/merchants', roles: ['owner', 'manager'] },
    { label: 'Menus', icon: '📋', route: '/menus' },
    { label: 'Commandes', icon: '🛒', route: '/orders' },
    { label: 'Tables', icon: '🪑', route: '/tables' },
    { label: 'QR Codes', icon: '📱', route: '/qrcodes' },
    { label: 'Utilisateurs', icon: '👥', route: '/users', roles: ['owner'] },
  ];

  canAccessRoute(roles: ('owner' | 'manager' | 'staff')[]): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    return roles.some(role => user.roles.includes(role));
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  }

  logout() {
    this.authService.logout();
  }
}
