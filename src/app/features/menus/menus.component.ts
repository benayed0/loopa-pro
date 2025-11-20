import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../core/layout/header/header.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ApiService } from '../../core/services/api.service';
import {
  Merchant,
  Menu,
  MenuCategory,
  MenuItem,
} from '../../core/models/user.model';

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, LoaderComponent],
  template: `
    <div class="page fade-in">
      <app-header
        [title]="'Mes Menus'"
        [subtitle]="'Créez et gérez vos cartes'"
      >
        <button
          class="btn btn-primary"
          (click)="openCreateMenuModal()"
          [disabled]="merchants().length === 0"
        >
          <span>➕</span> Créer un menu
        </button>
      </app-header>

      <div class="page-content">
        @if (loading()) {
        <app-loader [message]="'Chargement des menus...'"></app-loader>
        } @else if (merchants().length === 0) {
        <div class="empty-state card">
          <div class="empty-icon">🏪</div>
          <h3>Aucun restaurant</h3>
          <p>Créez d'abord un restaurant pour gérer vos menus</p>
          <a href="/merchants" class="btn btn-primary btn-lg">
            <span>🏪</span> Créer un restaurant
          </a>
        </div>
        } @else if (menus().length === 0) {
        <div class="empty-state card">
          <div class="empty-icon">📋</div>
          <h3>Aucun menu pour le moment</h3>
          <p>Créez votre premier menu digital</p>
          <button
            class="btn btn-primary btn-lg"
            (click)="openCreateMenuModal()"
          >
            <span>➕</span> Créer mon premier menu
          </button>
        </div>
        } @else {
        <!-- Menu Selector -->
        <div class="menu-selector card">
          <div class="selector-group">
            <label class="selector-label">
              <span>📋</span> Sélectionnez un menu
            </label>
            <select
              class="selector-select"
              [(ngModel)]="selectedMenuId"
              (change)="onMenuChange()"
            >
              @for (menu of menus(); track menu._id) {
              <option [value]="menu._id">
                {{ getMerchantName(menu.merchant) }} - Menu
              </option>
              }
            </select>
          </div>
        </div>

        @if (selectedMenu()) {
        <!-- Categories Section -->
        <div class="section-header card">
          <h2 class="section-title"><span>🏷️</span> Catégories</h2>
          <button class="btn btn-primary btn-sm" (click)="openCategoryModal()">
            <span>➕</span> Ajouter une catégorie
          </button>
        </div>

        @if (selectedMenu()!.categories.length === 0) {
        <div class="empty-state card">
          <div class="empty-icon">🏷️</div>
          <h3>Aucune catégorie</h3>
          <p>Ajoutez des catégories pour organiser votre menu</p>
          <button class="btn btn-primary" (click)="openCategoryModal()">
            <span>➕</span> Ajouter une catégorie
          </button>
        </div>
        } @else {
        <div class="categories-list">
          @for (category of selectedMenu()!.categories; track category._id) {
          <div class="category-card card">
            <div class="category-header">
              <div class="category-info">
                <span class="category-emoji">{{ category.emoji }}</span>
                <h3 class="category-name">{{ category.name }}</h3>
                <span class="category-count"
                  >{{ category.items.length || 0 }} items</span
                >
              </div>
              <div class="category-actions">
                <button
                  class="btn btn-secondary btn-sm"
                  (click)="openItemModal(category)"
                >
                  <span>➕</span> Ajouter un item
                </button>
                <button
                  class="btn btn-danger btn-sm"
                  (click)="deleteCategory(category._id)"
                >
                  <span>🗑️</span>
                </button>
              </div>
            </div>

            @if (category.items && category.items.length > 0) {
            <div class="items-grid">
              @for (item of category.items; track item._id) {
              <div class="item-card">
                <div class="item-header">
                  <span class="item-emoji">{{ item.emoji }}</span>
                  <div class="item-info">
                    <h4 class="item-name">{{ item.name }}</h4>
                    <p class="item-description">{{ item.description }}</p>
                  </div>
                </div>
                <div class="item-footer">
                  <div class="item-price">
                    <span class="price-value">{{ item.price }}€</span>
                    <span class="points-value">+{{ item.points }} pts</span>
                  </div>
                  <div class="item-actions">
                    <button
                      class="btn-icon"
                      (click)="toggleItemAvailability(item)"
                      [class.active]="item.isAvailable"
                    >
                      <span>{{ item.isAvailable ? '✅' : '❌' }}</span>
                    </button>
                    <button
                      class="btn-icon"
                      (click)="editItem(item, category)"
                    >
                      <span>✏️</span>
                    </button>
                    <button
                      class="btn-icon danger"
                      (click)="deleteItem(item._id)"
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
              }
            </div>
            }
          </div>
          }
        </div>
        } } }
      </div>
    </div>

    <!-- Modal Create Menu -->
    @if (showCreateMenuModal()) {
    <div class="modal-overlay" (click)="closeCreateMenuModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Créer un menu</h2>
          <button class="btn-close" (click)="closeCreateMenuModal()">✕</button>
        </div>

        <form (ngSubmit)="createMenu()" class="modal-body">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🏪</span>
              Restaurant *
            </label>
            <select
              class="form-input"
              [(ngModel)]="menuFormData.merchant"
              name="merchant"
              required
            >
              <option value="">Sélectionnez un restaurant</option>
              @for (merchant of merchants(); track merchant._id) {
              <option [value]="merchant._id">{{ merchant.name }}</option>
              }
            </select>
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
              (click)="closeCreateMenuModal()"
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

    <!-- Modal Category -->
    @if (showCategoryModal()) {
    <div class="modal-overlay" (click)="closeCategoryModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Nouvelle catégorie</h2>
          <button class="btn-close" (click)="closeCategoryModal()">✕</button>
        </div>

        <form (ngSubmit)="saveCategory()" class="modal-body">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🏷️</span>
              Nom de la catégorie *
            </label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="categoryFormData.name"
              name="name"
              placeholder="Entrées, Plats, Desserts..."
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">😊</span>
              Emoji *
            </label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="categoryFormData.emoji"
              name="emoji"
              placeholder="🥗"
              required
            />
            <small class="form-hint"
              >Un seul emoji pour représenter la catégorie</small
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
              (click)="closeCategoryModal()"
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

    <!-- Modal Item -->
    @if (showItemModal()) {
    <div class="modal-overlay" (click)="closeItemModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isEditItemMode() ? 'Modifier l\'item' : 'Nouvel item' }}</h2>
          <button class="btn-close" (click)="closeItemModal()">✕</button>
        </div>

        <form (ngSubmit)="saveItem()" class="modal-body">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🍽️</span>
              Nom de l'item *
            </label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="itemFormData.name"
              name="name"
              placeholder="Pizza Margherita"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">😊</span>
              Emoji *
            </label>
            <input
              type="text"
              class="form-input"
              [(ngModel)]="itemFormData.emoji"
              name="emoji"
              placeholder="🍕"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">📝</span>
              Description
            </label>
            <textarea
              class="form-input"
              [(ngModel)]="itemFormData.description"
              name="description"
              placeholder="Tomate, mozzarella, basilic..."
              rows="3"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">💰</span>
                Prix (€) *
              </label>
              <input
                type="number"
                class="form-input"
                [(ngModel)]="itemFormData.price"
                name="price"
                placeholder="12.50"
                step="0.01"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <span class="label-icon">⭐</span>
                Points fidélité
              </label>
              <input
                type="number"
                class="form-input"
                [(ngModel)]="itemFormData.points"
                name="points"
                placeholder="10"
              />
            </div>
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
              (click)="closeItemModal()"
            >
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              @if (saving()) {
              <span class="spinner-sm"></span> {{ isEditItemMode() ? 'Modification...' : 'Création...' }} } @else {
              <span>💾</span> {{ isEditItemMode() ? 'Modifier' : 'Créer' }} }
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

      .menu-selector {
        margin-bottom: 2rem;
        padding: 1.5rem;
      }
      .selector-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      .selector-label {
        font-weight: 600;
        color: var(--loopa-gray-900);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .selector-select {
        padding: 0.75rem 1rem;
        border: 2px solid var(--loopa-gray-300);
        border-radius: 12px;
        font-size: 1rem;
        font-family: inherit;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
      }
      .selector-select:focus {
        outline: none;
        border-color: var(--loopa-violet-600);
        box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
      }
      .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--loopa-gray-900);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .categories-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .category-card {
        padding: 1.5rem;
      }
      .category-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      .category-info {
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .category-emoji {
        font-size: 2rem;
      }
      .category-name {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--loopa-gray-900);
        margin: 0;
      }
      .category-count {
        background: var(--loopa-violet-100);
        color: var(--loopa-violet-700);
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: 600;
      }
      .category-actions {
        display: flex;
        gap: 0.75rem;
      }

      .items-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--loopa-gray-200);
      }

      .item-card {
        background: var(--loopa-gray-50);
        border-radius: 12px;
        padding: 1rem;
        transition: all 0.2s;
        border: 2px solid transparent;
      }
      .item-card:hover {
        border-color: var(--loopa-violet-200);
        background: white;
      }

      .item-header {
        display: flex;
        gap: 0.75rem;
        margin-bottom: 0.75rem;
      }
      .item-emoji {
        font-size: 2rem;
        flex-shrink: 0;
      }
      .item-info {
        flex: 1;
        min-width: 0;
      }
      .item-name {
        font-size: 1rem;
        font-weight: 600;
        color: var(--loopa-gray-900);
        margin: 0 0 0.25rem 0;
      }
      .item-description {
        font-size: 0.875rem;
        color: var(--loopa-gray-600);
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .item-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 0.75rem;
        border-top: 1px solid var(--loopa-gray-200);
      }
      .item-price {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .price-value {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--loopa-violet-600);
      }
      .points-value {
        font-size: 0.75rem;
        color: var(--loopa-amber-600);
        font-weight: 600;
      }

      .item-actions {
        display: flex;
        gap: 0.5rem;
      }
      .btn-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: none;
        background: var(--loopa-gray-200);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
      }
      .btn-icon:hover {
        background: var(--loopa-gray-300);
      }
      .btn-icon.active {
        background: var(--loopa-success);
      }
      .btn-icon.danger {
        background: var(--loopa-red-100);
      }
      .btn-icon.danger:hover {
        background: var(--loopa-red-200);
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .form-hint {
        display: block;
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: var(--loopa-gray-500);
        font-style: italic;
      }
      textarea.form-input {
        resize: vertical;
        min-height: 80px;
        font-family: inherit;
      }

      @media (max-width: 768px) {
        .items-grid {
          grid-template-columns: 1fr;
        }
        .category-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
        .form-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class MenusComponent implements OnInit {
  private apiService = inject(ApiService);

  merchants = signal<Merchant[]>([]);
  menus = signal<Menu[]>([]);
  selectedMenuId = '';
  selectedMenu = signal<Menu | null>(null);
  loading = signal(true);
  saving = signal(false);
  errorMessage = signal('');

  showCreateMenuModal = signal(false);
  showCategoryModal = signal(false);
  showItemModal = signal(false);
  isEditItemMode = signal(false);

  menuFormData: any = { merchant: '' };
  categoryFormData: any = { name: '', emoji: '' };
  itemFormData: any = {
    _id: '',
    name: '',
    emoji: '',
    description: '',
    price: 0,
    points: 0,
  };
  currentCategoryId: string | null = null;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    this.apiService.getMerchants().subscribe({
      next: (merchants) => {
        this.merchants.set(merchants);

        this.apiService.getMenus().subscribe({
          next: (menus) => {
            this.menus.set(menus);
            if (menus.length > 0) {
              this.selectedMenuId = menus[0]._id;
              this.selectedMenu.set(menus[0]);
            }
            this.loading.set(false);
          },
          error: (error: any) => {
            console.error('Error loading menus:', error);
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

  getMerchantName(merchant: Merchant | string): string {
    if (typeof merchant === 'string') {
      const m = this.merchants().find((m) => m._id === merchant);
      return m?.name || 'Restaurant inconnu';
    }
    return merchant?.name || 'Restaurant inconnu';
  }

  onMenuChange() {
    const menu = this.menus().find((m) => m._id === this.selectedMenuId);
    this.selectedMenu.set(menu || null);
  }

  // Menu operations
  openCreateMenuModal() {
    this.menuFormData = { merchant: '' };
    this.errorMessage.set('');
    this.showCreateMenuModal.set(true);
  }

  closeCreateMenuModal() {
    this.showCreateMenuModal.set(false);
  }

  createMenu() {
    if (!this.menuFormData.merchant) {
      this.errorMessage.set('Veuillez sélectionner un restaurant');
      return;
    }

    this.saving.set(true);
    this.apiService
      .createMenu({ merchant: this.menuFormData.merchant, categories: [] })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.closeCreateMenuModal();
          this.loadData();
        },
        error: (error: any) => {
          this.saving.set(false);
          this.errorMessage.set(
            error.error?.message || 'Erreur lors de la création'
          );
        },
      });
  }

  // Category operations
  openCategoryModal() {
    this.categoryFormData = { name: '', emoji: '' };
    this.errorMessage.set('');
    this.showCategoryModal.set(true);
  }

  closeCategoryModal() {
    this.showCategoryModal.set(false);
  }

  saveCategory() {
    if (!this.categoryFormData.name || !this.categoryFormData.emoji) {
      this.errorMessage.set('Veuillez remplir tous les champs');
      return;
    }

    const menu = this.selectedMenu();
    if (!menu) return;

    this.saving.set(true);

    const categoryData = {
      name: this.categoryFormData.name,
      emoji: this.categoryFormData.emoji,
      order: menu.categories.length,
    };

    this.apiService
      .createMenuCategory(menu._id, categoryData)
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.closeCategoryModal();
          this.loadData();
        },
        error: (error: any) => {
          this.saving.set(false);
          this.errorMessage.set(
            error.error?.message || 'Erreur lors de la création'
          );
        },
      });
  }

  deleteCategory(categoryId: string) {
    if (!confirm('Supprimer cette catégorie et tous ses items ?')) return;

    const menu = this.selectedMenu();
    if (!menu) return;

    this.apiService
      .deleteMenuCategory(menu._id, categoryId)
      .subscribe({
        next: () => this.loadData(),
        error: (error: any) =>
          alert('Erreur: ' + (error.error?.message || 'Erreur inconnue')),
      });
  }

  // Item operations
  openItemModal(category: MenuCategory) {
    this.currentCategoryId = category._id;
    this.isEditItemMode.set(false);
    this.itemFormData = {
      _id: '',
      name: '',
      emoji: '',
      description: '',
      price: 0,
      points: 0,
    };
    this.errorMessage.set('');
    this.showItemModal.set(true);
  }

  editItem(item: MenuItem, category: MenuCategory) {
    this.currentCategoryId = category._id;
    this.isEditItemMode.set(true);
    this.itemFormData = {
      _id: item._id,
      name: item.name,
      emoji: item.emoji,
      description: item.description,
      price: item.price,
      points: item.points,
    };
    this.errorMessage.set('');
    this.showItemModal.set(true);
  }

  closeItemModal() {
    this.showItemModal.set(false);
    this.isEditItemMode.set(false);
    this.currentCategoryId = null;
  }

  saveItem() {
    if (!this.itemFormData.name) {
      this.errorMessage.set("Veuillez remplir le nom de l'item");
      return;
    }

    const menu = this.selectedMenu();
    if (!menu || !this.currentCategoryId) return;

    this.saving.set(true);

    if (this.isEditItemMode()) {
      // Update existing item
      const updateData = {
        name: this.itemFormData.name,
        emoji: this.itemFormData.emoji,
        description: this.itemFormData.description || '',
        price: parseFloat(this.itemFormData.price),
        points: parseInt(this.itemFormData.points) || 0,
      };

      this.apiService.updateMenuItem(this.itemFormData._id, updateData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeItemModal();
          this.loadData();
        },
        error: (error) => {
          this.saving.set(false);
          this.errorMessage.set(
            error.error?.message || 'Erreur lors de la modification'
          );
        },
      });
    } else {
      // Create new item
      const itemData = {
        merchant: (menu.merchant as Merchant)._id,
        name: this.itemFormData.name,
        emoji: this.itemFormData.emoji,
        description: this.itemFormData.description || '',
        price: parseFloat(this.itemFormData.price),
        points: parseInt(this.itemFormData.points) || 0,
        categoryId: this.currentCategoryId,
        menu: menu._id,
        isAvailable: true,
      };

      this.apiService.createMenuItem(itemData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeItemModal();
          this.loadData();
        },
        error: (error) => {
          this.saving.set(false);
          this.errorMessage.set(
            error.error?.message || 'Erreur lors de la création'
          );
        },
      });
    }
  }

  toggleItemAvailability(item: MenuItem) {
    this.apiService
      .updateMenuItem(item._id, { isAvailable: !item.isAvailable })
      .subscribe({
        next: () => this.loadData(),
        error: (error: any) =>
          alert('Erreur: ' + (error.error?.message || 'Erreur inconnue')),
      });
  }

  deleteItem(itemId: string) {
    if (!confirm('Supprimer cet item ?')) return;

    this.apiService.deleteMenuItem(itemId).subscribe({
      next: () => this.loadData(),
      error: (error) =>
        alert('Erreur: ' + (error.error?.message || 'Erreur inconnue')),
    });
  }
}
