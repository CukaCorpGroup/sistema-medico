import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Incident {
  id?: number;
  patientId: number;
  doctorId: number;
  date: string;
  identification: string;
  fullName: string;
  position: string;
  workArea: string;
  company: string;
  address?: string;
  phone?: string;
  cie10Code?: string;
  cie10Description?: string;
  causes?: string;
  secondaryCode?: string;
  secondaryDescription?: string;
  diagnosis: string;
  prescription?: string;
  daysOfRest?: number;
  observations?: string;
  pdfGenerated?: boolean;
  patient?: any;
  doctor?: any;
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
export class IncidentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/incidents`;

  create(incident: any): Observable<ApiResponse<Incident>> {
    return this.http.post<ApiResponse<Incident>>(this.apiUrl, incident);
  }

  getAll(page = 1, limit = 10, patientId?: number, startDate?: string, endDate?: string): Observable<ApiResponse<Incident[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (patientId) {
      params = params.set('patientId', patientId.toString());
    }
    if (startDate && endDate) {
      params = params.set('startDate', startDate).set('endDate', endDate);
    }

    return this.http.get<ApiResponse<Incident[]>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<Incident>> {
    return this.http.get<ApiResponse<Incident>>(`${this.apiUrl}/${id}`);
  }

  update(id: number, incident: Partial<Incident>): Observable<ApiResponse<Incident>> {
    return this.http.put<ApiResponse<Incident>>(`${this.apiUrl}/${id}`, incident);
  }

  generatePDF(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}/pdf`);
  }

  exportToExcel(startDate: string, endDate: string): Observable<ApiResponse<Incident[]>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<ApiResponse<Incident[]>>(`${this.apiUrl}/export/excel`, { params });
  }
}






