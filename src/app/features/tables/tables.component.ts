import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ApiService } from '../../core/services/api.service';
import { Merchant, Table } from '../../core/models/user.model';

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, LoaderComponent],
  template: `
    <div class="page fade-in">
      <app-header
        [title]="'Mes Tables'"
        [subtitle]="'Gérez vos tables et emplacements'"
      >
        <button
          class="btn btn-primary"
          (click)="openCreateModal()"
          [disabled]="merchants().length === 0"
        >
          <span>➕</span> Ajouter une table
        </button>
      </app-header>

      <div class="page-content">
        @if (loading()) {
        <app-loader [message]="'Chargement des tables...'"></app-loader>
        } @else if (merchants().length === 0) {
        <div class="empty-state card">
          <div class="empty-icon">🏪</div>
          <h3>Aucun restaurant</h3>
          <p>Créez d'abord un restaurant pour ajouter des tables</p>
          <a href="/merchants" class="btn btn-primary btn-lg">
            <span>🏪</span> Créer un restaurant
          </a>
        </div>
        } @else if (tables().length === 0) {
        <div class="empty-state card">
          <div class="empty-icon">🪑</div>
          <h3>Aucune table pour le moment</h3>
          <p>Ajoutez des tables pour générer des QR codes</p>
          <button class="btn btn-primary btn-lg" (click)="openCreateModal()">
            <span>➕</span> Ajouter ma première table
          </button>
        </div>
        } @else {
        <!-- Filter by merchant -->
        <div class="filters card">
          <div class="filter-group">
            <label class="filter-label"> <span>🏪</span> Restaurant </label>
            <select
              class="filter-select"
              [(ngModel)]="selectedMerchantFilter"
              (change)="filterTables()"
            >
              <option value="">Tous les restaurants</option>
              @for (merchant of merchants(); track merchant._id) {
              <option [value]="merchant._id">{{ merchant.name }}</option>
              }
            </select>
          </div>
        </div>

        <div class="tables-grid">
          @for (table of filteredTables(); track table._id) {
          <div class="table-card card">
            <div class="table-header">
              <div class="table-icon">🪑</div>
              <h3 class="table-number">Table {{ table.number }}</h3>
            </div>

            <div class="table-details">
              <div class="detail-row">
                <span class="detail-icon">🏪</span>
                <span class="detail-text">{{
                  getMerchantName(table.merchant)
                }}</span>
              </div>
            </div>

            <div class="table-actions">
              <button
                class="btn btn-secondary btn-sm"
                (click)="viewQRCode(table)"
              >
                <span>📱</span> QR Code
              </button>
              <button
                class="btn btn-danger btn-sm"
                (click)="deleteTable(table._id)"
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

    <!-- Modal Create Table -->
    @if (showModal()) {
    <div class="modal-overlay" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Nouvelle table</h2>
          <button class="btn-close" (click)="closeModal()">✕</button>
        </div>

        <form (ngSubmit)="saveTable()" class="modal-body">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🏪</span>
              Restaurant *
            </label>
            <select
              class="form-input"
              [(ngModel)]="formData.merchant"
              name="merchant"
              required
            >
              <option value="">Sélectionnez un restaurant</option>
              @for (merchant of merchants(); track merchant._id) {
              <option [value]="merchant._id">{{ merchant.name }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🪑</span>
              Numéro de table *
            </label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="formData.number"
              name="number"
              placeholder="A1, B12, Terrasse 5, etc."
              required
            />
            <small class="form-hint"
              >Ex: A1, B12, Terrasse 5, Bar 1, etc.</small
            >
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
              <span class="spinner-sm"></span> Création... } @else {
              <span>💾</span> Créer }
            </button>
          </div>
        </form>
      </div>
    </div>
    }

    <!-- Modal QR Code -->
    @if (showQRModal()) {
    <div class="modal-overlay" (click)="closeQRModal()">
      <div class="modal-content qr-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>QR Code - Table {{ currentTable()?.number }}</h2>
          <button class="btn-close" (click)="closeQRModal()">✕</button>
        </div>

        <div class="modal-body">
          @if (loadingQR()) {
          <div class="qr-loading">
            <app-loader [message]="'Génération du QR code...'"></app-loader>
          </div>
          } @else if (qrCodeData()) {
          <div class="qr-container">
            <div class="qr-image-wrapper">
              <img [src]="qrCodeData()!.image" alt="QR Code" class="qr-image" />
            </div>

            <div class="qr-info">
              <div class="info-row">
                <span class="info-label">Restaurant:</span>
                <span class="info-value">{{
                  currentTable()!.merchant.name
                }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Table:</span>
                <span class="info-value">{{ currentTable()!.number }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">URL:</span>
                <span class="info-value url">{{ qrCodeData()!.url }}</span>
              </div>
            </div>

            <div class="qr-actions">
              <button class="btn btn-primary" (click)="downloadQRCode()">
                <span>💾</span> Télécharger
              </button>
              <button class="btn btn-secondary" (click)="printQRCode()">
                <span>🖨️</span> Imprimer
              </button>
            </div>
          </div>
          } @else {
          <div class="alert alert-error">
            <span>⚠️</span> Erreur lors de la génération du QR code
          </div>
          }
        </div>
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

      .filters {
        margin-bottom: 2rem;
        padding: 1.5rem;
      }
      .filter-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .filter-label {
        font-weight: 600;
        color: var(--loopa-gray-900);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .filter-select {
        padding: 0.75rem 1rem;
        border: 2px solid var(--loopa-gray-300);
        border-radius: 12px;
        font-size: 1rem;
        font-family: inherit;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
      }
      .filter-select:focus {
        outline: none;
        border-color: var(--loopa-violet-600);
        box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
      }

      .tables-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        animation: fadeIn 0.5s ease-out;
      }

      .table-card {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        transition: all 0.3s ease;
      }
      .table-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
      }

      .table-header {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .table-icon {
        font-size: 2.5rem;
        background: linear-gradient(
          135deg,
          var(--loopa-amber-100),
          var(--loopa-amber-200)
        );
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .table-number {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--loopa-gray-900);
        margin: 0;
      }

      .table-details {
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

      .table-actions {
        display: flex;
        gap: 0.75rem;
        padding-top: 1rem;
        border-top: 1px solid var(--loopa-gray-200);
      }
      .btn-sm {
        flex: 1;
      }

      .form-hint {
        display: block;
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: var(--loopa-gray-500);
        font-style: italic;
      }

      /* QR Modal */
      .qr-modal {
        max-width: 700px;
      }
      .qr-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        align-items: center;
      }
      .qr-image-wrapper {
        background: white;
        padding: 2rem;
        border-radius: 16px;
        border: 2px solid var(--loopa-gray-200);
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .qr-image {
        width: 300px;
        height: 300px;
        display: block;
      }

      .qr-info {
        width: 100%;
        background: var(--loopa-gray-50);
        padding: 1.5rem;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .info-label {
        font-weight: 600;
        color: var(--loopa-gray-700);
      }
      .info-value {
        color: var(--loopa-gray-900);
        font-weight: 500;
      }
      .info-value.url {
        font-size: 0.875rem;
        word-break: break-all;
        text-align: right;
        color: var(--loopa-violet-600);
      }

      .qr-actions {
        display: flex;
        gap: 1rem;
        width: 100%;
      }
      .qr-actions .btn {
        flex: 1;
      }

      .qr-loading {
        min-height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      @media (max-width: 768px) {
        .tables-grid {
          grid-template-columns: 1fr;
        }
        .qr-image {
          width: 200px;
          height: 200px;
        }
      }
    `,
  ],
})
export class TablesComponent implements OnInit {
  private apiService = inject(ApiService);

  merchants = signal<Merchant[]>([]);
  tables = signal<Table[]>([]);
  filteredTables = signal<Table[]>([]);
  loading = signal(true);
  saving = signal(false);
  showModal = signal(false);
  showQRModal = signal(false);
  loadingQR = signal(false);
  errorMessage = signal('');

  selectedMerchantFilter = '';
  currentTable = signal<Table | null>(null);
  qrCodeData = signal<{ tableId: string; url: string; image: string } | null>(
    null
  );

  formData: any = {
    merchant: '',
    number: '',
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    // Load merchants first
    this.apiService.getMerchants().subscribe({
      next: (merchants) => {
        this.merchants.set(merchants);

        // Then load all tables
        this.apiService.getTables().subscribe({
          next: (tables) => {
            this.tables.set(tables);
            this.filteredTables.set(tables);
            this.loading.set(false);
          },
          error: (error) => {
            console.error('Error loading tables:', error);
            this.loading.set(false);
          },
        });
      },
      error: (error) => {
        console.error('Error loading merchants:', error);
        this.loading.set(false);
      },
    });
  }

  filterTables() {
    if (this.selectedMerchantFilter) {
      this.filteredTables.set(
        this.tables().filter(
          (t) => t.merchant._id === this.selectedMerchantFilter
        )
      );
    } else {
      this.filteredTables.set(this.tables());
    }
  }

  getMerchantName(merchant: Merchant | string): string {
    return typeof merchant === 'string'
      ? 'Restaurant inconnu'
      : merchant?.name || 'Restaurant inconnu';
  }

  openCreateModal() {
    this.formData = {
      merchant: this.selectedMerchantFilter || '',
      number: '',
    };
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.errorMessage.set('');
  }

  saveTable() {
    if (!this.formData.merchant || !this.formData.number) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const tableData = {
      merchant: this.formData.merchant,
      number: this.formData.number.trim(),
    };

    this.apiService.createTable(tableData).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeModal();
        this.loadData();
      },
      error: (error) => {
        this.saving.set(false);
        this.errorMessage.set(
          error.error?.message || 'Une erreur est survenue lors de la création'
        );
      },
    });
  }

  deleteTable(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette table ?')) {
      return;
    }

    this.apiService.deleteTable(id).subscribe({
      next: () => {
        this.loadData();
      },
      error: (error) => {
        alert(
          'Erreur lors de la suppression: ' +
            (error.error?.message || 'Erreur inconnue')
        );
      },
    });
  }

  viewQRCode(table: Table) {
    this.currentTable.set(table);
    this.showQRModal.set(true);
    this.loadingQR.set(true);
    this.qrCodeData.set(null);

    // Generate QR code with production URL
    const baseUrl = 'https://loopa.app'; // TODO: Make this configurable

    this.apiService.getTableQRCode(table._id, baseUrl).subscribe({
      next: (qrData) => {
        this.qrCodeData.set(qrData);
        this.loadingQR.set(false);
      },
      error: (error) => {
        console.error('Error generating QR code:', error);
        this.loadingQR.set(false);
      },
    });
  }

  closeQRModal() {
    this.showQRModal.set(false);
    this.currentTable.set(null);
    this.qrCodeData.set(null);
  }

  downloadQRCode() {
    const qrData = this.qrCodeData();
    const table = this.currentTable();
    if (!qrData || !table) return;

    const link = document.createElement('a');
    link.download = `QRCode-Table-${table.number}.png`;
    link.href = qrData.image;
    link.click();
  }

  printQRCode() {
    const qrData = this.qrCodeData();
    if (!qrData) return;

    const printWindow = window.open('', '', 'width=600,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - Table ${this.currentTable()?.number}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 2rem;
              font-family: Arial, sans-serif;
            }
            h1 { margin-bottom: 1rem; }
            img { width: 400px; height: 400px; }
            .info { margin-top: 1rem; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Table ${this.currentTable()?.number}</h1>
          <img src="${qrData.image}" alt="QR Code" />
          <div class="info">
            <p><strong>${
              (this.currentTable()!.merchant as Merchant).name
            }</strong></p>
            <p>${qrData.url}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}
