import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CIE10 {
  id?: number;
  code: string;
  description: string;
  category?: string;
  isActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class CIE10Service {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cie10`;

  search(query: string, limit = 20): Observable<ApiResponse<CIE10[]>> {
    const params = new HttpParams()
      .set('query', query)
      .set('limit', limit.toString());
    
    return this.http.get<ApiResponse<CIE10[]>>(`${this.apiUrl}/search`, { params });
  }

  getByCode(code: string): Observable<ApiResponse<CIE10>> {
    return this.http.get<ApiResponse<CIE10>>(`${this.apiUrl}/code/${code}`);
  }

  getAll(page = 1, limit = 50): Observable<ApiResponse<CIE10[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    return this.http.get<ApiResponse<CIE10[]>>(this.apiUrl, { params });
  }
}






