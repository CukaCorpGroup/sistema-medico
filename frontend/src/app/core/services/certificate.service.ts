import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Certificate {
  id?: number;
  medicalRecordId: number;
  patientId: number;
  doctorId: number;
  fullName: string;
  position: string;
  workArea: string;
  phone?: string;
  company: string;
  address?: string;
  cie10Code?: string;
  cie10Description?: string;
  startDate: string;
  endDate: string;
  validDays?: number;
  issuingInstitution: string;
  issuingDoctor: string;
  specialty?: string;
  service?: string;
  document?: string;
  doctor?: string;
  observations?: string;
  pdfGenerated?: boolean;
  medicalRecord?: any;
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
export class CertificateService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/certificates`;

  create(certificate: any): Observable<ApiResponse<Certificate>> {
    return this.http.post<ApiResponse<Certificate>>(this.apiUrl, certificate);
  }

  getAll(page = 1, limit = 10, patientId?: number, startDate?: string, endDate?: string): Observable<ApiResponse<Certificate[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (patientId) {
      params = params.set('patientId', patientId.toString());
    }
    if (startDate && endDate) {
      params = params.set('startDate', startDate).set('endDate', endDate);
    }

    return this.http.get<ApiResponse<Certificate[]>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<Certificate>> {
    return this.http.get<ApiResponse<Certificate>>(`${this.apiUrl}/${id}`);
  }

  update(id: number, certificate: Partial<Certificate>): Observable<ApiResponse<Certificate>> {
    return this.http.put<ApiResponse<Certificate>>(`${this.apiUrl}/${id}`, certificate);
  }

  generatePDF(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/${id}/pdf`);
  }
}






