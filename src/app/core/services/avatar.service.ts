import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  private readonly baseUrl = 'https://api.dicebear.com/8.x/thumbs/svg?seed=';

  /**
   * Genera una URL de avatar 3D a partir de una cadena (seed).
   * @param seed - Una cadena única para el usuario, como su nombre completo o email.
   * @returns La URL completa del avatar en formato SVG.
   */
  generateAvatarUrl(seed: string): string {
    // El "seed" asegura que el mismo nombre siempre genere el mismo avatar.
    const encodedSeed = encodeURIComponent(seed);
    return `${this.baseUrl}${encodedSeed}`;
  }
}
