import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SharedPatientService } from '../../core/services/shared-patient.service';

@Component({
  selector: 'app-antidoping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="module-page">
      <div class="module-content">
        <div class="form-container">
          <h2 class="form-title">REGISTRO ANTIDOPAJE</h2>
          
          <form (ngSubmit)="saveAntidoping()">
            <div class="form-row">
              <div class="form-group">
                <label>Fecha:</label>
                <input 
                  type="text" 
                  [value]="formatDate(formData.date)" 
                  class="form-control" 
                  readonly 
                />
              </div>
              <div class="form-group">
                <label>Cedula:</label>
                <div class="input-with-icon">
                  <input 
                    type="text" 
                    [ngModel]="searchIdentification" 
                    (ngModelChange)="searchIdentification = $event.toUpperCase()" 
                    name="searchIdentification"
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
            </div>

            <div class="form-row">
              <div class="form-group form-group-full">
                <label>Nombres y Apellidos:</label>
                <input 
                  type="text" 
                  [ngModel]="patientData.fullName" 
                  name="fullName"
                  class="form-control" 
                  readonly 
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group form-group-full">
                <label>Area de trabajo:</label>
                <input 
                  type="text" 
                  [ngModel]="patientData.workArea" 
                  name="workArea"
                  class="form-control" 
                  readonly 
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group form-group-full">
                <label>Tipo de doping:</label>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.dopingTypes.COC" 
                      name="dopingCOC"
                      (ngModelChange)="onDopingTypeChange('COC', $event)"
                    />
                    COC
                  </label>
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.dopingTypes.TCH" 
                      name="dopingTCH"
                      (ngModelChange)="onDopingTypeChange('TCH', $event)"
                    />
                    TCH
                  </label>
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.dopingTypes.ALCOHOL" 
                      name="dopingALCOHOL"
                      (ngModelChange)="onDopingTypeChange('ALCOHOL', $event)"
                    />
                    ALCOHOL
                  </label>
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.dopingTypes.EIG" 
                      name="dopingEIG"
                      (ngModelChange)="onDopingTypeChange('EIG', $event)"
                    />
                    EIG
                  </label>
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.dopingTypes.COC_TCH" 
                      name="dopingCOC_TCH"
                      (ngModelChange)="onDopingTypeChange('COC + TCH', $event)"
                    />
                    COC + TCH
                  </label>
                </div>
              </div>
            </div>

            <!-- Resultados por tipo de doping -->
            <div class="form-row" *ngIf="formData.dopingTypes.COC">
              <div class="form-group form-group-full">
                <label>Resultado COC:</label>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.results.COC.negativo" 
                      name="resultCOCNegativo"
                      (ngModelChange)="onResultChange('COC', 'negativo', $event)"
                    />
                    Negativo
                  </label>
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.results.COC.positivo" 
                      name="resultCOCPositivo"
                      (ngModelChange)="onResultChange('COC', 'positivo', $event)"
                    />
                    Positivo
                  </label>
                </div>
              </div>
            </div>

            <div class="form-row" *ngIf="formData.dopingTypes.TCH">
              <div class="form-group form-group-full">
                <label>Resultado TCH:</label>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.results.TCH.negativo" 
                      name="resultTCHNegativo"
                      (ngModelChange)="onResultChange('TCH', 'negativo', $event)"
                    />
                    Negativo
                  </label>
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.results.TCH.positivo" 
                      name="resultTCHPositivo"
                      (ngModelChange)="onResultChange('TCH', 'positivo', $event)"
                    />
                    Positivo
                  </label>
                </div>
              </div>
            </div>

            <div class="form-row" *ngIf="formData.dopingTypes.ALCOHOL">
              <div class="form-group form-group-full">
                <label>Resultado ALCOHOL:</label>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.results.ALCOHOL.negativo" 
                      name="resultALCOHOLNegativo"
                      (ngModelChange)="onResultChange('ALCOHOL', 'negativo', $event)"
                    />
                    Negativo
                  </label>
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.results.ALCOHOL.positivo" 
                      name="resultALCOHOLPositivo"
                      (ngModelChange)="onResultChange('ALCOHOL', 'positivo', $event)"
                    />
                    Positivo
                  </label>
                </div>
              </div>
            </div>

            <div class="form-row" *ngIf="formData.dopingTypes.EIG">
              <div class="form-group form-group-full">
                <label>Resultado EIG:</label>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.results.EIG.negativo" 
                      name="resultEIGNegativo"
                      (ngModelChange)="onResultChange('EIG', 'negativo', $event)"
                    />
                    Negativo
                  </label>
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.results.EIG.positivo" 
                      name="resultEIGPositivo"
                      (ngModelChange)="onResultChange('EIG', 'positivo', $event)"
                    />
                    Positivo
                  </label>
                </div>
              </div>
            </div>

            <div class="form-row" *ngIf="formData.dopingTypes.COC_TCH">
              <div class="form-group form-group-full">
                <label>Resultado COC + TCH:</label>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.results['COC + TCH'].negativo" 
                      name="resultCOC_TCHNegativo"
                      (ngModelChange)="onResultChange('COC + TCH', 'negativo', $event)"
                    />
                    Negativo
                  </label>
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.results['COC + TCH'].positivo" 
                      name="resultCOC_TCHPositivo"
                      (ngModelChange)="onResultChange('COC + TCH', 'positivo', $event)"
                    />
                    Positivo
                  </label>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group form-group-full">
                <label>Observaciones:</label>
                <div class="checkbox-group">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.observations.acude" 
                      name="observationsAcude"
                      (ngModelChange)="onObservationsChange('acude', $event)"
                    />
                    ACUDE
                  </label>
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      [(ngModel)]="formData.observations.noAcude" 
                      name="observationsNoAcude"
                      (ngModelChange)="onObservationsChange('noAcude', $event)"
                    />
                    NO ACUDE
                  </label>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="form-actions">
              <button type="submit" class="btn btn-success" [disabled]="saving">
                <i class="fas fa-spinner fa-spin" *ngIf="saving"></i>
                {{ saving ? 'GUARDANDO...' : 'Guardar registro' }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="downloadAntidopingExcel()">
                <i class="fas fa-download"></i> Descargar Historial
              </button>
            </div>

            <!-- Alert Messages -->
            <div class="alert alert-success" *ngIf="successMessage">
              {{ successMessage }}
            </div>
            <div class="alert alert-danger" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .module-page {
      min-height: 100vh;
      background: #f5f7fa;
      padding: 20px;
    }
    .module-content {
      max-width: 900px;
      margin: 0 auto;
    }
    .form-container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .form-title {
      color: #1e293b;
      font-size: 1.8rem;
      margin-bottom: 30px;
      font-weight: 600;
      text-align: center;
    }
    .form-row {
      display: flex;
      gap: 20px;
      margin-bottom: 20px;
    }
    .form-group {
      flex: 1;
    }
    .form-group-full {
      flex: 1;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
      color: #334155;
    }
    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 14px;
    }
    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    .form-control[readonly] {
      background-color: #f1f5f9;
      cursor: not-allowed;
    }
    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-with-icon .form-control {
      padding-right: 45px;
    }
    .btn-icon {
      position: absolute;
      right: 5px;
      background: #667eea;
      color: white;
      border: none;
      width: 35px;
      height: 35px;
      border-radius: 6px;
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
      gap: 15px;
      margin-top: 30px;
      justify-content: flex-end;
    }
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    .btn-success {
      background: #10b981;
      color: white;
    }
    .btn-success:hover:not(:disabled) {
      background: #059669;
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-secondary {
      background: #6b7280;
      color: white;
    }
    .btn-secondary:hover {
      background: #4b5563;
    }
    .checkbox-group {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: 500;
      color: #334155;
    }
    .checkbox-label input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #667eea;
    }
    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      margin-top: 15px;
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
  `]
})
export class AntidopingComponent implements OnInit {
  formData = {
    date: '',
    patientId: 0,
    identification: '',
    fullName: '',
    position: '',
    workArea: '',
    dopingTypes: {
      COC: false,
      TCH: false,
      ALCOHOL: false,
      EIG: false,
      COC_TCH: false
    },
    results: {
      COC: { negativo: false, positivo: false },
      TCH: { negativo: false, positivo: false },
      ALCOHOL: { negativo: false, positivo: false },
      EIG: { negativo: false, positivo: false },
      'COC + TCH': { negativo: false, positivo: false }
    },
    observations: {
      acude: false,
      noAcude: false
    }
  };

  patientData = {
    id: 0,
    identification: '',
    fullName: '',
    position: '',
    workArea: '',
    company: '',
    phone: '',
    address: ''
  };

  searchIdentification = '';
  saving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private sharedPatientService: SharedPatientService
  ) {}

  ngOnInit() {
    // Inicializar fecha actual
    const now = new Date();
    this.formData.date = now.toISOString().split('T')[0];

    // Suscribirse a cambios en el paciente compartido
    this.sharedPatientService.patientData$.subscribe(sharedPatient => {
      if (sharedPatient) {
        this.loadSharedPatientData(sharedPatient);
      }
    });

    // También cargar inmediatamente si ya existe
    const sharedPatient = this.sharedPatientService.getPatientData();
    if (sharedPatient) {
      this.loadSharedPatientData(sharedPatient);
    }
  }

  loadSharedPatientData(sharedPatient: any) {
    if (!sharedPatient) return;
    
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
            company: patient.company || '',
            phone: patient.phone || '',
            address: patient.address || ''
          };

          // Auto-poblar formulario
          this.formData.patientId = patient.id;
          this.formData.identification = patient.identification;
          this.formData.fullName = this.patientData.fullName;
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
            company: patient.company || '',
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
      }
    });
  }

  onDopingTypeChange(type: string, checked: boolean) {
    if (!checked) {
      // Si se desmarca un tipo, limpiar sus resultados
      if (type === 'COC') {
        this.formData.results.COC.negativo = false;
        this.formData.results.COC.positivo = false;
      } else if (type === 'TCH') {
        this.formData.results.TCH.negativo = false;
        this.formData.results.TCH.positivo = false;
      } else if (type === 'ALCOHOL') {
        this.formData.results.ALCOHOL.negativo = false;
        this.formData.results.ALCOHOL.positivo = false;
      } else if (type === 'EIG') {
        this.formData.results.EIG.negativo = false;
        this.formData.results.EIG.positivo = false;
      } else if (type === 'COC + TCH') {
        this.formData.results['COC + TCH'].negativo = false;
        this.formData.results['COC + TCH'].positivo = false;
      }
    }
  }

  onResultChange(type: string, result: 'negativo' | 'positivo', checked: boolean) {
    if (checked) {
      // Si se marca un resultado, desmarcar el otro
      if (result === 'negativo') {
        if (type === 'COC') {
          this.formData.results.COC.positivo = false;
        } else if (type === 'TCH') {
          this.formData.results.TCH.positivo = false;
        } else if (type === 'ALCOHOL') {
          this.formData.results.ALCOHOL.positivo = false;
        } else if (type === 'EIG') {
          this.formData.results.EIG.positivo = false;
        } else if (type === 'COC + TCH') {
          this.formData.results['COC + TCH'].positivo = false;
        }
      } else {
        if (type === 'COC') {
          this.formData.results.COC.negativo = false;
        } else if (type === 'TCH') {
          this.formData.results.TCH.negativo = false;
        } else if (type === 'ALCOHOL') {
          this.formData.results.ALCOHOL.negativo = false;
        } else if (type === 'EIG') {
          this.formData.results.EIG.negativo = false;
        } else if (type === 'COC + TCH') {
          this.formData.results['COC + TCH'].negativo = false;
        }
      }
    }
  }

  onObservationsChange(option: 'acude' | 'noAcude', checked: boolean) {
    if (checked) {
      // Si se marca una opción, desmarcar la otra
      if (option === 'acude') {
        this.formData.observations.noAcude = false;
      } else {
        this.formData.observations.acude = false;
      }
    }
  }

  saveAntidoping() {
    if (!this.patientData.id) {
      this.errorMessage = 'Por favor busque un paciente primero';
      return;
    }

    // Validar que al menos un tipo de doping esté seleccionado
    const selectedTypes = Object.values(this.formData.dopingTypes).some(v => v === true);
    if (!selectedTypes) {
      this.errorMessage = 'Por favor seleccione al menos un tipo de doping';
      return;
    }

    // Validar que cada tipo seleccionado tenga un resultado
    const selectedDopingTypes: string[] = [];
    if (this.formData.dopingTypes.COC) selectedDopingTypes.push('COC');
    if (this.formData.dopingTypes.TCH) selectedDopingTypes.push('TCH');
    if (this.formData.dopingTypes.ALCOHOL) selectedDopingTypes.push('ALCOHOL');
    if (this.formData.dopingTypes.EIG) selectedDopingTypes.push('EIG');
    if (this.formData.dopingTypes.COC_TCH) selectedDopingTypes.push('COC + TCH');

    for (const type of selectedDopingTypes) {
      let hasResult = false;
      if (type === 'COC') {
        hasResult = this.formData.results.COC.negativo || this.formData.results.COC.positivo;
      } else if (type === 'TCH') {
        hasResult = this.formData.results.TCH.negativo || this.formData.results.TCH.positivo;
      } else if (type === 'ALCOHOL') {
        hasResult = this.formData.results.ALCOHOL.negativo || this.formData.results.ALCOHOL.positivo;
      } else if (type === 'EIG') {
        hasResult = this.formData.results.EIG.negativo || this.formData.results.EIG.positivo;
      } else if (type === 'COC + TCH') {
        hasResult = this.formData.results['COC + TCH'].negativo || this.formData.results['COC + TCH'].positivo;
      }

      if (!hasResult) {
        this.errorMessage = `Por favor seleccione el resultado para ${type}`;
        return;
      }
    }

    // Validar observaciones
    if (!this.formData.observations.acude && !this.formData.observations.noAcude) {
      this.errorMessage = 'Por favor seleccione una opción en observaciones';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Construir arrays de tipos y resultados seleccionados
    const dopingTypesArray: string[] = [];
    const resultsArray: { type: string; result: string }[] = [];

    if (this.formData.dopingTypes.COC) {
      dopingTypesArray.push('COC');
      if (this.formData.results.COC.negativo) {
        resultsArray.push({ type: 'COC', result: 'NEGATIVO' });
      } else if (this.formData.results.COC.positivo) {
        resultsArray.push({ type: 'COC', result: 'POSITIVO' });
      }
    }
    if (this.formData.dopingTypes.TCH) {
      dopingTypesArray.push('TCH');
      if (this.formData.results.TCH.negativo) {
        resultsArray.push({ type: 'TCH', result: 'NEGATIVO' });
      } else if (this.formData.results.TCH.positivo) {
        resultsArray.push({ type: 'TCH', result: 'POSITIVO' });
      }
    }
    if (this.formData.dopingTypes.ALCOHOL) {
      dopingTypesArray.push('ALCOHOL');
      if (this.formData.results.ALCOHOL.negativo) {
        resultsArray.push({ type: 'ALCOHOL', result: 'NEGATIVO' });
      } else if (this.formData.results.ALCOHOL.positivo) {
        resultsArray.push({ type: 'ALCOHOL', result: 'POSITIVO' });
      }
    }
    if (this.formData.dopingTypes.EIG) {
      dopingTypesArray.push('EIG');
      if (this.formData.results.EIG.negativo) {
        resultsArray.push({ type: 'EIG', result: 'NEGATIVO' });
      } else if (this.formData.results.EIG.positivo) {
        resultsArray.push({ type: 'EIG', result: 'POSITIVO' });
      }
    }
    if (this.formData.dopingTypes.COC_TCH) {
      dopingTypesArray.push('COC + TCH');
      if (this.formData.results['COC + TCH'].negativo) {
        resultsArray.push({ type: 'COC + TCH', result: 'NEGATIVO' });
      } else if (this.formData.results['COC + TCH'].positivo) {
        resultsArray.push({ type: 'COC + TCH', result: 'POSITIVO' });
      }
    }

    const observationsValue = this.formData.observations.acude ? 'ACUDE' : 'NO ACUDE';

    const antidopingData = {
      patientId: this.formData.patientId,
      date: this.formData.date,
      identification: this.formData.identification,
      fullName: this.formData.fullName.toUpperCase(),
      position: this.formData.position.toUpperCase(),
      workArea: this.formData.workArea.toUpperCase(),
      dopingTypes: dopingTypesArray.join(', '),
      results: resultsArray.map(r => `${r.type}: ${r.result}`).join('; '),
      observations: observationsValue
    };

    this.http.post<any>(`${environment.apiUrl}/antidoping`, antidopingData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Registro de DOPING guardado exitosamente';
            this.saving = false;
            
            // Limpiar formulario después de un tiempo
            setTimeout(() => {
              this.clearForm();
              this.successMessage = '';
            }, 3000);
          } else {
            this.errorMessage = response.message || 'Error al guardar el registro';
            this.saving = false;
          }
        },
        error: (error) => {
          console.error('Error guardando registro antidoping:', error);
          this.errorMessage = 'Error al guardar: ' + (error.error?.message || 'Error desconocido');
          this.saving = false;
        }
      });
  }

  clearForm() {
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

    this.searchIdentification = '';
    this.formData = {
      date: new Date().toISOString().split('T')[0],
      patientId: 0,
      identification: '',
      fullName: '',
      position: '',
      workArea: '',
      dopingTypes: {
        COC: false,
        TCH: false,
        ALCOHOL: false,
        EIG: false,
        COC_TCH: false
      },
      results: {
        COC: { negativo: false, positivo: false },
        TCH: { negativo: false, positivo: false },
        ALCOHOL: { negativo: false, positivo: false },
        EIG: { negativo: false, positivo: false },
        'COC + TCH': { negativo: false, positivo: false }
      },
      observations: {
        acude: false,
        noAcude: false
      }
    };
  }

  downloadAntidopingExcel() {
    this.http.get(`${environment.apiUrl}/antidoping/export/excel`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Historial_Antidoping_${new Date().toISOString().split('T')[0]}.xlsx`;
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
        this.errorMessage = 'Error al descargar el historial';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
