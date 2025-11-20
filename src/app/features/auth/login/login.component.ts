import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent],
  template: `
    <div class="login-page fade-in">
      <div class="login-container">
        <div class="login-card card">
          <div class="login-header">
            <div class="logo">
              <span class="logo-icon">∞</span>
              <span class="logo-text">Loopa Pro</span>
            </div>
            <h2>Connexion</h2>
            <p class="subtitle">Accédez à votre espace professionnel</p>
          </div>

          @if (loading()) {
            <app-loader [message]="'Envoi du magic link...'"></app-loader>
          } @else if (success()) {
            <div class="success-message">
              <div class="success-icon">✉️</div>
              <h3>Email envoyé !</h3>
              <p>Vérifiez votre boîte mail et cliquez sur le lien magique pour vous connecter.</p>
              <button class="btn btn-outline" (click)="resetForm()">
                Renvoyer un lien
              </button>
            </div>
          } @else {
            <form (ngSubmit)="onSubmit()" class="login-form">
              <div class="form-group">
                <label class="form-label" for="email">Email professionnel</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  [(ngModel)]="email"
                  class="form-input"
                  placeholder="votre@email.com"
                  required
                  [disabled]="loading()"
                />
              </div>

              @if (errorMessage()) {
                <div class="alert alert-error">
                  <span>⚠️</span>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <button
                type="submit"
                class="btn btn-primary btn-lg w-full"
                [disabled]="loading() || !email"
              >
                <span>✨</span>
                Recevoir un lien magique
              </button>

              <p class="help-text">
                Vous recevrez un email avec un lien de connexion sécurisé valable 10 minutes.
              </p>
            </form>
          }
        </div>

        <div class="login-features">
          <div class="feature-item">
            <span class="feature-icon">🔒</span>
            <div>
              <h4>Sécurisé</h4>
              <p>Pas de mot de passe à retenir</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">⚡</span>
            <div>
              <h4>Rapide</h4>
              <p>Connexion en un clic</p>
            </div>
          </div>
          <div class="feature-item">
            <span class="feature-icon">🎯</span>
            <div>
              <h4>Simple</h4>
              <p>Une seule étape</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, var(--loopa-violet-600) 0%, var(--loopa-violet-900) 100%);
    }

    .login-container {
      width: 100%;
      max-width: 480px;
    }

    .login-card {
      margin-bottom: 2rem;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .logo-icon {
      font-size: 2.5rem;
      font-weight: 700;
      transform: rotate(90deg);
      color: var(--loopa-violet-600);
    }

    .logo-text {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--loopa-gray-900);
    }

    .login-header h2 {
      font-size: 1.875rem;
      color: var(--loopa-gray-900);
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: var(--loopa-gray-600);
      font-size: 1rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .help-text {
      text-align: center;
      font-size: 0.875rem;
      color: var(--loopa-gray-600);
      margin: 0;
    }

    .success-message {
      text-align: center;
      padding: 2rem 0;
    }

    .success-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .success-message h3 {
      color: var(--loopa-success);
      margin-bottom: 0.5rem;
    }

    .success-message p {
      color: var(--loopa-gray-600);
      margin-bottom: 1.5rem;
    }

    .alert {
      padding: 0.875rem 1rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .alert-error {
      background: var(--loopa-error);
      color: white;
    }

    .login-features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .feature-item {
      background: white;
      padding: 1.5rem 1rem;
      border-radius: 16px;
      text-align: center;
      box-shadow: var(--shadow-md);
    }

    .feature-icon {
      font-size: 2rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .feature-item h4 {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--loopa-gray-900);
      margin-bottom: 0.25rem;
    }

    .feature-item p {
      font-size: 0.75rem;
      color: var(--loopa-gray-600);
      margin: 0;
    }

    @media (max-width: 640px) {
      .login-features {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  loading = signal(false);
  success = signal(false);
  errorMessage = signal('');

  async onSubmit() {
    if (!this.email) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.requestMagicLink(this.email).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.success.set(true);
        console.log('Magic link sent:', response);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Une erreur est survenue. Veuillez réessayer.'
        );
      }
    });
  }

  resetForm() {
    this.email = '';
    this.success.set(false);
    this.errorMessage.set('');
  }
}
