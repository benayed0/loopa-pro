import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ApiService } from '../../core/services/api.service';
import { Merchant } from '../../core/models/user.model';

@Component({
  selector: 'app-merchants',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, LoaderComponent],
  template: `
    <div class="page fade-in">
      <app-header
        [title]="'Mes Restaurants'"
        [subtitle]="'Gérez vos établissements'"
      >
        <button class="btn btn-primary" (click)="openCreateModal()">
          <span>➕</span> Ajouter un restaurant
        </button>
      </app-header>

      <div class="page-content">
        @if (loading()) {
        <app-loader [message]="'Chargement des restaurants...'"></app-loader>
        } @else if (merchants().length === 0) {
        <div class="empty-state card">
          <div class="empty-icon">🏪</div>
          <h3>Aucun restaurant pour le moment</h3>
          <p>Commencez par ajouter votre premier établissement</p>
          <button class="btn btn-primary btn-lg" (click)="openCreateModal()">
            <span>➕</span> Créer mon premier restaurant
          </button>
        </div>
        } @else {
        <div class="merchants-grid">
          @for (merchant of merchants(); track merchant._id) {
          <div class="merchant-card card">
            <div class="merchant-header">
              <div class="merchant-icon">🏪</div>
              <h3 class="merchant-name">{{ merchant.name }}</h3>
            </div>

            <div class="merchant-details">
              <div class="detail-row">
                <span class="detail-icon">📍</span>
                <span class="detail-text">{{ merchant.address }}</span>
              </div>

              @if (merchant.phone) {
              <div class="detail-row">
                <span class="detail-icon">📞</span>
                <span class="detail-text">{{ merchant.phone }}</span>
              </div>
              } @if (merchant.email) {
              <div class="detail-row">
                <span class="detail-icon">✉️</span>
                <span class="detail-text">{{ merchant.email }}</span>
              </div>
              }
            </div>

            <div class="merchant-stats">
              <div class="stat">
                <span class="stat-icon">🪑</span>
                <span class="stat-value">{{
                  merchant.tables?.length || 0
                }}</span>
                <span class="stat-label">Tables</span>
              </div>
              <div class="stat">
                <span class="stat-icon">📋</span>
                <span class="stat-value">{{ merchant.menu?.length || 0 }}</span>
                <span class="stat-label">Menu</span>
              </div>
            </div>

            <div class="merchant-actions">
              <button
                class="btn btn-secondary btn-sm"
                (click)="editMerchant(merchant)"
              >
                <span>✏️</span> Modifier
              </button>
              <button
                class="btn btn-danger btn-sm"
                (click)="deleteMerchant(merchant._id)"
              >
                <span>🗑️</span> Supprimer
              </button>
            </div>
          </div>
          }
        </div>
        }
      </div>
    </div>

    <!-- Modal Create/Edit -->
    @if (showModal()) {
    <div class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>
            {{ isEditMode() ? 'Modifier le restaurant' : 'Nouveau restaurant' }}
          </h2>
          <button class="btn-close" (click)="closeModal()">✕</button>
        </div>

        <form (ngSubmit)="saveMerchant()" class="modal-body">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🏪</span>
              Nom du restaurant *
            </label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="formData.name"
              name="name"
              placeholder="Le Petit Bistrot"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📍</span>
              Adresse *
            </label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="formData.address"
              name="address"
              placeholder="123 Rue de la Paix, Paris"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📞</span>
              Téléphone
            </label>
            <input
              type="tel"
              class="form-input"
              [(ngModel)]="formData.phone"
              name="phone"
              placeholder="+33 1 23 45 67 89"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">✉️</span>
              Email
            </label>
            <input
              type="email"
              class="form-input"
              [(ngModel)]="formData.email"
              name="email"
              placeholder="contact@restaurant.fr"
            />
          </div>

          @if (errorMessage()) {
          <div class="alert alert-error">
            <span>⚠️</span> {{ errorMessage() }}
          </div>
          }

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="closeModal()"
            >
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              @if (saving()) {
              <span class="spinner-sm"></span> Enregistrement... } @else {
              <span>💾</span> {{ isEditMode() ? 'Mettre à jour' : 'Créer' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
    }
  `,
  styles: [
    `
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
      .merchants-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
        animation: fadeIn 0.5s ease-out;
      }
      .merchant-card {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        transition: all 0.3s ease;
      }
      .merchant-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
      }
      .merchant-header {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .merchant-icon {
        font-size: 2.5rem;
        background: linear-gradient(
          135deg,
          var(--loopa-violet-100),
          var(--loopa-violet-200)
        );
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .merchant-name {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--loopa-gray-900);
        margin: 0;
      }
      .merchant-details {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding-left: 0.5rem;
      }
      .detail-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: var(--loopa-gray-700);
        font-size: 0.95rem;
      }
      .detail-icon {
        font-size: 1.2rem;
        width: 24px;
      }
      .detail-text {
        flex: 1;
      }
      .merchant-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--loopa-gray-200);
      }
      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.75rem;
        background: var(--loopa-gray-50);
        border-radius: 8px;
      }
      .stat-icon {
        font-size: 1.5rem;
      }
      .stat-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--loopa-violet-600);
      }
      .stat-label {
        font-size: 0.85rem;
        color: var(--loopa-gray-600);
      }
      .merchant-actions {
        display: flex;
        gap: 0.75rem;
        padding-top: 1rem;
        border-top: 1px solid var(--loopa-gray-200);
      }
      .btn-sm {
        flex: 1;
      }
      .label-icon {
        font-size: 1.1rem;
      }
      @media (max-width: 768px) {
        .merchants-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class MerchantsComponent implements OnInit {
  private apiService = inject(ApiService);

  merchants = signal<Merchant[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  isEditMode = signal(false);
  errorMessage = signal('');

  formData: any = {
    name: '',
    address: '',
    phone: '',
    email: '',
  };

  selectedMerchantId: string | null = null;

  ngOnInit() {
    this.loadMerchants();
  }

  loadMerchants() {
    this.loading.set(true);
    this.apiService.getMerchants().subscribe({
      next: (merchants) => {
        this.merchants.set(merchants);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading merchants:', error);
        this.loading.set(false);
      },
    });
  }

  openCreateModal() {
    this.isEditMode.set(false);
    this.selectedMerchantId = null;
    this.formData = {
      name: '',
      address: '',
      phone: '',
      email: '',
    };
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  editMerchant(merchant: Merchant) {
    this.isEditMode.set(true);
    this.selectedMerchantId = merchant._id;
    this.formData = {
      name: merchant.name,
      address: merchant.address,
      phone: merchant.phone || '',
      email: merchant.email || '',
    };
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.errorMessage.set('');
  }

  saveMerchant() {
    if (!this.formData.name || !this.formData.address) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const merchantData = {
      name: this.formData.name.trim(),
      address: this.formData.address.trim(),
      phone: this.formData.phone?.trim() || undefined,
      email: this.formData.email?.trim() || undefined,
    };

    const request$ =
      this.isEditMode() && this.selectedMerchantId
        ? this.apiService.updateMerchant(this.selectedMerchantId, merchantData)
        : this.apiService.createMerchant(merchantData);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadMerchants();
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(
          error.error?.message ||
            "Une erreur est survenue lors de l'enregistrement"
        );
      },
    });
  }

  deleteMerchant(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce restaurant ?')) {
      return;
    }

    this.apiService.deleteMerchant(id).subscribe({
      next: () => {
        this.loadMerchants();
      },
      error: (error) => {
        alert(
          'Erreur lors de la suppression: ' +
            (error.error?.message || 'Erreur inconnue')
        );
      },
    });
  }
}
