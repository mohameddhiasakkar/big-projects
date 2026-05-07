import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Destination } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class DestinationService {
  private readonly api = 'http://localhost:8080/api/destinations';
  private readonly adminApi = 'http://localhost:8080/api/admin/destinations';

  constructor(private readonly http: HttpClient) {}

  // ── Public ──
  getAll(): Observable<Destination[]> {
    return this.http.get<Destination[]>(this.api);
  }

  getById(id: number): Observable<Destination> {
    return this.http.get<Destination>(`${this.api}/${id}`);
  }

  getBySlug(slug: string): Observable<Destination> {
    return this.http.get<Destination>(`${this.api}/slug/${slug}`);
  }

  // ── Admin ──
  adminGetAll(): Observable<Destination[]> {
    return this.http.get<Destination[]>(this.adminApi);
  }

  create(formData: FormData): Observable<{ id: number; message: string }> {
    return this.http.post<{ id: number; message: string }>(this.adminApi, formData);
  }

  update(id: number, formData: FormData): Observable<{ id: number; message: string }> {
    return this.http.put<{ id: number; message: string }>(`${this.adminApi}/${id}`, formData);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.adminApi}/${id}`);
  }
}