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
  selector: 'app-diet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="diet-page">
      <div class="form-container">
        <h1 class="page-title">DIETA/INGRESO DE ALIMENTOS</h1>
        
        <!-- Cabecera: Fecha, Empresa, Médico -->
        <div class="form-section">
          <div class="form-row">
            <div class="form-group">
              <label>Fecha</label>
              <input type="text" [value]="formatDate(formData.date)" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Empresa</label>
              <input type="text" [(ngModel)]="patientData.company" class="form-control" readonly />
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
          <div class="form-row">
            <div class="form-group">
              <label>Cédula</label>
              <div class="input-with-icon">
                <input 
                  type="text" 
                  [ngModel]="searchIdentification" 
                  (ngModelChange)="searchIdentification = $event.toUpperCase()" 
                  class="form-control" 
                  placeholder="1312870270"
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
              <label>Puesto de trabajo</label>
              <input type="text" [(ngModel)]="patientData.position" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Área de trabajo</label>
              <input type="text" [(ngModel)]="patientData.workArea" class="form-control" readonly />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Teléfono</label>
              <input type="text" [(ngModel)]="patientData.phone" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Dirección</label>
              <input type="text" [(ngModel)]="patientData.address" class="form-control" readonly />
            </div>
          </div>
        </div>

        <!-- CIE-10 y Diagnóstico -->
        <div class="form-section">
          <div class="form-row">
            <div class="form-group">
              <label>CIE-10</label>
              <div class="input-with-icon">
                <input 
                  type="text" 
                  [(ngModel)]="formData.cie10Code" 
                  class="form-control" 
                  placeholder="GC004"
                  readonly
                />
                <button type="button" class="btn-icon" (click)="openCIE10Modal()">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Descripción COD CIE-10</label>
              <input type="text" [(ngModel)]="formData.cie10Description" class="form-control" readonly />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>COD. SEC</label>
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
              <label>Descripción COD.SEC</label>
              <input 
                type="text" 
                [ngModel]="formData.secondaryDescription" 
                (ngModelChange)="formData.secondaryDescription = $event.toUpperCase()" 
                class="form-control" 
                placeholder="Descripción código secundario" 
                style="text-transform: uppercase;"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
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
                [ngModel]="formData.evolution" 
                (ngModelChange)="formData.evolution = $event.toUpperCase()" 
                class="form-control textarea-large" 
                rows="4"
                placeholder="Evolución médica..."
                style="text-transform: uppercase;"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Fechas -->
        <div class="form-section">
          <div class="form-row">
            <div class="form-group">
              <label>Desde</label>
              <input type="date" [(ngModel)]="formData.startDate" class="form-control" />
            </div>
            <div class="form-group">
              <label>Hasta</label>
              <input type="date" [(ngModel)]="formData.endDate" class="form-control" />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button type="button" class="btn btn-primary" (click)="generatePDF()">
            <i class="fas fa-file-pdf"></i> Guardar PDF
          </button>
          <button type="button" class="btn btn-info" (click)="downloadHistory()">
            <i class="fas fa-file-excel"></i> Descargar Historial
          </button>
          <button type="button" class="btn btn-success" (click)="saveDietRecord()" [disabled]="saving">
            <i class="fas fa-spinner fa-spin" *ngIf="saving"></i>
            {{ saving ? 'GUARDANDO...' : 'Guardar Dieta' }}
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
    .diet-page {
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

    .page-title {
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

    .btn-info {
      background: #3b82f6;
      color: white;
    }

    .btn-info:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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
      max-height: 500px;
      overflow-y: auto;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }

    .cie10-table {
      width: 100%;
      border-collapse: collapse;
    }

    .cie10-table thead {
      background: #f8fafc;
      position: sticky;
      top: 0;
      z-index: 10;
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
      background-color: #f1f5f9;
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
export class DietComponent implements OnInit {
  searchIdentification = '';
  patientData: Partial<Patient> = {};
  currentDoctor: User | null = null;
  
  formData = {
    date: '',
    doctorId: 0,
    patientId: 0,
    identification: '',
    startDate: '',
    endDate: '',
    cie10Code: '',
    cie10Description: '',
    causes: '',
    secondaryCode: '',
    secondaryDescription: '',
    evolution: '',
    observations: ''
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

    // Suscribirse a cambios en el paciente compartido
    this.sharedPatientService.patientData$.subscribe(sharedPatient => {
      if (sharedPatient) {
        console.log('DietComponent: Recibió actualización del servicio compartido', sharedPatient);
        this.loadSharedPatientData(sharedPatient);
      }
    });

    // Cargar inmediatamente si ya existe información compartida
    setTimeout(() => {
      const sharedPatient = this.sharedPatientService.getPatientData();
      console.log('DietComponent: Datos compartidos al iniciar', sharedPatient);
      if (sharedPatient) {
        this.loadSharedPatientData(sharedPatient);
      }
    }, 200);
  }

  loadSharedPatientData(sharedPatient: any) {
    if (!sharedPatient) {
      console.log('DietComponent: No hay datos del paciente compartido');
      return;
    }
    
    console.log('DietComponent: Cargando datos del paciente compartido', sharedPatient);
    
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
    
    // Cargar datos de la consulta médica si existen
    if (sharedPatient.cie10Code) {
      this.formData.cie10Code = sharedPatient.cie10Code;
      this.formData.cie10Description = sharedPatient.cie10Description || '';
      
      if (sharedPatient.secondaryCode) {
        this.formData.secondaryCode = sharedPatient.secondaryCode;
      }
      
      if (sharedPatient.secondaryDescription) {
        this.formData.secondaryDescription = sharedPatient.secondaryDescription;
      }
    }
    
    // Cargar Causas y Evolución de la atención médica
    if (sharedPatient.causes) {
      this.formData.causes = sharedPatient.causes;
    }
    
    if (sharedPatient.diagnosis) {
      this.formData.evolution = sharedPatient.diagnosis;
    }
    
    console.log('DietComponent: Datos del paciente y consulta cargados correctamente');
  }

  formatDate(dateISO: string): string {
    if (!dateISO) return '';
    const date = new Date(dateISO);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
          this.patientData = {};
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
    if (!this.formData.secondaryCode) {
      this.formData.secondaryCode = this.generateSecondaryCode(code.code);
    }
    
    if (!this.formData.secondaryDescription) {
      this.formData.secondaryDescription = `Dieta relacionada a ${code.description}`;
    }
    
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
    
    // Generar código secundario con formato: DIE-[CIE10]-[Año][Mes]
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    
    const cie10Prefix = cie10Code.replace(/[^A-Z0-9]/g, '').substring(0, 3).toUpperCase();
    
    return `DIE-${cie10Prefix}-${year}${month}`;
  }

  generatePDF() {
    if (!this.patientData.id) {
      this.errorMessage = 'Por favor busque un paciente primero';
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;

    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REGISTRO DE DIETA/INGRESO DE ALIMENTOS', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Fecha
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${this.formatDate(this.formData.date)}`, margin, yPosition);
    yPosition += 8;

    // Datos del paciente
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL PACIENTE', margin, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Cédula: ${this.patientData.identification || ''}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Nombre: ${(this.patientData.fullName || '').toUpperCase()}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Puesto: ${(this.patientData.position || '').toUpperCase()}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Área: ${(this.patientData.workArea || '').toUpperCase()}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Empresa: ${(this.patientData.company || '').toUpperCase()}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Teléfono: ${this.patientData.phone || ''}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Dirección: ${(this.patientData.address || '').toUpperCase()}`, margin, yPosition);
    yPosition += 10;

    // CIE-10 y Diagnóstico
    doc.setFont('helvetica', 'bold');
    doc.text('CIE-10 Y DIAGNÓSTICO', margin, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`CIE-10: ${this.formData.cie10Code || ''}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Descripción: ${(this.formData.cie10Description || '').toUpperCase()}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Causas: ${(this.formData.causes || '').toUpperCase()}`, margin, yPosition);
    yPosition += 6;
    doc.text(`COD SEC: ${(this.formData.secondaryCode || '').toUpperCase()}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Descripción COD.SEC: ${(this.formData.secondaryDescription || '').toUpperCase()}`, margin, yPosition);
    yPosition += 10;

    // Evolución
    if (this.formData.evolution) {
      doc.setFont('helvetica', 'bold');
      doc.text('EVOLUCIÓN', margin, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      const evolutionLines = doc.splitTextToSize((this.formData.evolution || '').toUpperCase(), pageWidth - (margin * 2));
      doc.text(evolutionLines, margin, yPosition);
      yPosition += evolutionLines.length * 5 + 5;
    }

    // Fechas
    doc.setFont('helvetica', 'bold');
    doc.text('PERÍODO DE DIETA', margin, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Desde: ${this.formData.startDate || 'N/A'}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Hasta: ${this.formData.endDate || 'N/A'}`, margin, yPosition);
    yPosition += 10;

    // Firma
    const footerY = doc.internal.pageSize.height - 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text((this.currentDoctor?.fullName || 'DR. MÉDICO').toUpperCase(), margin, footerY);
    doc.line(margin, footerY + 2, margin + 50, footerY + 2);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('FIRMA Y SELLO DEL MÉDICO', margin, footerY + 8);

    // Guardar PDF
    const filename = `DIETA_${this.patientData.identification}_${this.formData.date.replace(/-/g, '')}.pdf`;
    doc.save(filename);
    this.successMessage = 'PDF generado exitosamente';
  }

  saveDietRecord() {
    if (!this.patientData.id) {
      this.errorMessage = 'Por favor busque un paciente primero';
      return;
    }

    if (!this.formData.startDate || !this.formData.endDate) {
      this.errorMessage = 'Por favor complete las fechas Desde y Hasta';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const dietData = {
      identification: this.patientData.identification || '',
      startDate: this.formData.startDate,
      endDate: this.formData.endDate,
      observations: this.formData.evolution || '',
      cie10Code: this.formData.cie10Code || undefined,
      cie10Description: this.formData.cie10Description || undefined,
      causes: this.formData.causes || undefined,
      secondaryCode: this.formData.secondaryCode || undefined,
      secondaryDescription: this.formData.secondaryDescription || undefined,
      evolution: this.formData.evolution || undefined
    };

    this.http.post<any>(`${environment.apiUrl}/diets`, dietData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Registro de dieta guardado exitosamente';
            this.saving = false;
            
            // Ocultar mensaje de éxito después de un tiempo, pero mantener toda la información
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          } else {
            this.errorMessage = response.message || 'Error al guardar el registro';
            this.saving = false;
          }
        },
        error: (error) => {
          console.error('Error guardando registro de dieta:', error);
          this.errorMessage = 'Error al guardar: ' + (error.error?.message || 'Error desconocido');
          this.saving = false;
        }
      });
  }

  clearForm() {
    const now = new Date();
    this.formData.date = now.toISOString().split('T')[0];
    this.formData.startDate = '';
    this.formData.endDate = '';
    this.formData.cie10Code = '';
    this.formData.cie10Description = '';
    this.formData.causes = '';
    this.formData.secondaryCode = '';
    this.formData.secondaryDescription = '';
    this.formData.evolution = '';
    this.patientData = {};
    this.searchIdentification = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  downloadHistory() {
    this.http.get(`${environment.apiUrl}/diets/export/excel`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Historial_Dieta_Ingreso_Alimentos_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.successMessage = 'Historial descargado exitosamente';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error descargando historial:', error);
        this.errorMessage = 'Error al descargar el historial: ' + (error.error?.message || 'Error desconocido');
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }
}

