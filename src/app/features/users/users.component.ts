import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../core/layout/header/header.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  template: `
    <div class="page fade-in">
      <app-header
        [title]="'Utilisateurs'"
        [subtitle]="'Gérez l\\'équipe de vos restaurants'"
      >
        <button class="btn btn-primary">
          <span>➕</span> Inviter un utilisateur
        </button>
      </app-header>

      <div class="page-content">
        <div class="empty-state card">
          <div class="empty-icon">👥</div>
          <h3>Gérez votre équipe</h3>
          <p>Invitez des managers et du staff pour gérer vos restaurants</p>
          <button class="btn btn-primary btn-lg">
            <span>➕</span> Inviter un membre
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      background: var(--loopa-gray-50);
    }

    .page-content {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-icon {
      font-size: 5rem;
      margin-bottom: 1.5rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: var(--loopa-gray-900);
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--loopa-gray-600);
      margin-bottom: 2rem;
    }
  `]
})
export class UsersComponent {}
