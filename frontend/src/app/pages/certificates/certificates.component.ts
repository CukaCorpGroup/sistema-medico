import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="certificate-page">
      <div class="form-container">
        <h2 class="form-title">CERTIFICADOS MÉDICOS</h2>
        
        <!-- Header Information -->
        <div class="form-section">
          <div class="form-row">
            <div class="form-group">
              <label>Fecha</label>
              <input type="text" [value]="formatDateWithLocation(formData.date)" class="form-control" readonly />
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
          <p class="section-description">Por medio del presente certifico haber atendido al Sr (a):</p>
          <div class="form-row">
            <div class="form-group form-group-full">
              <label>Nombre del Paciente</label>
              <input type="text" [(ngModel)]="patientData.fullName" class="form-control" readonly />
            </div>
          </div>
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
              <label>Perteneciente al área de trabajo</label>
              <input type="text" [(ngModel)]="patientData.workArea" class="form-control" readonly />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Teléfono</label>
              <input type="text" [(ngModel)]="patientData.phone" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Actividad laboral</label>
              <input type="text" [(ngModel)]="patientData.position" class="form-control" readonly />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Dirección</label>
              <input type="text" [(ngModel)]="patientData.address" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Historia clínica</label>
              <input type="text" [(ngModel)]="formData.clinicalHistory" class="form-control" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Empresa</label>
              <input type="text" [(ngModel)]="patientData.company" class="form-control" readonly />
            </div>
          </div>
      </div>
      
        <!-- Diagnóstico -->
        <div class="form-section">
          <h3 class="section-title">Diagnóstico</h3>
          <p class="section-description">por presentar cuadro caracterizado por:</p>
          <div class="form-row">
            <div class="form-group">
              <label>COD CIE-10</label>
              <div class="input-with-icon">
                <input 
                  type="text" 
                  [(ngModel)]="formData.cie10Code" 
                  class="form-control" 
                  placeholder="GC012C"
                  readonly
                />
                <button type="button" class="btn-icon" (click)="openCIE10Modal()">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>DIAGNÓSTICO</label>
              <input type="text" [(ngModel)]="formData.diagnosis" class="form-control" readonly />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Tipo de contingencia</label>
              <select [(ngModel)]="formData.contingencyType" class="form-control">
                <option value="">Seleccione...</option>
                <option value="ENFERMEDAD GENERAL">ENFERMEDAD GENERAL</option>
                <option value="ACCIDENTE">ACCIDENTE</option>
                <option value="ENFERMEDAD PROFESIONAL">ENFERMEDAD PROFESIONAL</option>
              </select>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="formData.sentToRevalidate" /> ENVIADO A REVALIDAR
              </label>
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
          <div class="form-row">
            <div class="form-group form-group-full">
              <label>Descripción de</label>
              <input 
                type="text" 
                [ngModel]="formData.description" 
                (ngModelChange)="formData.description = $event.toUpperCase()" 
                class="form-control" 
                style="text-transform: uppercase;"
              />
            </div>
          </div>
        </div>

        <!-- Registro de certificado médico -->
        <div class="form-section">
          <h3 class="section-title">Registro de certificado médico</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Desde</label>
              <input type="date" [(ngModel)]="formData.fromDate" (ngModelChange)="calculateWorkingDays()" class="form-control" />
            </div>
            <div class="form-group">
              <label>Hasta</label>
              <input type="date" [(ngModel)]="formData.toDate" (ngModelChange)="calculateWorkingDays()" class="form-control" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>DIAS LABORABLES</label>
              <input 
                type="number" 
                [value]="areDatesEqual() ? '' : formData.workingDays" 
                class="form-control" 
                readonly 
                [disabled]="areDatesEqual()"
              />
            </div>
            <div class="form-group">
              <label>EQ. HORAS</label>
              <input 
                type="number" 
                [value]="areDatesEqual() ? '' : formData.equivalentHours" 
                class="form-control" 
                readonly 
                [disabled]="areDatesEqual()"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>HORAS</label>
              <input type="number" [(ngModel)]="formData.hours" class="form-control" min="0" [disabled]="!areDatesEqual()" />
            </div>
            <div class="form-group">
              <label>DIAS</label>
              <input type="number" [(ngModel)]="formData.days" class="form-control" min="0" [disabled]="!areDatesEqual()" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="formData.generalIllness" (ngModelChange)="onGeneralIllnessChange()" [disabled]="formData.accident" /> ENF.GENERAL
              </label>
            </div>
            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="formData.accident" (ngModelChange)="onAccidentChange()" [disabled]="formData.generalIllness" /> ACCIDENTE
              </label>
            </div>
          </div>
        </div>

        <!-- Información de emisión -->
        <div class="form-section">
          <h3 class="section-title">Información de emisión</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Institución que emite el certificado</label>
              <select [(ngModel)]="formData.issuingInstitution" class="form-control">
                <option value="">Seleccione...</option>
                <option value="MARBELIZE S.A.">MARBELIZE S.A.</option>
                <option value="IESS">IESS</option>
                <option value="CLINICA PRIVADA">CLINICA PRIVADA</option>
              </select>
            </div>
            <div class="form-group">
              <label>Especialidad "B"</label>
              <select [(ngModel)]="formData.specialtyB" class="form-control">
                <option value="">Seleccione...</option>
                <option value="MEDICINA GENERAL">MEDICINA GENERAL</option>
                <option value="MEDICINA DEL TRABAJO">MEDICINA DEL TRABAJO</option>
                <option value="TRAUMATOLOGIA">TRAUMATOLOGIA</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Médico que emite el</label>
              <input 
                type="text" 
                [ngModel]="formData.issuingDoctor" 
                (ngModelChange)="formData.issuingDoctor = $event.toUpperCase()" 
                class="form-control" 
                style="text-transform: uppercase;"
              />
            </div>
            <div class="form-group">
              <label>Servicio "C"</label>
              <select [(ngModel)]="formData.serviceC" class="form-control">
                <option value="">Seleccione...</option>
                <option value="CONSULTA EXTERNA">CONSULTA EXTERNA</option>
                <option value="URGENCIAS">URGENCIAS</option>
                <option value="HOSPITALIZACION">HOSPITALIZACION</option>
              </select>
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
            <div class="form-group">
              <label>Documento</label>
              <div class="checkbox-group">
                <label>
                  <input type="checkbox" [(ngModel)]="formData.validDocument" (ngModelChange)="onValidDocumentChange()" [disabled]="formData.invalidDocument" /> VALIDO
                </label>
                <label>
                  <input type="checkbox" [(ngModel)]="formData.invalidDocument" (ngModelChange)="onInvalidDocumentChange()" [disabled]="formData.validDocument" /> NO VALIDO
                </label>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Médico D</label>
              <select [(ngModel)]="formData.doctorD" class="form-control">
                <option value="">Seleccione...</option>
                <option [value]="currentDoctor?.id">{{ currentDoctor?.fullName || 'Seleccione médico...' }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Información de Incidente/Accidente -->
        <div class="form-section">
          <div class="form-row">
            <div class="form-group form-group-full" style="display: flex; align-items: center; gap: 15px;">
              <label class="checkbox-label" style="flex: 1;">
                <input 
                  type="checkbox" 
                  [(ngModel)]="formData.fromIncidentAccident" 
                  (ngModelChange)="onIncidentAccidentChange()"
                />
                PROVIENE DE UN INCIDENTE/ACCIDENTE?
              </label>
              <button 
                type="button" 
                class="btn btn-info" 
                (click)="checkIncidentHistory()"
                [disabled]="!patientData.id"
                style="white-space: nowrap;"
              >
                <i class="fas fa-history"></i> Historial Incidente/Accidente
              </button>
            </div>
          </div>
          <div class="form-row" *ngIf="formData.fromIncidentAccident">
            <div class="form-group form-group-full">
              <label>Información de Atención Médica</label>
              <textarea 
                [(ngModel)]="formData.medicalAttentionInfo" 
                class="form-control textarea-large" 
                rows="6"
                placeholder="La información de la atención médica se cargará automáticamente cuando la causa sea ACCIDENTE o INCIDENTE..."
                readonly
                style="text-transform: uppercase; background-color: #f1f5f9;"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button type="button" class="btn btn-primary" (click)="generatePDF()">
            <i class="fas fa-file-pdf"></i> IMPRIMIR / GUARDAR PDF
          </button>
          <button type="button" class="btn btn-info" (click)="downloadHistory()">
            <i class="fas fa-file-excel"></i> Descargar Historial
          </button>
          <button type="button" class="btn btn-success" (click)="saveCertificate()" [disabled]="saving">
            <i class="fas fa-spinner fa-spin" *ngIf="saving"></i>
            {{ saving ? 'GUARDANDO...' : 'Guardar Datos Certificado' }}
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
                </tbody>
              </table>
              <div class="no-results" *ngIf="filteredCIE10List.length === 0">
                <p>No se encontraron resultados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Confirmación Incidente/Accidente -->
      <div class="modal-overlay" *ngIf="showIncidentConfirmModal" (click)="closeIncidentConfirmModal()">
        <div class="modal-content modal-confirm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Validación de Incidente/Accidente</h3>
            <button type="button" class="btn-close" (click)="closeIncidentConfirmModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="confirmation-message">
              <p class="confirmation-text">
                Este paciente presenta atenciones por incidente/accidente registrados ¿este certificado proviene a consecuencia de este registro?
              </p>
              <div class="incident-info" *ngIf="lastIncidentRecord">
                <h4>Último Registro Encontrado:</h4>
                <div class="info-item">
                  <strong>Fecha:</strong> {{ formatDate(lastIncidentRecord.date) }}
                </div>
                <div class="info-item" *ngIf="lastIncidentRecord.cie10Code">
                  <strong>CIE-10:</strong> {{ lastIncidentRecord.cie10Code }} - {{ lastIncidentRecord.cie10Description }}
                </div>
                <div class="info-item" *ngIf="lastIncidentRecord.causes">
                  <strong>Causa:</strong> {{ lastIncidentRecord.causes }}
                </div>
                <div class="info-item" *ngIf="lastIncidentRecord.diagnosis">
                  <strong>Evolución:</strong> {{ lastIncidentRecord.diagnosis }}
                </div>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-success" (click)="confirmIncidentCertificate()">
                <i class="fas fa-check"></i> Sí
              </button>
              <button type="button" class="btn btn-secondary" (click)="rejectIncidentCertificate()">
                <i class="fas fa-times"></i> No
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .certificate-page {
      min-height: 100vh;
      background: #f5f7fa;
      padding: 20px;
    }

    .form-container {
      max-width: 1400px;
      margin: 0 auto;
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
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }

    .section-description {
      color: #64748b;
      font-size: 0.95rem;
      margin-bottom: 15px;
      font-style: italic;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 15px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group-full {
      grid-column: 1 / -1;
    }

    .form-group label {
      color: #334155;
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .form-group label input[type="checkbox"] {
      margin-right: 8px;
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .checkbox-group {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      margin-top: 8px;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      margin-bottom: 0;
      cursor: pointer;
      font-weight: 500;
    }

    .checkbox-group label input[type="checkbox"] {
      margin-right: 8px;
      width: 18px;
      height: 18px;
      cursor: pointer;
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
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: border-color 0.3s;
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

    .form-control:disabled {
      background-color: #e2e8f0;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .form-group label input[type="checkbox"]:disabled {
      cursor: not-allowed;
      opacity: 0.5;
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
      display: inline-flex;
      align-items: center;
      gap: 8px;
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

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #4b5563;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
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
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #64748b;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover {
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
      font-size: 0.9rem;
    }

    .cie10-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #475569;
      font-size: 0.9rem;
    }

    .cie10-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .cie10-row:hover {
      background-color: #f1f5f9;
    }

    .no-results {
      padding: 40px;
      text-align: center;
      color: #64748b;
    }

    /* Modal Confirmación Incidente/Accidente */
    .modal-confirm {
      max-width: 600px;
    }

    .confirmation-message {
      padding: 20px 0;
    }

    .confirmation-text {
      font-size: 1.1rem;
      color: #1e293b;
      font-weight: 500;
      margin-bottom: 20px;
      line-height: 1.6;
    }

    .incident-info {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 15px;
      margin-top: 15px;
    }

    .incident-info h4 {
      margin: 0 0 15px 0;
      color: #334155;
      font-size: 1rem;
      font-weight: 600;
    }

    .info-item {
      margin-bottom: 10px;
      color: #475569;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .info-item strong {
      color: #1e293b;
      font-weight: 600;
      margin-right: 8px;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      margin-top: 25px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
  `]
})
export class CertificatesComponent implements OnInit {
  searchIdentification = '';
  patientData: Partial<Patient> = {};
  currentDoctor: any = null;
  
  formData = {
    date: '',
    doctorId: 0,
    patientId: 0,
    clinicalHistory: '',
    cie10Code: '',
    diagnosis: '',
    contingencyType: '',
    evolution: '',
    description: '',
    sentToRevalidate: false,
    fromDate: '',
    toDate: '',
    hours: 0,
    workingDays: 0,
    days: 0,
    equivalentHours: 0,
    generalIllness: false,
    accident: false,
    issuingInstitution: '',
    specialtyB: '',
    issuingDoctor: '',
    serviceC: '',
    causes: '',
    document: '',
    validDocument: false,
    invalidDocument: false,
    doctorD: '',
    fromIncidentAccident: false,
    medicalAttentionInfo: ''
  };

  saving = false;
  successMessage = '';
  errorMessage = '';

  // Modal CIE-10
  showCIE10Modal = false;
  cie10SearchQuery = '';
  cie10List: CIE10[] = [];
  filteredCIE10List: CIE10[] = [];

  // Modal Confirmación Incidente/Accidente
  showIncidentConfirmModal = false;
  lastIncidentRecord: any = null;

  constructor(
    private router: Router,
    private http: HttpClient,
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
      this.formData.issuingDoctor = this.currentDoctor.fullName || '';
      this.formData.doctorD = this.currentDoctor.id.toString();
    }

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
    
    this.formData.patientId = sharedPatient.id || 0;
    
    // Cargar datos de la consulta médica si existen
    if (sharedPatient.cie10Code) {
      this.formData.cie10Code = sharedPatient.cie10Code;
      this.formData.diagnosis = sharedPatient.cie10Description || '';
    }
    
    if (sharedPatient.causes) {
      this.formData.causes = sharedPatient.causes;
    }
    
    if (sharedPatient.diagnosis) {
      this.formData.evolution = sharedPatient.diagnosis;
    }

    // Si hay causa ACCIDENTE o INCIDENTE, marcar el checkbox automáticamente
    if (sharedPatient.causes === 'ACCIDENTE' || sharedPatient.causes === 'INCIDENTE') {
      this.formData.fromIncidentAccident = true;
      // Cargar información de atención médica si está disponible
      if (sharedPatient.causes && (sharedPatient.causes === 'ACCIDENTE' || sharedPatient.causes === 'INCIDENTE')) {
        let info = '';
        if (this.formData.date) {
          info += `FECHA: ${this.formatDate(this.formData.date)}\n`;
        }
        if (sharedPatient.cie10Code) {
          const cie10Desc = sharedPatient.cie10Description || '';
          info += `CIE-10: ${sharedPatient.cie10Code} - ${cie10Desc}\n`;
        }
        if (sharedPatient.causes) {
          info += `CAUSA: ${sharedPatient.causes}\n`;
        }
        if (sharedPatient.diagnosis) {
          info += `EVOLUCIÓN: ${sharedPatient.diagnosis}`;
        }
        this.formData.medicalAttentionInfo = info.toUpperCase();
      } else {
        // Si no, buscar en el historial médico
        this.loadMedicalAttentionInfo();
      }
    }
  }

  formatDateWithLocation(dateISO: string): string {
    if (!dateISO) return '';
    const date = new Date(dateISO);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `Jaramijó, ${day}/${month}/${year}`;
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

          this.formData.patientId = patient.id;

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

          // Si el checkbox está marcado, cargar información de atención médica
          if (this.formData.fromIncidentAccident) {
            this.loadMedicalAttentionInfo();
          }
        } else {
          this.errorMessage = 'Paciente no encontrado';
          this.patientData = {};
        }
      },
      error: (error) => {
        console.error('Error buscando paciente:', error);
        this.errorMessage = 'Error al buscar paciente: ' + (error.error?.message || 'Error desconocido');
      }
    });
  }

  onIncidentAccidentChange() {
    if (this.formData.fromIncidentAccident && this.formData.patientId) {
      this.loadMedicalAttentionInfo();
    } else {
      this.formData.medicalAttentionInfo = '';
    }
  }

  checkIncidentHistory() {
    if (!this.patientData.id) {
      this.errorMessage = 'Por favor busque un paciente primero';
      return;
    }

    // Buscar el último registro médico con causa ACCIDENTE o INCIDENTE
    this.http.get<any>(`${environment.apiUrl}/medical-records`, {
      params: { 
        patientId: this.patientData.id.toString(),
        page: '1',
        limit: '100'
      }
    }).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          // Buscar el registro más reciente con causa ACCIDENTE o INCIDENTE
          const incidentAccidentRecord = response.data.find((record: any) => 
            record.causes === 'ACCIDENTE' || record.causes === 'INCIDENTE'
          );

          if (incidentAccidentRecord) {
            // Guardar el registro encontrado y mostrar el modal de confirmación
            this.lastIncidentRecord = incidentAccidentRecord;
            this.showIncidentConfirmModal = true;
          } else {
            // No se encontró ningún registro con causa ACCIDENTE o INCIDENTE
            this.errorMessage = 'No se encontraron registros de atención médica con causa ACCIDENTE o INCIDENTE para este paciente.';
            setTimeout(() => {
              this.errorMessage = '';
            }, 5000);
          }
        } else {
          this.errorMessage = 'No se encontraron registros médicos previos para este paciente.';
          setTimeout(() => {
            this.errorMessage = '';
          }, 5000);
        }
      },
      error: (error) => {
        console.error('Error buscando historial de incidentes:', error);
        this.errorMessage = 'Error al buscar el historial: ' + (error.error?.message || 'Error desconocido');
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  closeIncidentConfirmModal() {
    this.showIncidentConfirmModal = false;
    this.lastIncidentRecord = null;
  }

  confirmIncidentCertificate() {
    if (this.lastIncidentRecord) {
      // Marcar el checkbox
      this.formData.fromIncidentAccident = true;
      
      // Cargar la información de atención médica
      let info = '';
      info += `FECHA: ${this.formatDate(this.lastIncidentRecord.date)}\n`;
      if (this.lastIncidentRecord.cie10Code) {
        const cie10Desc = this.lastIncidentRecord.cie10Description || '';
        info += `CIE-10: ${this.lastIncidentRecord.cie10Code} - ${cie10Desc}\n`;
      }
      if (this.lastIncidentRecord.causes) {
        info += `CAUSA: ${this.lastIncidentRecord.causes}\n`;
      }
      if (this.lastIncidentRecord.diagnosis) {
        info += `EVOLUCIÓN: ${this.lastIncidentRecord.diagnosis}`;
      }
      this.formData.medicalAttentionInfo = info.toUpperCase();

      // Cerrar el modal
      this.closeIncidentConfirmModal();
      
      this.successMessage = 'Información de incidente/accidente cargada correctamente.';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }
  }

  rejectIncidentCertificate() {
    // Dejar el checkbox vacío y limpiar la información
    this.formData.fromIncidentAccident = false;
    this.formData.medicalAttentionInfo = '';
    
    // Cerrar el modal
    this.closeIncidentConfirmModal();
  }

  loadMedicalAttentionInfo() {
    if (!this.formData.patientId) {
      this.formData.medicalAttentionInfo = 'PRIMERO DEBE BUSCAR UN PACIENTE.';
      return;
    }

    // Buscar la última atención médica del paciente con causa ACCIDENTE o INCIDENTE
    this.http.get<any>(`${environment.apiUrl}/medical-records`, {
      params: { 
        patientId: this.formData.patientId.toString(),
        page: '1',
        limit: '100'
      }
    }).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.length > 0) {
          // Buscar el registro más reciente con causa ACCIDENTE o INCIDENTE
          const incidentAccidentRecord = response.data.find((record: any) => 
            record.causes === 'ACCIDENTE' || record.causes === 'INCIDENTE'
          );

          if (incidentAccidentRecord) {
            // Construir la información de atención médica con formato exacto como en la imagen
            let info = '';
            info += `FECHA: ${this.formatDate(incidentAccidentRecord.date)}\n`;
            if (incidentAccidentRecord.cie10Code) {
              const cie10Desc = incidentAccidentRecord.cie10Description || '';
              info += `CIE-10: ${incidentAccidentRecord.cie10Code} - ${cie10Desc}\n`;
            }
            if (incidentAccidentRecord.causes) {
              info += `CAUSA: ${incidentAccidentRecord.causes}\n`;
            }
            if (incidentAccidentRecord.diagnosis) {
              info += `EVOLUCIÓN: ${incidentAccidentRecord.diagnosis}`;
            }

            this.formData.medicalAttentionInfo = info.toUpperCase();
          } else {
            this.formData.medicalAttentionInfo = 'NO SE ENCONTRÓ ATENCIÓN MÉDICA PREVIA CON CAUSA ACCIDENTE O INCIDENTE PARA ESTE PACIENTE.';
          }
        } else {
          this.formData.medicalAttentionInfo = 'NO SE ENCONTRARON REGISTROS MÉDICOS PREVIOS PARA ESTE PACIENTE.';
        }
      },
      error: (error) => {
        console.error('Error cargando información de atención médica:', error);
        this.formData.medicalAttentionInfo = 'ERROR AL CARGAR LA INFORMACIÓN DE ATENCIÓN MÉDICA.';
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
    this.formData.diagnosis = code.description;
    this.closeCIE10Modal();
  }

  areDatesEqual(): boolean {
    if (!this.formData.fromDate || !this.formData.toDate) {
      return false;
    }
    return this.formData.fromDate === this.formData.toDate;
  }

  onGeneralIllnessChange() {
    if (this.formData.generalIllness) {
      this.formData.accident = false;
    }
  }

  onAccidentChange() {
    if (this.formData.accident) {
      this.formData.generalIllness = false;
    }
  }

  onValidDocumentChange() {
    if (this.formData.validDocument) {
      this.formData.invalidDocument = false;
    }
  }

  onInvalidDocumentChange() {
    if (this.formData.invalidDocument) {
      this.formData.validDocument = false;
    }
  }

  calculateWorkingDays() {
    if (!this.formData.fromDate || !this.formData.toDate) {
      this.formData.workingDays = 0;
      this.formData.equivalentHours = 0;
      return;
    }

    // Si las fechas son iguales, dejar los campos vacíos
    if (this.formData.fromDate === this.formData.toDate) {
      this.formData.workingDays = 0;
      this.formData.equivalentHours = 0;
      return;
    }

    try {
      // Crear fechas sin hora (solo fecha)
      const fromDate = new Date(this.formData.fromDate + 'T00:00:00');
      const toDate = new Date(this.formData.toDate + 'T00:00:00');

      if (toDate < fromDate) {
        this.formData.workingDays = 0;
        this.formData.equivalentHours = 0;
        return;
      }

      // Calcular días laborables (excluyendo sábados y domingos)
      let workingDays = 0;
      const currentDate = new Date(fromDate);
      
      while (currentDate <= toDate) {
        const dayOfWeek = currentDate.getDay();
        // 0 = Domingo, 6 = Sábado
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      this.formData.workingDays = workingDays;
      // Calcular horas equivalentes: días laborables * 8 horas
      this.formData.equivalentHours = workingDays * 8;
    } catch (error) {
      console.error('Error calculando días laborables:', error);
      this.formData.workingDays = 0;
      this.formData.equivalentHours = 0;
    }
  }

  generatePDF() {
    if (!this.patientData.id) {
      this.errorMessage = 'Por favor busque un paciente primero';
      return;
    }

    // Proceder directamente a generar el PDF sin validar CIE-10
    this.errorMessage = '';
    this.successMessage = '';
    this.proceedToGeneratePDF();
  }

  proceedToGeneratePDF() {
    if (!this.patientData.id) {
      this.errorMessage = 'Por favor busque un paciente primero';
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      let yPosition = margin;

      // Colores
      const headerBlue = [23, 37, 84];
      const lightBlue = [230, 244, 255];

      // ========== HEADER BAR ==========
      doc.setFillColor(headerBlue[0], headerBlue[1], headerBlue[2]);
      doc.rect(0, 0, pageWidth, 15, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('CERTIFICADO MÉDICO', pageWidth / 2, 11, { align: 'center' });
      yPosition = 20;

      // ========== INFORMACIÓN DE CONTACTO ==========
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('KM 5 1/2 VIA MANTA ROCAFUERTE', margin, yPosition);
      yPosition += 4;
      doc.text('TELEFONO: 052389000 EXT. 156', margin, yPosition);
      
      doc.setTextColor(0, 0, 255);
      doc.text('jmedico@marbelize.com', pageWidth - margin - 5, yPosition - 4, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('DEPARTAMENTO MÉDICO', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // ========== FECHA ==========
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('FECHA:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(this.formatDatePDF(this.formData.date), margin + 18, yPosition);
      yPosition += 8;

      // ========== DATOS DEL PACIENTE ==========
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Por medio del presente certifico haber atendido al Sr (a):', margin, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text((this.patientData.fullName || '').toUpperCase(), margin + 20, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('# Cédula:', margin, yPosition);
      doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
      doc.rect(margin + 25, yPosition - 4, 35, 5, 'F');
      doc.text(this.patientData.identification || '', margin + 27, yPosition);
      yPosition += 6;

      doc.text('Perteneciente al área de trabajo:', margin, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text((this.patientData.workArea || '').toUpperCase(), margin + 55, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      doc.text('Teléfono:', margin, yPosition);
      doc.text(this.patientData.phone || '', margin + 25, yPosition);
      yPosition += 6;

      doc.text('Actividad laboral:', margin, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text((this.patientData.position || '').toUpperCase(), margin + 35, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      doc.text('Historia clínica:', margin, yPosition);
      doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
      doc.rect(margin + 35, yPosition - 4, 35, 5, 'F');
      doc.text(this.formData.clinicalHistory || '', margin + 37, yPosition);
      yPosition += 6;

      doc.text('Dirección:', margin, yPosition);
      doc.text((this.patientData.address || '').toUpperCase(), margin + 25, yPosition);
      yPosition += 6;

      doc.text('Empresa:', margin, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text((this.patientData.company || 'MARBELIZE').toUpperCase(), margin + 25, yPosition);
      yPosition += 8;

      // ========== DIAGNÓSTICO ==========
      doc.setFont('helvetica', 'normal');
      doc.text('por presentar cuadro caracterizado por:', margin, yPosition);
      yPosition += 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('COD CIE-10', margin, yPosition);
      doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
      doc.rect(margin, yPosition + 2, 30, 7, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text((this.formData.cie10Code || '').toUpperCase(), margin + 2, yPosition + 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('DIAGNÓSTICO', margin + 70, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const diagnosisText = (this.formData.diagnosis || '').toUpperCase();
      const diagnosisLines = doc.splitTextToSize(diagnosisText, pageWidth - margin - 75);
      doc.text(diagnosisLines, margin + 70, yPosition + 7);
      yPosition += 15;

      // ========== TIPO DE CONTINGENCIA ==========
      if (this.formData.contingencyType) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Tipo de contingencia:', margin, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text((this.formData.contingencyType || '').toUpperCase(), margin + 45, yPosition);
        yPosition += 6;
      }

      // ========== ENVIADO A REVALIDAR ==========
      if (this.formData.sentToRevalidate) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('✓ ENVIADO A REVALIDAR', margin, yPosition);
        yPosition += 6;
      }

      // ========== EVOLUCIÓN ==========
      if (this.formData.evolution) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('EVOLUCIÓN', margin, yPosition);
        yPosition += 7;

        doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
        const evolutionHeight = Math.min(40, doc.splitTextToSize((this.formData.evolution || '').toUpperCase(), pageWidth - (margin * 2) - 4).length * 5);
        doc.rect(margin, yPosition, pageWidth - (margin * 2), evolutionHeight, 'F');
        
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const evolutionLines = doc.splitTextToSize((this.formData.evolution || '').toUpperCase(), pageWidth - (margin * 2) - 4);
        doc.text(evolutionLines, margin + 3, yPosition + 6);
        yPosition += evolutionHeight + 8;
      }

      // ========== DESCRIPCIÓN ==========
      if (this.formData.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Descripción de:', margin, yPosition);
        doc.setFont('helvetica', 'bold');
        const descLines = doc.splitTextToSize((this.formData.description || '').toUpperCase(), pageWidth - margin - 35);
        doc.text(descLines, margin + 35, yPosition);
        yPosition += descLines.length * 5 + 4;
      }

      // ========== REGISTRO DE CERTIFICADO MÉDICO ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('REGISTRO DE CERTIFICADO MÉDICO', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Desde:', margin, yPosition);
      doc.text(this.formatDatePDF(this.formData.fromDate), margin + 18, yPosition);
      
      doc.text('Hasta:', margin + 70, yPosition);
      doc.text(this.formatDatePDF(this.formData.toDate), margin + 88, yPosition);
      yPosition += 6;

      if (!this.areDatesEqual()) {
        doc.text('Días laborables:', margin, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(String(this.formData.workingDays || 0), margin + 35, yPosition);
        
        doc.setFont('helvetica', 'normal');
        doc.text('EQ. Horas:', margin + 70, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(String(this.formData.equivalentHours || 0), margin + 88, yPosition);
        yPosition += 6;
      } else {
        if (this.formData.hours) {
          doc.text('Horas:', margin, yPosition);
          doc.setFont('helvetica', 'bold');
          doc.text(String(this.formData.hours), margin + 18, yPosition);
        }
        if (this.formData.days) {
          doc.setFont('helvetica', 'normal');
          doc.text('Días:', margin + 50, yPosition);
          doc.setFont('helvetica', 'bold');
          doc.text(String(this.formData.days), margin + 68, yPosition);
        }
        yPosition += 6;
      }

      // ENF. GENERAL / ACCIDENTE
      if (this.formData.generalIllness) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('✓ ENF. GENERAL', margin, yPosition);
      }
      if (this.formData.accident) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('✓ ACCIDENTE', margin + 50, yPosition);
      }
      yPosition += 10;

      // ========== INFORMACIÓN DE EMISIÓN ==========
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('INFORMACIÓN DE EMISIÓN', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      if (this.formData.issuingInstitution) {
        doc.text('Institución que emite el certificado:', margin, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text((this.formData.issuingInstitution || '').toUpperCase(), margin + 60, yPosition);
        yPosition += 6;
      }

      if (this.formData.specialtyB) {
        doc.setFont('helvetica', 'normal');
        doc.text('Especialidad "B":', margin, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text((this.formData.specialtyB || '').toUpperCase(), margin + 35, yPosition);
        yPosition += 6;
      }

      if (this.formData.issuingDoctor) {
        doc.setFont('helvetica', 'normal');
        doc.text('Médico que emite el:', margin, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text((this.formData.issuingDoctor || '').toUpperCase(), margin + 40, yPosition);
        yPosition += 6;
      }

      if (this.formData.serviceC) {
        doc.setFont('helvetica', 'normal');
        doc.text('Servicio "C":', margin, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text((this.formData.serviceC || '').toUpperCase(), margin + 30, yPosition);
        yPosition += 6;
      }

      if (this.formData.causes) {
        doc.setFont('helvetica', 'normal');
        doc.text('Causas:', margin, yPosition);
        doc.setFont('helvetica', 'bold');
        const causesLines = doc.splitTextToSize((this.formData.causes || '').toUpperCase(), pageWidth - margin - 20);
        doc.text(causesLines, margin + 20, yPosition);
        yPosition += causesLines.length * 5 + 2;
      }

      // Documento
      if (this.formData.validDocument) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('✓ DOCUMENTO: VALIDO', margin, yPosition);
      } else if (this.formData.invalidDocument) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('✓ DOCUMENTO: NO VALIDO', margin, yPosition);
      }
      yPosition += 6;

      if (this.formData.doctorD) {
        doc.setFont('helvetica', 'normal');
        doc.text('Médico D:', margin, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text((this.currentDoctor?.fullName || '').toUpperCase(), margin + 25, yPosition);
        yPosition += 6;
      }

      // ========== PROVIENE DE INCIDENTE/ACCIDENTE ==========
      if (this.formData.fromIncidentAccident) {
        yPosition += 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('✓ PROVIENE DE UN INCIDENTE/ACCIDENTE', margin, yPosition);
        yPosition += 6;

        if (this.formData.medicalAttentionInfo) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
          const infoHeight = Math.min(30, doc.splitTextToSize((this.formData.medicalAttentionInfo || '').toUpperCase(), pageWidth - (margin * 2) - 4).length * 4);
          doc.rect(margin, yPosition, pageWidth - (margin * 2), infoHeight, 'F');
          
          doc.setTextColor(0, 0, 0);
          const infoLines = doc.splitTextToSize((this.formData.medicalAttentionInfo || '').toUpperCase(), pageWidth - (margin * 2) - 4);
          doc.text(infoLines, margin + 3, yPosition + 5);
          yPosition += infoHeight + 4;
        }
      }

      // ========== FIRMA Y SELLO ==========
      yPosition = pageHeight - 40;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('_________________________', margin + 20, yPosition);
      yPosition += 6;
      doc.setFont('helvetica', 'bold');
      doc.text((this.formData.issuingDoctor || this.currentDoctor?.fullName || 'MÉDICO').toUpperCase(), margin + 20, yPosition, { align: 'center' });
      yPosition += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('MÉDICO TRATANTE', margin + 20, yPosition, { align: 'center' });

      // Guardar PDF
      const fileName = `Certificado_Medico_${this.patientData.identification}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      this.successMessage = 'PDF generado exitosamente';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      console.error('Error generando PDF:', error);
      this.errorMessage = 'Error al generar el PDF: ' + (error.message || 'Error desconocido');
      setTimeout(() => {
        this.errorMessage = '';
      }, 5000);
    }
  }

  formatDatePDF(dateISO: string): string {
    if (!dateISO) return '';
    try {
      const date = new Date(dateISO + 'T00:00:00');
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateISO;
    }
  }

  saveCertificate() {
    if (!this.patientData.id) {
      this.errorMessage = 'Por favor busque un paciente primero';
      return;
    }

    // Proceder directamente a guardar el certificado sin validar CIE-10
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.proceedToSaveCertificate();
  }

  proceedToSaveCertificate() {
    const certificateData = {
      ...this.formData,
      patientId: this.patientData.id,
      identification: this.patientData.identification,
      date: this.formData.date,
      doctorId: this.formData.doctorId,
      company: this.patientData.company,
      position: this.patientData.position,
      workArea: this.patientData.workArea,
      phone: this.patientData.phone,
      address: this.patientData.address
    };

    this.http.post<any>(`${environment.apiUrl}/certificates`, certificateData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Certificado guardado exitosamente';
            this.saving = false;
            
            // Ocultar mensaje de éxito después de un tiempo, pero mantener toda la información
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          } else {
            this.errorMessage = response.message || 'Error al guardar el certificado';
            this.saving = false;
          }
        },
        error: (error) => {
          console.error('Error guardando certificado:', error);
          this.errorMessage = 'Error al guardar: ' + (error.error?.message || 'Error desconocido');
          this.saving = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  downloadHistory() {
    this.http.get(`${environment.apiUrl}/certificates/export/excel`, {
      responseType: 'blob'
    }).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Historial_Certificados_Medicos_${new Date().toISOString().split('T')[0]}.xlsx`;
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
