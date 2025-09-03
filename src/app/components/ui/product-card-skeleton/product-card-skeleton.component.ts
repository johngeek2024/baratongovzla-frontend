import { Component } from '@angular/core';

@Component({
  selector: 'app-product-card-skeleton',
  standalone: true,
  // ✅ CORRECCIÓN: Se reemplaza el template y se añaden los estilos del efecto Shimmer.
  template: `
    <div class="skeleton-card">
      <div class="skeleton-image shimmer"></div>
      <div class="skeleton-text-container">
        <div class="skeleton-text title shimmer"></div>
        <div class="skeleton-text price shimmer"></div>
      </div>
      <div class="skeleton-button shimmer"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      /* Definición de variables CSS locales para el skeleton */
      --skeleton-bg: #1A2233;
      --shimmer-color: #2A364D;
      --animation-duration: 1.5s;
    }

    /* Elemento base que tendrá la animación de brillo */
    .shimmer {
      position: relative;
      overflow: hidden;
      background-color: var(--skeleton-bg);
    }

    .shimmer::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background: linear-gradient(90deg,
          transparent,
          var(--shimmer-color),
          transparent);
      animation: shimmer var(--animation-duration) infinite;
    }

    .skeleton-card {
      border-radius: 16px; /* 1rem */
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      border: 1px solid hsl(var(--color-border) / 0.5);
    }

    .skeleton-image {
      width: 100%;
      padding-bottom: 75%; /* Aspect ratio 4:3 */
      border-radius: 12px; /* 0.75rem */
    }

    .skeleton-text-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .skeleton-text {
      height: 16px;
      border-radius: 8px;
    }

    .skeleton-text.title {
      width: 80%;
    }

    .skeleton-text.price {
      width: 50%;
      height: 24px; /* Un poco más alto para el precio */
    }

    .skeleton-button {
      width: 100%;
      height: 44px;
      border-radius: 10px; /* 0.625rem */
      margin-top: 0.5rem;
    }

    /* La Animación de Brillo */
    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
  `]
})
export class ProductCardSkeletonComponent {}
