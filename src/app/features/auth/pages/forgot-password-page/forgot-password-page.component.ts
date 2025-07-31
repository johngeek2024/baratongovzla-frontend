import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './forgot-password-page.component.html',
})
export class ForgotPasswordPageComponent {
  // Lógica de formulario reactivo irá aquí
}
