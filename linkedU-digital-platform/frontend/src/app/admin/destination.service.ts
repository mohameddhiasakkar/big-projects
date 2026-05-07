import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Destination } from '../shared/models/models';

@Injectable({
  providedIn: 'root'
})
export class DestinationService {
  private readonly API_BASE_URL = 'http://localhost:8080/api'; // Centraliser la base de l'API
  private readonly DESTINATIONS_API = `${this.API_BASE_URL}/admin/destinations`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Destination[]> {
    return this.http.get<Destination[]>(this.DESTINATIONS_API);
  }

  getById(id: number): Observable<Destination> {
    return this.http.get<Destination>(`${this.DESTINATIONS_API}/${id}`);
  }

  create(destination: Destination): Observable<any> {
    return this.http.post(this.DESTINATIONS_API, destination);
  }

  update(id: number, destination: Destination): Observable<any> {
    return this.http.put(`${this.DESTINATIONS_API}/${id}`, destination);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.DESTINATIONS_API}/${id}`);
  }
}
