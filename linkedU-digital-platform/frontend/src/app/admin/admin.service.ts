import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { AdminDashboardStatistics, ProductKey, User, UserRole } from '../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = 'http://localhost:8080/api';
  private readonly adminBase = `${this.API_URL}/admin`;

  constructor(private http: HttpClient) {}

  getDashboardStatistics(): Observable<AdminDashboardStatistics> {
    return this.http.get<AdminDashboardStatistics>(`${this.adminBase}/statistics`);
  }


  // ── Users ─────────────────────────────────────────────
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.adminBase}/users`);
  }

  assignRole(userId: number, role: UserRole): Observable<any> {
    return this.http.put<any>(
      `${this.adminBase}/users/${userId}/role`,
      null,
      { params: { role } }
    );
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.post<void>(`${this.adminBase}/users/delete`, null, {
      params: { userId: userId.toString() }
    });
  }

  assignAgentToStudent(studentId: number, agentId: number): Observable<any> {
    return this.http.post<any>(
      `${this.API_URL}/students/assign-agent`,
      null,
      { params: { studentId: studentId.toString(), agentId: agentId.toString() } }
    );
  }
  // ── Product Keys ─────────────────────────────────────
  createProductKeys(quantity: number): Observable<ProductKey[]> {
    if (quantity <= 0) {
      return of([]);
    }

    const requests = Array.from({ length: quantity }, () => {
      const keyValue = this.generateKey();
      return this.http.post<ProductKey>(`${this.adminBase}/product-keys`, keyValue, {
        headers: { 'Content-Type': 'text/plain' }
      });
    });

    return forkJoin(requests);
  }

  private generateKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => Array.from({ length: 3 }, () =>
      chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${segment()}-${segment()}`;
  }

  getAvailableProductKeys(): Observable<ProductKey[]> {
    return this.http.get<ProductKey[]>(`${this.adminBase}/product-keys/available`);
  }
}
