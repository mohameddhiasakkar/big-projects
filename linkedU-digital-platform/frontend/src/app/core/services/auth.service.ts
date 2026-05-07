import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import {
  LoginPayload,
  GuestRegisterPayload,
  ContractRegisterPayload,
  AuthResponse,
  RegisterResponse
} from '../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiBaseUrl = 'http://localhost:8080';
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private readonly http: HttpClient) {}

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiBaseUrl}/api/auth/login`, payload
    );
  }

  registerGuest(payload: GuestRegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiBaseUrl}/api/auth/register/guest`, payload
    );
  }

  registerContract(payload: ContractRegisterPayload): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiBaseUrl}/api/auth/register/contract`, payload
    );
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(
      `${this.apiBaseUrl}/api/auth/verify`, { params: { token } }
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
    }
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('token') : null;
  }

  getUserRole(): string | null {
    return this.isBrowser ? localStorage.getItem('userRole') : null;
  }

  getUserId(): string | null {
    return this.isBrowser ? localStorage.getItem('userId') : null;
  }

  isLoggedIn(): boolean {
    return this.isBrowser ? !!localStorage.getItem('token') : false;
  }

  setSession(token: string, role: string, userId: number): void {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userId', String(userId));
    }
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiBaseUrl}/api/auth/forgot-password`,
      { email }
    );
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiBaseUrl}/api/auth/reset-password`,
      { token, newPassword }
    );
  }

}
