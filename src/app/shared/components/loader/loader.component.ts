import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loader-container" [class.fullscreen]="fullscreen">
      <div class="infinity-loader">
        <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
          <path
            class="infinity-path"
            d="M 20,50
               C 20,20 40,20 50,50
               C 60,80 80,80 100,50
               C 120,20 140,20 150,50
               C 160,80 180,80 180,50"
            fill="none"
            stroke-width="8"
            stroke-linecap="round"
          />
          <circle class="dot dot-1" r="6" />
          <circle class="dot dot-2" r="6" />
        </svg>
      </div>
      @if (message) {
        <p class="loader-message">{{ message }}</p>
      }
    </div>
  `,
  styles: [`
    .loader-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
    }

    .loader-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(249, 250, 251, 0.95);
      z-index: 9999;
    }

    .infinity-loader {
      width: 120px;
      height: 60px;
    }

    .infinity-loader svg {
      width: 100%;
      height: 100%;
    }

    .infinity-path {
      stroke: var(--loopa-violet-600);
      stroke-dasharray: 400;
      stroke-dashoffset: 400;
      animation: drawPath 2s ease-in-out infinite;
    }

    @keyframes drawPath {
      0%, 100% {
        stroke-dashoffset: 400;
        stroke: var(--loopa-violet-600);
      }
      50% {
        stroke-dashoffset: 0;
        stroke: var(--loopa-amber-500);
      }
    }

    .dot {
      fill: var(--loopa-violet-600);
      animation: moveDot 2s ease-in-out infinite;
    }

    .dot-1 {
      animation-delay: 0s;
    }

    .dot-2 {
      animation-delay: 1s;
    }

    @keyframes moveDot {
      0% {
        cx: 20;
        cy: 50;
        fill: var(--loopa-violet-600);
      }
      25% {
        cx: 50;
        cy: 50;
        fill: var(--loopa-violet-500);
      }
      50% {
        cx: 100;
        cy: 50;
        fill: var(--loopa-amber-500);
      }
      75% {
        cx: 150;
        cy: 50;
        fill: var(--loopa-amber-600);
      }
      100% {
        cx: 180;
        cy: 50;
        fill: var(--loopa-violet-600);
      }
    }

    .loader-message {
      color: var(--loopa-gray-700);
      font-weight: 600;
      font-size: 1rem;
      margin: 0;
      animation: pulse 2s ease-in-out infinite;
    }
  `]
})
export class LoaderComponent {
  @Input() fullscreen = false;
  @Input() message = '';
}
