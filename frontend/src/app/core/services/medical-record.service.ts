import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MedicalRecord {
  id?: number;
  patientId: number;
  doctorId: number;
  date: string;
  time: string;
  consultType: string;
  cie10Code?: string;
  cie10Description?: string;
  causes?: string;
  diagnosis: string;
  prescription?: string;
  daysOfRest?: number;
  observations?: string;
  monthlyCount?: number;
  totalMonthlyCount?: number;
  annualCount?: number;
  certificateGenerated?: boolean;
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
export class MedicalRecordService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/medical-records`;

  create(record: MedicalRecord): Observable<ApiResponse<MedicalRecord>> {
    return this.http.post<ApiResponse<MedicalRecord>>(this.apiUrl, record);
  }

  getAll(page = 1, limit = 10, patientId?: number, startDate?: string, endDate?: string): Observable<ApiResponse<MedicalRecord[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (patientId) {
      params = params.set('patientId', patientId.toString());
    }
    if (startDate && endDate) {
      params = params.set('startDate', startDate).set('endDate', endDate);
    }

    return this.http.get<ApiResponse<MedicalRecord[]>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<MedicalRecord>> {
    return this.http.get<ApiResponse<MedicalRecord>>(`${this.apiUrl}/${id}`);
  }

  update(id: number, record: Partial<MedicalRecord>): Observable<ApiResponse<MedicalRecord>> {
    return this.http.put<ApiResponse<MedicalRecord>>(`${this.apiUrl}/${id}`, record);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  exportToExcel(startDate: string, endDate: string): Observable<ApiResponse<MedicalRecord[]>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<ApiResponse<MedicalRecord[]>>(`${this.apiUrl}/export/excel`, { params });
  }
}






