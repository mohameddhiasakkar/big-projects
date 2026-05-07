import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

type VerifyState = 'loading' | 'success' | 'already_verified' | 'expired' | 'invalid' | 'error';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.css'
})
export class VerifyComponent implements OnInit {
  state: VerifyState = 'loading';
  message = '';
  countdown = 5;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
      const token = this.route.snapshot.queryParamMap.get('token') 
             ?? this.route.snapshot.paramMap.get('token');

    if (!token) {
      this.state = 'invalid';
      this.message = 'Aucun jeton de vérification trouvé dans l\'URL.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (res) => {
        this.state = 'success';
        this.message = res.message || 'Email vérifié avec succès !';
        this.startCountdown();
      },
      error: (err: { error?: { error?: string } }) => {
        const errorMsg = err?.error?.error || '';
        if (errorMsg.toLowerCase().includes('already verified')) {
          this.state = 'already_verified';
          this.message = 'Votre e-mail est déjà vérifié. Vous pouvez vous connecter.';
        } else if (errorMsg.toLowerCase().includes('expired')) {
          this.state = 'expired';
          this.message = 'Votre lien de vérification a expiré. Veuillez vous inscrire à nouveau.';
        } else if (errorMsg.toLowerCase().includes('invalid')) {
          this.state = 'invalid';
          this.message = 'Jeton de vérification invalide.';
        } else {
          this.state = 'error';
          this.message = errorMsg || 'Une erreur est survenue. Veuillez réessayer.';
        }
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
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}