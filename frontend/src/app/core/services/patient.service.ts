import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Patient {
  id?: number;
  identification: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  position: string;
  workArea: string;
  gender: string;
  phone?: string;
  company: string;
  address?: string;
  email?: string;
  birthDate?: Date;
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
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
export class PatientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/patients`;

  searchByIdentification(identification: string): Observable<ApiResponse<Patient>> {
    const params = new HttpParams().set('identification', identification);
    return this.http.get<ApiResponse<Patient>>(`${this.apiUrl}/search`, { params });
  }

  getAll(page = 1, limit = 10, search = ''): Observable<ApiResponse<Patient[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<Patient[]>>(this.apiUrl, { params });
  }

  create(patient: Patient): Observable<ApiResponse<Patient>> {
    return this.http.post<ApiResponse<Patient>>(this.apiUrl, patient);
  }

  update(id: number, patient: Partial<Patient>): Observable<ApiResponse<Patient>> {
    return this.http.put<ApiResponse<Patient>>(`${this.apiUrl}/${id}`, patient);
  }
}





