import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ContractRegisterPayload } from '../../shared/models/models';

@Component({
  selector: 'app-contract-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contract-signup.component.html',
  styleUrl: './contract-signup.component.css'
})
export class ContractSignupComponent {
  form: ContractRegisterPayload = {
    username: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    productKey: '',
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  get passwordStrength(): string {
    const len = this.form.password.length;
    if (len === 0) return '';
    if (len < 6) return 'Faible';
    if (len < 9) return 'Moyen';
    return 'Fort';
  }

  get passwordStrengthClass(): string {
    const len = this.form.password.length;
    if (len < 6) return 'text-red-500';
    if (len < 9) return 'text-yellow-500';
    return 'text-green-500';
  }
  
  get passwordsMatch(): boolean {
    return this.form.password.trim() === this.form.confirmPassword.trim();
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.form.password !== this.form.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
    return;
}
    if (!this.form.username || !this.form.firstName || !this.form.lastName ||
        !this.form.email || !this.form.password || !this.form.phoneNumber ||
        !this.form.birthDate || !this.form.productKey) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires, y compris la clé produit.';
      return;
    }

    this.isSubmitting = true;

    this.authService.registerContract(this.form).subscribe({
      next: (res) => {
        this.successMessage = res.message || 'Compte créé ! Veuillez vérifier vos e-mails pour valider votre compte.';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigateByUrl('/login'), 3000);
      },
      error: (err: { error?: { message?: string } }) => {
        this.errorMessage = err?.error?.message || 'Échec de l\'inscription. Clé produit invalide ou compte déjà existant.';
        this.isSubmitting = false;
      }
    });
  }
}