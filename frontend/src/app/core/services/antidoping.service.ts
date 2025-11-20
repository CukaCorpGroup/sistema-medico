import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Antidoping {
  id?: number;
  patientId: number;
  date: string;
  identification: string;
  fullName: string;
  position: string;
  workArea: string;
  verification?: string;
  observations?: string;
  evaluation?: string;
  patient?: any;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AntidopingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/antidoping`;

  create(record: any): Observable<ApiResponse<Antidoping>> {
    return this.http.post<ApiResponse<Antidoping>>(this.apiUrl, record);
  }

  getAll(page = 1, limit = 10, patientId?: number, startDate?: string, endDate?: string): Observable<ApiResponse<Antidoping[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (patientId) {
      params = params.set('patientId', patientId.toString());
    }
    if (startDate && endDate) {
      params = params.set('startDate', startDate).set('endDate', endDate);
    }

    return this.http.get<ApiResponse<Antidoping[]>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<Antidoping>> {
    return this.http.get<ApiResponse<Antidoping>>(`${this.apiUrl}/${id}`);
  }

  update(id: number, record: Partial<Antidoping>): Observable<ApiResponse<Antidoping>> {
    return this.http.put<ApiResponse<Antidoping>>(`${this.apiUrl}/${id}`, record);
  }

  exportToExcel(startDate: string, endDate: string): Observable<ApiResponse<Antidoping[]>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<ApiResponse<Antidoping[]>>(`${this.apiUrl}/export/excel`, { params });
  }
}






