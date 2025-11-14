import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SharedPatientService } from '../../core/services/shared-patient.service';
import jsPDF from 'jspdf';

interface Patient {
  id: number;
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
}

interface CIE10 {
  code: string;
  description: string;
  category?: string;
}

interface User {
  id: number;
  fullName: string;
  username: string;
}

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="incident-page">
      <div class="form-container">
        <h2 class="form-title">REGISTRO INCIDENTES/ACCIDENTES</h2>
        
        <!-- Header Information -->
        <div class="form-section">
          <div class="form-row">
            <div class="form-group">
              <label>Fecha</label>
              <input type="text" [value]="formatDate(formData.date)" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Médico</label>
              <select [(ngModel)]="formData.doctorId" class="form-control">
                <option [value]="currentDoctor?.id">{{ currentDoctor?.fullName || 'Seleccione médico...' }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Datos del paciente -->
        <div class="form-section">
          <h3 class="section-title">Datos del paciente</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Cédula</label>
              <div class="input-with-icon">
                <input 
                  type="text" 
                  [ngModel]="searchIdentification" 
                  (ngModelChange)="searchIdentification = $event.toUpperCase()" 
                  class="form-control" 
                  placeholder="0803232321"
                  (keyup.enter)="searchPatient()"
                  style="text-transform: uppercase;"
                />
                <button type="button" class="btn-icon" (click)="searchPatient()">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Nombres y Apellidos</label>
              <input type="text" [(ngModel)]="patientData.fullName" class="form-control" readonly />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Puesto de</label>
              <input type="text" [(ngModel)]="patientData.position" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Empresa</label>
              <input type="text" [(ngModel)]="patientData.company" class="form-control" readonly />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Teléfono</label>
              <input type="text" [(ngModel)]="patientData.phone" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Área de trabajo</label>
              <input type="text" [(ngModel)]="patientData.workArea" class="form-control" readonly />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group form-group-full">
              <label>Dirección</label>
              <input type="text" [(ngModel)]="patientData.address" class="form-control" readonly />
            </div>
          </div>
        </div>

        <!-- CIE-10 y Diagnóstico -->
        <div class="form-section">
          <h3 class="section-title">CIE-10 y Diagnóstico</h3>
          <div class="form-row">
            <div class="form-group">
              <label>COD SEC</label>
              <input 
                type="text" 
                [ngModel]="formData.secondaryCode" 
                (ngModelChange)="formData.secondaryCode = $event.toUpperCase()" 
                class="form-control" 
                placeholder="Código secundario" 
                style="text-transform: uppercase;"
              />
            </div>
            <div class="form-group">
              <label>CIE-10</label>
              <div class="input-with-icon">
                <input 
                  type="text" 
                  [(ngModel)]="formData.cie10Code" 
                  class="form-control" 
                  placeholder="J069"
                  readonly
                />
                <button type="button" class="btn-icon" (click)="openCIE10Modal()">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>DESCRIPCION</label>
              <input 
                type="text" 
                [ngModel]="formData.secondaryDescription" 
                (ngModelChange)="formData.secondaryDescription = $event.toUpperCase()" 
                class="form-control" 
                placeholder="Descripción código secundario" 
                style="text-transform: uppercase;"
              />
            </div>
            <div class="form-group">
              <label>DESCRIPCION</label>
              <input type="text" [(ngModel)]="formData.cie10Description" class="form-control" readonly />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group form-group-full">
              <label>Causas</label>
              <input 
                type="text" 
                [ngModel]="formData.causes" 
                (ngModelChange)="formData.causes = $event.toUpperCase()" 
                class="form-control" 
                style="text-transform: uppercase;"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group form-group-full">
              <label>Evolución</label>
              <textarea 
                [ngModel]="formData.diagnosis" 
                (ngModelChange)="formData.diagnosis = $event.toUpperCase()" 
                class="form-control textarea-large" 
                rows="4"
                placeholder="Evolución del incidente..."
                style="text-transform: uppercase;"
              ></textarea>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group form-group-full">
              <label>Prescripción</label>
              <textarea 
                [ngModel]="formData.prescription" 
                (ngModelChange)="formData.prescription = $event.toUpperCase()" 
                class="form-control textarea-large" 
                rows="4"
                placeholder="Prescripción médica..."
                style="text-transform: uppercase;"
              ></textarea>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Condición</label>
              <input 
                type="text" 
                [ngModel]="formData.condition" 
                (ngModelChange)="formData.condition = $event.toUpperCase()" 
                class="form-control" 
                placeholder="ESTABLE" 
                style="text-transform: uppercase;"
              />
            </div>
            <div class="form-group">
              <label>Días de reposo</label>
              <input type="number" [(ngModel)]="formData.daysOfRest" class="form-control" min="0" max="99" />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button type="button" class="btn btn-primary" (click)="generatePDF()">
            <i class="fas fa-file-pdf"></i> Guardar PDF
          </button>
          <button type="button" class="btn btn-success" (click)="saveIncident()" [disabled]="saving">
            <i class="fas fa-spinner fa-spin" *ngIf="saving"></i>
            {{ saving ? 'GUARDANDO...' : 'Guardar Referencia' }}
          </button>
          <button type="button" class="btn btn-secondary" (click)="downloadIncidentsExcel()">
            <i class="fas fa-download"></i> Descargar historial
          </button>
        </div>

        <!-- Alert Messages -->
        <div class="alert alert-success" *ngIf="successMessage">
          {{ successMessage }}
        </div>
        <div class="alert alert-danger" *ngIf="errorMessage">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Modal CIE-10 -->
      <div class="modal-overlay" *ngIf="showCIE10Modal" (click)="closeCIE10Modal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Buscar Código CIE-10</h3>
            <button type="button" class="btn-close" (click)="closeCIE10Modal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="search-box">
              <input 
                type="text" 
                [(ngModel)]="cie10SearchQuery" 
                (input)="filterCIE10()"
                placeholder="Buscar por código o descripción..."
                class="form-control"
              />
            </div>
            <div class="cie10-list">
              <table class="cie10-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    *ngFor="let code of filteredCIE10List" 
                    (click)="selectCIE10(code)"
                    class="cie10-row"
                  >
                    <td><strong>{{ code.code }}</strong></td>
                    <td>{{ code.description }}</td>
                  </tr>
                  <tr *ngIf="filteredCIE10List.length === 0">
                    <td colspan="2" class="no-results">No se encontraron códigos</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .incident-page {
      min-height: 100vh;
      background: #f5f7fa;
      padding: 20px;
    }

    .form-container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 1400px;
      margin: 0 auto;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-title {
      color: #1e293b;
      font-size: 1.8rem;
      margin-bottom: 30px;
      font-weight: 600;
      text-align: center;
    }

    .form-section {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    .form-section:last-of-type {
      border-bottom: none;
    }

    .section-title {
      color: #1e293b;
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group-full {
      grid-column: 1 / -1;
    }

    .form-group label {
      color: #334155;
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 0.9rem;
      display: block;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-weight: 500;
      color: #334155;
      margin-bottom: 0;
    }

    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #667eea;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control:read-only {
      background-color: #f1f5f9;
      cursor: not-allowed;
    }

    .textarea-large {
      min-height: 100px;
      resize: vertical;
      font-family: inherit;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .form-group-full textarea[readonly] {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      color: #495057;
      font-size: 0.9rem;
    }

    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-with-icon .form-control {
      flex: 1;
      padding-right: 45px;
    }

    .btn-icon {
      position: absolute;
      right: 8px;
      background: #667eea;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-icon:hover {
      background: #5568d3;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
    }

    .btn {
      padding: 12px 30px;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 1rem;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-success {
      background: #10b981;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background: #059669;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .alert {
      padding: 12px 20px;
      border-radius: 6px;
      margin-top: 20px;
      font-size: 0.95rem;
    }

    .alert-success {
      background: #d1fae5;
      color: #065f46;
      border: 1px solid #10b981;
    }

    .alert-danger {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #ef4444;
    }

    /* Modal CIE-10 */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 100%;
      max-width: 900px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      color: #1e293b;
      font-size: 1.3rem;
    }

    .btn-close {
      background: transparent;
      border: none;
      font-size: 1.5rem;
      color: #64748b;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 4px;
    }

    .btn-close:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    .modal-body {
      padding: 20px;
      overflow-y: auto;
      flex: 1;
    }

    .search-box {
      margin-bottom: 20px;
    }

    .cie10-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .cie10-table {
      width: 100%;
      border-collapse: collapse;
    }

    .cie10-table thead {
      background: #f1f5f9;
      position: sticky;
      top: 0;
    }

    .cie10-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #334155;
      border-bottom: 2px solid #e2e8f0;
    }

    .cie10-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .cie10-row:hover {
      background-color: #f8fafc;
    }

    .cie10-row td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #475569;
    }

    .no-results {
      padding: 40px;
      text-align: center;
      color: #64748b;
    }

    .btn i {
      margin-right: 8px;
    }
  `]
})
export class IncidentsComponent implements OnInit {
  searchIdentification = '';
  patientData: Partial<Patient> = {};
  currentDoctor: User | null = null;
  
  formData = {
    date: '',
    doctorId: 0,
    patientId: 0,
    identification: '',
    fullName: '',
    position: '',
    workArea: '',
    cie10Code: '',
    cie10Description: '',
    causes: '',
    secondaryCode: '',
    secondaryDescription: '',
    diagnosis: '',
    prescription: '',
    condition: 'ESTABLE',
    daysOfRest: 0,
  };

  saving = false;
  successMessage = '';
  errorMessage = '';

  // Modal CIE-10
  showCIE10Modal = false;
  cie10SearchQuery = '';
  cie10List: CIE10[] = [];
  filteredCIE10List: CIE10[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private sharedPatientService: SharedPatientService
  ) {}

  ngOnInit() {
    // Inicializar fecha actual
    const now = new Date();
    this.formData.date = now.toISOString().split('T')[0];
    
    // Obtener médico actual del usuario logueado
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.currentDoctor = {
        id: user.id || 1,
        fullName: user.fullName || user.username || '',
        username: user.username || ''
      };
      this.formData.doctorId = this.currentDoctor.id;
    }

    // Suscribirse a cambios en el paciente compartido (para recibir actualizaciones en tiempo real)
    this.sharedPatientService.patientData$.subscribe(sharedPatient => {
      if (sharedPatient) {
        console.log('IncidentsComponent: Recibió actualización del servicio compartido', sharedPatient);
        this.loadSharedPatientData(sharedPatient);
      }
    });

    // Cargar inmediatamente si ya existe información compartida
    // Usar setTimeout para asegurar que el servicio esté completamente inicializado
    setTimeout(() => {
      const sharedPatient = this.sharedPatientService.getPatientData();
      console.log('IncidentsComponent: Datos compartidos al iniciar', sharedPatient);
      if (sharedPatient) {
        // Cargar datos del paciente y consulta
        this.loadSharedPatientData(sharedPatient);
      }
    }, 200);
  }

  loadSharedPatientData(sharedPatient: any) {
    if (!sharedPatient) {
      console.log('IncidentsComponent: No hay datos del paciente compartido');
      return;
    }
    
    console.log('IncidentsComponent: Cargando datos del paciente compartido', sharedPatient);
    
    // Cargar datos del paciente
    this.searchIdentification = sharedPatient.identification || '';
    this.patientData = {
      id: sharedPatient.id,
      identification: sharedPatient.identification || '',
      fullName: sharedPatient.fullName || '',
      position: sharedPatient.position || '',
      workArea: sharedPatient.workArea || '',
      company: sharedPatient.company || 'Marbelize',
      phone: sharedPatient.phone || '',
      address: sharedPatient.address || ''
    };
    
    // Llenar formData con la información del paciente
    this.formData.patientId = sharedPatient.id || 0;
    this.formData.identification = sharedPatient.identification || '';
    this.formData.fullName = sharedPatient.fullName || '';
    this.formData.position = sharedPatient.position || '';
    this.formData.workArea = sharedPatient.workArea || '';
    
    // Cargar datos de la consulta médica si existen (estos vienen de "Nueva Atención Médica")
    if (sharedPatient.cie10Code) {
      this.formData.cie10Code = sharedPatient.cie10Code;
      this.formData.cie10Description = sharedPatient.cie10Description || '';
      
      // Generar código secundario si existe CIE-10 y no hay uno guardado
      if (sharedPatient.cie10Code && !sharedPatient.secondaryCode) {
        this.formData.secondaryCode = this.generateSecondaryCode(sharedPatient.cie10Code);
        // Generar descripción secundaria
        if (sharedPatient.cie10Description) {
          this.formData.secondaryDescription = `Incidente relacionado a ${sharedPatient.cie10Description}`;
        }
      } else if (sharedPatient.secondaryCode) {
        this.formData.secondaryCode = sharedPatient.secondaryCode;
      }
      
      if (sharedPatient.secondaryDescription) {
        this.formData.secondaryDescription = sharedPatient.secondaryDescription;
      } else if (sharedPatient.cie10Description && !this.formData.secondaryDescription) {
        this.formData.secondaryDescription = `Incidente relacionado a ${sharedPatient.cie10Description}`;
      }
    }
    
    // Cargar Causas, Evolución y Prescripción de la atención médica
    if (sharedPatient.causes) {
      this.formData.causes = sharedPatient.causes;
    }
    
    if (sharedPatient.diagnosis) {
      this.formData.diagnosis = sharedPatient.diagnosis;
    }
    
    if (sharedPatient.prescription) {
      this.formData.prescription = sharedPatient.prescription;
    }
    
    console.log('IncidentsComponent: Datos del paciente y consulta cargados correctamente', {
      paciente: this.patientData,
      consulta: {
        cie10: this.formData.cie10Code,
        causas: this.formData.causes,
        evolucion: this.formData.diagnosis,
        prescripcion: this.formData.prescription
      }
    });

  }

  formatDate(dateISO: string): string {
    if (!dateISO) return '';
    const date = new Date(dateISO);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  convertToUpperCase(event: any) {
    if (event && event.target) {
      event.target.value = event.target.value.toUpperCase();
      // Actualizar el modelo también
      const field = event.target.getAttribute('ng-reflect-name') || event.target.name;
      if (field && this.formData[field as keyof typeof this.formData] !== undefined) {
        (this.formData as any)[field] = event.target.value.toUpperCase();
      }
    }
  }

  onInputUppercase(field: string, value: string) {
    const upperValue = value.toUpperCase();
    (this.formData as any)[field] = upperValue;
    return upperValue;
  }

  searchPatient() {
    if (!this.searchIdentification) {
      this.errorMessage = 'Por favor ingrese una cédula';
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/patients/search`, {
      params: { identification: this.searchIdentification }
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const patient = response.data;
          this.patientData = {
            id: patient.id,
            identification: patient.identification,
            fullName: `${patient.firstName} ${patient.lastName}`.trim(),
            position: patient.position || '',
            workArea: patient.workArea || '',
            company: patient.company || 'Marbelize',
            phone: patient.phone || '',
            address: patient.address || ''
          };

          // Auto-poblar formulario
          this.formData.patientId = patient.id;
          this.formData.identification = patient.identification;
          this.formData.fullName = this.patientData.fullName || '';
          this.formData.position = patient.position || '';
          this.formData.workArea = patient.workArea || '';

          // Guardar información del paciente en el servicio compartido
          this.sharedPatientService.setPatientData({
            id: patient.id,
            identification: patient.identification,
            firstName: patient.firstName,
            lastName: patient.lastName,
            fullName: `${patient.firstName} ${patient.lastName}`.trim(),
            position: patient.position || '',
            workArea: patient.workArea || '',
            gender: patient.gender || '',
            phone: patient.phone || '',
            company: patient.company || 'Marbelize',
            address: patient.address || '',
            disability: patient.disability || '',
            vulnerable: patient.vulnerable || ''
          });

          this.errorMessage = '';
        } else {
          this.errorMessage = 'Paciente no encontrado';
          this.patientData = {
            id: 0,
            identification: '',
            fullName: '',
            position: '',
            workArea: '',
            company: '',
            phone: '',
            address: ''
          };
        }
      },
      error: (error) => {
        console.error('Error buscando paciente:', error);
        this.errorMessage = 'Error al buscar paciente: ' + (error.error?.message || 'Error desconocido');
        this.patientData = {};
      }
    });
  }

  openCIE10Modal() {
    this.showCIE10Modal = true;
    this.cie10SearchQuery = '';
    
    if (this.cie10List.length === 0) {
      this.http.get<any>(`${environment.apiUrl}/cie10`, {
        params: { page: '1', limit: '1000' }
      }).subscribe({
        next: (response) => {
          if (response.success) {
            this.cie10List = response.data || [];
            this.filteredCIE10List = this.cie10List;
          }
        },
        error: (error) => {
          console.error('Error cargando CIE-10:', error);
          this.cie10List = [];
          this.filteredCIE10List = [];
        }
      });
    } else {
      this.filteredCIE10List = this.cie10List;
    }
  }

  closeCIE10Modal() {
    this.showCIE10Modal = false;
    this.cie10SearchQuery = '';
  }

  filterCIE10() {
    if (!this.cie10SearchQuery.trim()) {
      this.filteredCIE10List = this.cie10List;
      return;
    }

    const query = this.cie10SearchQuery.toLowerCase();
    this.filteredCIE10List = this.cie10List.filter(cie10 =>
      cie10.code.toLowerCase().includes(query) ||
      cie10.description.toLowerCase().includes(query)
    );
  }

  selectCIE10(code: CIE10) {
    this.formData.cie10Code = code.code;
    this.formData.cie10Description = code.description;
    // Generar código secundario automáticamente
    this.formData.secondaryCode = this.generateSecondaryCode(code.code);
    this.formData.secondaryDescription = this.generateSecondaryDescription(code);
    
    // Actualizar datos compartidos con el CIE-10 seleccionado
    const currentShared = this.sharedPatientService.getPatientData();
    if (currentShared) {
      const updatedShared = {
        ...currentShared,
        cie10Code: code.code,
        cie10Description: code.description,
        secondaryCode: this.formData.secondaryCode,
        secondaryDescription: this.formData.secondaryDescription
      };
      this.sharedPatientService.setPatientData(updatedShared);
    }
    
    this.closeCIE10Modal();
  }

  generateSecondaryCode(cie10Code: string): string {
    if (!cie10Code) return '';
    
    // Generar código secundario con formato: INC-[CIE10]-[Año][Mes]
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    // Tomar los primeros 3 caracteres del código CIE-10 y agregar formato
    const cie10Prefix = cie10Code.replace(/[^A-Z0-9]/g, '').substring(0, 3).toUpperCase();
    
    // Formato: INC-[PREFIX]-[AA][MM]
    return `INC-${cie10Prefix}-${year}${month}`;
  }

  generateSecondaryDescription(cie10: CIE10): string {
    if (!cie10) return '';
    
    // Generar descripción secundaria basada en el CIE-10
    // Puedes personalizar esta lógica según tus necesidades
    return `Incidente relacionado a ${cie10.description}`;
  }

  generatePDF() {
    if (!this.patientData.id) {
      this.errorMessage = 'Por favor busque un paciente primero';
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let yPosition = margin;

    // Color azul oscuro para el header
    const headerBlue = [23, 37, 84]; // RGB aproximado para azul oscuro
    const lightBlue = [230, 244, 255]; // RGB para fondos azul claro
    const lightGreen = [220, 252, 231]; // RGB para fondos verde claro

    // ========== HEADER BAR (Barra azul oscura) ==========
    doc.setFillColor(headerBlue[0], headerBlue[1], headerBlue[2]);
    doc.rect(0, 0, pageWidth, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REFERENCIA/ACCIDENTE', pageWidth / 2, 11, { align: 'center' });
    yPosition = 18;

    // ========== INFORMACIÓN DE CONTACTO ==========
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('KM 5 1/2 VIA MANTA ROCAFUERTE', margin, yPosition);
    yPosition += 4;
    doc.text('TELEFONO: 052389000 EXT. 156', margin, yPosition);
    
    // Email y departamento (derecha)
    doc.setTextColor(0, 0, 255);
    doc.text('jmedico@marbelize.com', pageWidth - margin - 5, yPosition - 4, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('DEPARTAMENTO MEDICO', pageWidth / 2, yPosition, { align: 'center' });
    
    // Formato y versión (extremo derecho)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('FOR-DM-22/VER:1/FECHA:07-12-2022', pageWidth - margin, yPosition - 4, { align: 'right' });
    yPosition += 10;

    // ========== FECHA Y REFERENCIA ==========
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('FECHA:', margin, yPosition);
    doc.setFillColor(220, 220, 220); // Gris claro para el campo
    doc.rect(margin + 18, yPosition - 4, 35, 6, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('JARAMIJO,', margin + 60, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(this.formatDatePDF(this.formData.date), margin + 95, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('REFERENCIA', margin, yPosition);
    doc.setFillColor(220, 220, 220);
    doc.rect(margin + 27, yPosition - 4, 35, 6, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE A SEGURIDAD INDUSTRIAL', margin + 70, yPosition);
    // Checkbox con X
    doc.setDrawColor(0, 0, 0);
    doc.rect(margin + 155, yPosition - 4, 5, 5);
    doc.setFont('helvetica', 'bold');
    doc.text('X', margin + 157, yPosition - 0.5);
    yPosition += 12;

    // ========== TÍTULO "VALORACION A TRABAJADOR" ==========
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('VALORACION A TRABAJADOR', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    // ========== DATOS DEL TRABAJADOR ==========
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Por medio del presente certifico haber atendido al Sr (a):', margin, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'bold');
    doc.text((this.patientData.fullName || '').toUpperCase(), margin + 20, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.text('# Cedula:', margin, yPosition);
    doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    doc.rect(margin + 25, yPosition - 4, 35, 5, 'F');
    doc.text(this.patientData.identification || '', margin + 27, yPosition);
    yPosition += 6;

    doc.text('perteneciente al area de trabajo:', margin, yPosition);
    yPosition += 6;

    doc.text('Actividad laboral:', margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text((this.patientData.position || '').toUpperCase(), margin + 35, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.text('Historia Clinica:', margin, yPosition);
    doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    doc.rect(margin + 35, yPosition - 4, 35, 5, 'F');
    doc.text(this.patientData.identification || '', margin + 37, yPosition);
    yPosition += 6;

    doc.text('De la empresa:', margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.text((this.patientData.company || 'Marbelize').toUpperCase(), margin + 30, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.text('Telefono:', margin, yPosition);
    doc.text(this.patientData.phone || '', margin + 20, yPosition);
    yPosition += 6;

    doc.text('Direccion:', margin, yPosition);
    doc.text((this.patientData.address || '').toUpperCase(), margin + 25, yPosition);
    yPosition += 6;

    doc.text('por presentar cuadro caracterizado por:', margin, yPosition);
    yPosition += 8;

    // ========== CIE-10 Y DIAGNÓSTICO ==========
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('COD CIE-10', margin, yPosition);
    doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    const cie10BoxHeight = 7;
    doc.rect(margin, yPosition + 2, 30, cie10BoxHeight, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text((this.formData.cie10Code || this.formData.secondaryCode || '').toUpperCase(), margin + 2, yPosition + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('DIAGNOSTICO', margin + 70, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const diagnosisText = (this.formData.cie10Description || this.formData.secondaryDescription || this.formData.diagnosis || '').toUpperCase();
    doc.text(diagnosisText, margin + 70, yPosition + 7);
    yPosition += 15;

    // ========== CUADRO CLÍNICO ==========
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CUADRO CLINICO', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 7;

    doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    const cuadroHeight = 45;
    doc.rect(margin, yPosition, pageWidth - (margin * 2), cuadroHeight, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    if (this.formData.diagnosis) {
      const cuadroLines = doc.splitTextToSize((this.formData.diagnosis || '').toUpperCase(), pageWidth - (margin * 2) - 4);
      doc.text(cuadroLines, margin + 3, yPosition + 6);
    }
    yPosition += cuadroHeight + 10;

    // ========== PRESCRIPCIÓN ==========
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIPCION', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const leftColStart = margin + 5;
    const rightColStart = pageWidth / 2 + 5;
    const colWidth = (pageWidth / 2) - 15;
    let leftY = yPosition;
    let rightY = yPosition;

    if (this.formData.prescription) {
      // Dividir la prescripción por líneas
      const fullPrescription = (this.formData.prescription || '').toUpperCase();
      const lines = fullPrescription.split('\n').filter(line => line.trim());
      
      // Distribuir líneas entre las dos columnas alternadamente
      lines.forEach((line: string, index: number) => {
        const wrappedLines = doc.splitTextToSize(line, colWidth);
        
        if (index % 2 === 0) {
          // Columna izquierda
          wrappedLines.forEach((wrappedLine: string) => {
            doc.text(wrappedLine, leftColStart, leftY);
            leftY += 5;
          });
        } else {
          // Columna derecha (alinear con la primera línea de la izquierda si es la primera vez)
          if (rightY === yPosition && leftY > yPosition) {
            rightY = yPosition;
          }
          wrappedLines.forEach((wrappedLine: string) => {
            doc.text(wrappedLine, rightColStart, rightY);
            rightY += 5;
          });
        }
      });
      
      yPosition = Math.max(leftY, rightY) + 5;
    } else {
      yPosition += 20;
    }

    // ========== CONDICIÓN Y DÍAS DE REPOSO ==========
    const tableY = yPosition;
    const tableWidth = 80;
    const tableHeight = 12;
    
    // Tabla de condición
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('CONDICION', margin + 5, tableY + 4);
    doc.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
    doc.rect(margin + 35, tableY, tableWidth, tableHeight / 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.text((this.formData.condition || 'ESTABLE').toUpperCase(), margin + 37, tableY + 4);

    // Tabla de días de reposo
    doc.setTextColor(255, 0, 0); // Rojo
    doc.setFont('helvetica', 'bold');
    doc.text('DIAS DE REPOSO DM', margin + 5, tableY + tableHeight / 2 + 4);
    doc.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
    doc.rect(margin + 35, tableY + tableHeight / 2, tableWidth, tableHeight / 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text(String(this.formData.daysOfRest || 0), margin + 37, tableY + tableHeight / 2 + 4);
    doc.setTextColor(0, 0, 0);
    yPosition += tableHeight + 10;

    // ========== FIRMAS ==========
    const footerY = pageHeight - 30;
    
    // Firma médico (izquierda)
    doc.setFontSize(10);
    doc.setTextColor(255, 0, 0); // Rojo
    doc.setFont('helvetica', 'bold');
    doc.text((this.currentDoctor?.fullName || 'DR. MEDICO').toUpperCase(), margin, footerY);
    doc.line(margin, footerY + 2, margin + 50, footerY + 2);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('FIRMA Y SELLO DEL MEDICO', margin, footerY + 8);
    doc.line(margin, footerY + 10, margin + 50, footerY + 10);

    // Firmas trabajador (derecha)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('FIRMA DEL TRABAJADOR', pageWidth - margin - 40, footerY);
    doc.line(pageWidth - margin - 40, footerY + 2, pageWidth - margin, footerY + 2);
    
    doc.text('FIRMA EN FORMATO', pageWidth - margin - 40, footerY + 8);
    doc.line(pageWidth - margin - 40, footerY + 10, pageWidth - margin, footerY + 10);

    // Guardar PDF
    const filename = `REFERENCIA_${this.patientData.identification}_${this.formData.date.replace(/-/g, '')}.pdf`;
    doc.save(filename);
    this.successMessage = 'PDF generado exitosamente';
  }

  formatDatePDF(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  }

  saveIncident() {
    if (!this.patientData.id) {
      this.errorMessage = 'Por favor busque un paciente primero';
      return;
    }

    if (!this.formData.diagnosis) {
      this.errorMessage = 'Por favor complete la evolución';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const incidentData = {
      patientId: this.patientData.id,
      date: this.formData.date,
      identification: this.patientData.identification || '',
      fullName: this.patientData.fullName || '',
      position: this.patientData.position || '',
      workArea: this.patientData.workArea || '',
      company: this.patientData.company || '',
      phone: this.patientData.phone || '',
      address: this.patientData.address || '',
      cie10Code: this.formData.cie10Code || undefined,
      cie10Description: this.formData.cie10Description || undefined,
      causes: this.formData.causes || undefined,
      secondaryCode: this.formData.secondaryCode || undefined,
      secondaryDescription: this.formData.secondaryDescription || undefined,
      diagnosis: this.formData.diagnosis,
      prescription: this.formData.prescription || undefined,
      condition: this.formData.condition || undefined,
      daysOfRest: this.formData.daysOfRest || 0,
      observations: undefined
    };

    this.http.post<any>(`${environment.apiUrl}/incidents`, incidentData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Incidente registrado exitosamente';
            this.saving = false;
            
            // Limpiar formulario después de un tiempo
            setTimeout(() => {
              this.clearForm();
              this.successMessage = '';
            }, 3000);
          } else {
            this.errorMessage = response.message || 'Error al guardar el incidente';
            this.saving = false;
          }
        },
        error: (error) => {
          console.error('Error guardando incidente:', error);
          this.errorMessage = 'Error al guardar: ' + (error.error?.message || 'Error desconocido');
          this.saving = false;
        }
      });
  }

  downloadIncidentsExcel() {
    // Hacer petición para obtener el Excel (el interceptor agregará el token automáticamente)
    this.http.get(`${environment.apiUrl}/incidents/export/excel`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        // Crear URL del blob
        const url = window.URL.createObjectURL(blob);
        
        // Crear elemento <a> para descargar
        const link = document.createElement('a');
        link.href = url;
        
        // Nombre del archivo con fecha
        const date = new Date().toISOString().split('T')[0];
        link.download = `Registro_Incidentes_${date}.xlsx`;
        
        // Simular clic para descargar
        document.body.appendChild(link);
        link.click();
        
        // Limpiar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.successMessage = 'Excel descargado exitosamente';
      },
      error: (error) => {
        console.error('Error descargando Excel:', error);
        this.errorMessage = 'Error al descargar Excel: ' + (error.error?.message || 'Error desconocido');
      }
    });
  }

  clearForm() {
    const now = new Date();
    this.formData.date = now.toISOString().split('T')[0];
    this.formData.cie10Code = '';
    this.formData.cie10Description = '';
    this.formData.causes = '';
    this.formData.secondaryCode = '';
    this.formData.secondaryDescription = '';
    this.formData.diagnosis = '';
    this.formData.prescription = '';
    this.formData.condition = 'ESTABLE';
    this.formData.daysOfRest = 0;
    this.patientData = {};
    this.searchIdentification = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
