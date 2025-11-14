import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface SharedPatientData {
  id: number;
  identification: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  workArea: string;
  gender: string;
  phone?: string;
  company: string;
  address?: string;
  disability?: string;
  vulnerable?: string;
  vulnerableDescription?: string;
  vulnerableReversible?: boolean;
  // Datos de consulta médica
  cie10Code?: string;
  cie10Description?: string;
  secondaryCode?: string;
  secondaryDescription?: string;
  causes?: string;
  diagnosis?: string;
  prescription?: string;
  prescriptionMedicines?: string;
  prescriptionInstructions?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SharedPatientService {
  private patientDataSubject = new BehaviorSubject<SharedPatientData | null>(null);
  public patientData$: Observable<SharedPatientData | null> = this.patientDataSubject.asObservable();

  constructor() {
    // Cargar datos del localStorage al iniciar
    this.loadFromStorage();
  }

  setPatientData(patient: SharedPatientData): void {
    console.log('SharedPatientService: Guardando datos del paciente', patient);
    this.patientDataSubject.next(patient);
    // Guardar en localStorage para persistencia
    localStorage.setItem('sharedPatientData', JSON.stringify(patient));
    console.log('SharedPatientService: Datos guardados en localStorage');
  }

  getPatientData(): SharedPatientData | null {
    // Primero intentar obtener del BehaviorSubject
    let data = this.patientDataSubject.value;
    
    // Si no hay datos en el BehaviorSubject, intentar cargar del localStorage
    if (!data) {
      const stored = localStorage.getItem('sharedPatientData');
      if (stored) {
        try {
          data = JSON.parse(stored);
          this.patientDataSubject.next(data);
          console.log('SharedPatientService: Datos cargados desde localStorage', data);
        } catch (error) {
          console.error('Error loading patient data from storage:', error);
          localStorage.removeItem('sharedPatientData');
        }
      }
    } else {
      console.log('SharedPatientService: Datos obtenidos del BehaviorSubject', data);
    }
    
    return data;
  }

  clearPatientData(): void {
    this.patientDataSubject.next(null);
    localStorage.removeItem('sharedPatientData');
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('sharedPatientData');
    if (stored) {
      try {
        const patientData = JSON.parse(stored);
        this.patientDataSubject.next(patientData);
      } catch (error) {
        console.error('Error loading patient data from storage:', error);
        localStorage.removeItem('sharedPatientData');
      }
    }
  }
}

