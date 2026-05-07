import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Destination } from '../../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class PublicDestinationService {
  private readonly apiBaseUrl = 'http://localhost:8080';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Destination[]> {
    return this.http.get<Destination[]>(`${this.apiBaseUrl}/api/destinations`);
  }

  getById(id: number): Observable<Destination> {
    return this.http.get<Destination>(`${this.apiBaseUrl}/api/destinations/${id}`);
  }
}

