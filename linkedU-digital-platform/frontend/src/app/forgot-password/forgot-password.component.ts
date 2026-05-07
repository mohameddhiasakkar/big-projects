import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

type ForgotState = 'form' | 'sent' | 'error';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email = '';
  state: ForgotState = 'form';
  errorMessage = '';
  isSubmitting = false;

  constructor(private readonly authService: AuthService) {}

  onSubmit(): void {
    if (!this.email || !this.email.includes('@')) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.state = 'sent';
        this.isSubmitting = false;
      },
      error: () => {
        // Still show success to prevent email enumeration
        this.state = 'sent';
        this.isSubmitting = false;
      }
    });
  }
}
