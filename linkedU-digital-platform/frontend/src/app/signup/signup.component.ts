import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { GuestRegisterPayload, ContractRegisterPayload } from '../shared/models/models';

type RegistrationType = 'guest' | 'contract';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupComponent {
  registrationType: RegistrationType = 'guest';

  guestForm: GuestRegisterPayload = {
    username: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword:'',
  };

  contractForm: ContractRegisterPayload = {
    username: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    productKey: '',
    confirmPassword :'',
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  switchType(type: RegistrationType): void {
    this.registrationType = type;
    this.errorMessage = '';
    this.successMessage = '';
  }

  get currentPassword(): string {
    return this.registrationType === 'guest'
      ? this.guestForm.password
      : this.contractForm.password;
  }

  get passwordStrength(): string {
    const len = this.currentPassword.length;
    if (len === 0) return '';
    if (len < 6) return 'Faible';
    if (len < 9) return 'Moyen';
    return 'Fort';
  }

  get passwordStrengthClass(): string {
    const len = this.currentPassword.length;
    if (len < 6) return 'text-red-500';
    if (len < 9) return 'text-yellow-500';
    return 'text-green-500';
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    if (this.registrationType === 'guest') {
      const f = this.guestForm;
      if (!f.username || !f.firstName || !f.lastName || !f.email || !f.password || !f.phoneNumber || !f.birthDate) {
        this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
        this.isSubmitting = false;
        return;
      }
      if (f.password !== f.confirmPassword) {
        this.errorMessage = 'Les mots de passe ne correspondent pas.';
        this.isSubmitting = false;
        return;
      }

      this.authService.registerGuest(f).subscribe({
        next: (res) => {
          this.successMessage = res.message || 'Compte créé ! Veuillez vérifier votre e-mail pour valider votre compte.';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigateByUrl('/login'), 3000);
        },
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage = err?.error?.message || "Échec de l'inscription. Veuillez réessayer.";
          this.isSubmitting = false;
        }
      });
    } else {
      const f = this.contractForm;
      if (!f.username || !f.firstName || !f.lastName || !f.email || !f.password || !f.phoneNumber || !f.birthDate || !f.productKey) {
        this.errorMessage = 'Veuillez remplir tous les champs obligatoires, y compris la clé produit.';
        this.isSubmitting = false;
        return;
      }
      if (f.password !== f.confirmPassword) {
        this.errorMessage = 'Les mots de passe ne correspondent pas.';
        this.isSubmitting = false;
        return;
      }

      this.authService.registerContract(f).subscribe({
        next: (res) => {
          this.successMessage = res.message || 'Compte créé ! Veuillez vérifier votre e-mail pour valider votre compte.';
          this.isSubmitting = false;
          setTimeout(() => this.router.navigateByUrl('/login'), 3000);
        },
        error: (err: { error?: { message?: string } }) => {
          this.errorMessage = err?.error?.message || "Échec de l'inscription. Clé produit invalide ou compte déjà existant.";
          this.isSubmitting = false;
        }
      });
    }
  }
}