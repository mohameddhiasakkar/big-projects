import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface AdmissionPredictionRequest {
  country: string;
  major: string;
  language: string;
  moyenne: number;
  tuition_tier: number;
  k?: number;
}

interface AdmissionPredictionResponse {
  recommendations: any[];
}

@Injectable({
  providedIn: 'root'
})
export class MlModelService {
  private readonly apiBase = 'http://localhost:8000'; // FastAPI backend Port

  constructor(private http: HttpClient) {}

  predictAdmission(data: AdmissionPredictionRequest): Observable<AdmissionPredictionResponse> {
    return this.http.post<AdmissionPredictionResponse>(`${this.apiBase}/recommend`, data);
  }

  getMetadata(): Observable<any> {
    return this.http.get<any>(`${this.apiBase}/metadata`);
  }
}