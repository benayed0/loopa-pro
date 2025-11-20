import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-content">
        <h1 class="page-title">{{ title }}</h1>
        @if (subtitle) {
          <p class="page-subtitle">{{ subtitle }}</p>
        }
      </div>
      <ng-content></ng-content>
    </header>
  `,
  styles: [`
    .header {
      height: var(--header-height);
      background: white;
      border-bottom: 1px solid var(--loopa-gray-200);
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: var(--shadow-sm);
    }

    .header-content {
      flex: 1;
    }

    .page-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--loopa-gray-900);
      margin: 0;
      line-height: 1.2;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--loopa-gray-600);
      font-weight: 500;
      margin: 0.25rem 0 0 0;
    }
  `]
})
export class HeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
