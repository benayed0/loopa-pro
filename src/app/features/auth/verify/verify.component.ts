import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  template: `
    <div class="verify-page fade-in">
      <div class="verify-container">
        <div class="verify-card card">
          @if (verifying()) {
            <div class="verifying-state">
              <app-loader [message]="'Vérification en cours...'"></app-loader>
            </div>
          } @else if (error()) {
            <div class="error-state">
              <div class="error-icon">❌</div>
              <h2>Erreur de connexion</h2>
              <p class="error-message">{{ errorMessage() }}</p>
              <a href="/auth/login" class="btn btn-primary">
                <span>🔙</span> Retour à la connexion
              </a>
            </div>
          } @else if (success()) {
            <div class="success-state">
              <div class="success-icon">✅</div>
              <h2>Connexion réussie !</h2>
              <p>Redirection vers votre dashboard...</p>
              <div class="success-animation pulse"></div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verify-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: linear-gradient(135deg, var(--loopa-violet-600) 0%, var(--loopa-violet-900) 100%);
    }

    .verify-container {
      width: 100%;
      max-width: 480px;
    }

    .verify-card {
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .verifying-state,
    .error-state,
    .success-state {
      text-align: center;
      padding: 2rem;
      width: 100%;
    }

    .error-icon,
    .success-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .error-state h2 {
      color: var(--loopa-error);
      margin-bottom: 0.5rem;
    }

    .success-state h2 {
      color: var(--loopa-success);
      margin-bottom: 0.5rem;
    }

    .error-message {
      color: var(--loopa-gray-600);
      margin-bottom: 1.5rem;
    }

    .success-state p {
      color: var(--loopa-gray-600);
      margin-bottom: 1.5rem;
    }

    .success-animation {
      width: 40px;
      height: 40px;
      margin: 0 auto;
      border-radius: 50%;
      background: var(--loopa-success);
    }
  `]
})
export class VerifyComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  verifying = signal(true);
  success = signal(false);
  error = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    // Récupérer le token depuis les query params
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.verifying.set(false);
      this.error.set(true);
      this.errorMessage.set('Token manquant. Veuillez demander un nouveau lien de connexion.');
      return;
    }

    // Vérifier le token
    this.authService.verifyMagicToken(token).subscribe({
      next: (response) => {
        this.verifying.set(false);
        this.success.set(true);

        // Rediriger vers le dashboard après 1.5 secondes
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        this.verifying.set(false);
        this.error.set(true);

        if (err.status === 400) {
          this.errorMessage.set('Le lien de connexion est invalide ou a expiré. Les liens magiques sont valables 10 minutes.');
        } else {
          this.errorMessage.set('Une erreur est survenue lors de la vérification. Veuillez réessayer.');
        }
      }
    });
  }
}
