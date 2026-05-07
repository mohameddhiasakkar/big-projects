import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

type ResetState = 'form' | 'success' | 'invalid' | 'expired' | 'error';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  state: ResetState = 'form';
  errorMessage = '';
  isSubmitting = false;
  showPassword = false;
  showConfirm = false;
  countdown = 5;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state = 'invalid';
    } else {
      this.token = token;
    }
  }

  get passwordStrength(): string {
    const len = this.newPassword.length;
    if (len === 0) return '';
    if (len < 6) return 'Weak';
    if (len < 9) return 'Medium';
    return 'Strong';
  }

  get passwordStrengthClass(): string {
    const len = this.newPassword.length;
    if (len < 6) return 'strength-weak';
    if (len < 9) return 'strength-medium';
    return 'strength-strong';
  }

  get passwordsMatch(): boolean {
    return this.newPassword === this.confirmPassword && this.confirmPassword.length > 0;
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.newPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isSubmitting = true;

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.state = 'success';
        this.isSubmitting = false;
        this.startCountdown();
      },
      error: (err: { error?: { error?: string } }) => {
        const msg = err?.error?.error || '';
        if (msg.toLowerCase().includes('expired')) {
          this.state = 'expired';
        } else if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('used')) {
          this.state = 'invalid';
        } else {
          this.state = 'error';
          this.errorMessage = msg || 'Something went wrong. Please try again.';
        }
        this.isSubmitting = false;
      }
    });
  }

  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.countdownInterval!);
        this.router.navigateByUrl('/login');
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }
}
