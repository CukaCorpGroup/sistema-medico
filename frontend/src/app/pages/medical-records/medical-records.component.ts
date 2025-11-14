import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SharedPatientService, SharedPatientData } from '../../core/services/shared-patient.service';
import { VulnerabilityService, Vulnerability } from '../../core/services/vulnerability.service';
import { IncidentsComponent } from '../incidents/incidents.component';
import { AntidopingComponent } from '../antidoping/antidoping.component';
import { CertificatesComponent } from '../certificates/certificates.component';
import { GlovesComponent } from '../gloves/gloves.component';
import { DietComponent } from '../diet/diet.component';
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
  disability?: string;
  vulnerable?: string;
  vulnerableDescription?: string;
  vulnerableReversible?: boolean;
}

interface CIE10 {
  code: string;
  description: string;
  category?: string;
}

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, FormsModule, AntidopingComponent, CertificatesComponent],
  template: `
    <div class="medical-record-page">
      <div class="form-header">
        <button class="btn-back" (click)="goBack()">
          <i class="fas fa-arrow-left"></i> Volver
        </button>
      </div>
      
      <!-- Tabs Navigation -->
      <div class="tabs-container">
        <div class="tabs">
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'medical'"
            (click)="activeTab = 'medical'"
          >
            <i class="fas fa-notes-medical"></i> Registro Médico
          </button>
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'antidoping'"
            (click)="activeTab = 'antidoping'"
          >
            <i class="fas fa-vial"></i> Antidopaje
          </button>
          <button 
            class="tab-button" 
            [class.active]="activeTab === 'certificates'"
            (click)="activeTab = 'certificates'"
          >
            <i class="fas fa-certificate"></i> Certificado Médico
          </button>
        </div>
      </div>
      
      <!-- Tab Content: Medical Record -->
      <div class="form-container" *ngIf="activeTab === 'medical'">
        <h2 class="form-title">Registro de Atención Médica</h2>
        
        <!-- Header Information -->
        <div class="form-section">
          <div class="form-row">
            <div class="form-group">
              <label>Fecha</label>
              <input type="text" [value]="formatDate(formData.date)" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Hora</label>
              <input type="text" [value]="formatTime(formData.time)" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Médico</label>
              <input 
                type="text" 
                [ngModel]="formData.doctor" 
                (ngModelChange)="formData.doctor = $event.toUpperCase()" 
                class="form-control" 
                placeholder="Nombre del médico" 
                style="text-transform: uppercase;"
              />
            </div>
          </div>
        </div>

        <!-- Datos del paciente -->
        <div class="form-section">
          <div class="section-header" (click)="toggleSection('patientData')">
            <h3 class="section-title">Datos del paciente</h3>
            <button type="button" class="btn-toggle" (click)="$event.stopPropagation(); toggleSection('patientData')">
              <i class="fas" [class.fa-chevron-up]="sectionExpanded.patientData" [class.fa-chevron-down]="!sectionExpanded.patientData"></i>
            </button>
          </div>
          <div class="section-content" *ngIf="sectionExpanded.patientData">
          <div class="form-row">
            <div class="form-group">
              <label>Identificación</label>
              <div class="input-with-icon">
              <input 
                type="text" 
                [ngModel]="searchIdentification" 
                (ngModelChange)="onIdentificationChange($event)" 
                class="form-control" 
                placeholder="0901234567"
                (keyup.enter)="searchPatient()"
                style="text-transform: uppercase;"
              />
                <button type="button" class="btn-icon" (click)="searchPatient()">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Empleado</label>
              <input type="text" [(ngModel)]="patientData.fullName" class="form-control" readonly />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Área de Trabajo</label>
              <input type="text" [(ngModel)]="patientData.workArea" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Puesto de Trabajo</label>
              <input type="text" [(ngModel)]="patientData.position" class="form-control" readonly />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Género</label>
              <input type="text" [(ngModel)]="patientData.gender" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input type="text" [(ngModel)]="patientData.phone" class="form-control" readonly />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Empresa</label>
              <input type="text" [(ngModel)]="patientData.company" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Discapacidad</label>
              <input type="text" [(ngModel)]="patientData.disability" class="form-control" readonly placeholder="Descripción de discapacidad" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Vulnerabilidad</label>
              <div class="input-with-icon">
                <input 
                  type="text" 
                  [(ngModel)]="patientData.vulnerableDescription" 
                  class="form-control" 
                  placeholder="Buscar vulnerabilidad..."
                  readonly
                />
                <button type="button" class="btn-icon" (click)="openVulnerabilityModal()">
                  <i class="fas fa-search"></i>
                </button>
            </div>
            </div>
            <div class="form-group">
              <label>¿Es vulnerabilidad reversible?</label>
              <div class="checkbox-group">
                <label>
                  <input type="checkbox" [(ngModel)]="patientData.vulnerableReversible" (ngModelChange)="onVulnerableReversibleChange()" /> Sí
                </label>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group form-group-full">
              <label>Dirección</label>
              <input type="text" [(ngModel)]="patientData.address" class="form-control" readonly />
            </div>
          </div>
          </div>
        </div>

        <!-- Datos de la consulta -->
        <div class="form-section">
          <div class="section-header" (click)="toggleSection('consultationData')">
            <h3 class="section-title">Datos de la consulta</h3>
            <button type="button" class="btn-toggle" (click)="$event.stopPropagation(); toggleSection('consultationData')">
              <i class="fas" [class.fa-chevron-up]="sectionExpanded.consultationData" [class.fa-chevron-down]="!sectionExpanded.consultationData"></i>
            </button>
          </div>
          <div class="section-content" *ngIf="sectionExpanded.consultationData">
          <!-- Lista de consultas -->
          <div class="consultations-list" *ngFor="let consultation of consultations; let i = index">
            <div class="consultation-item">
              <div class="consultation-header">
                <h4 class="consultation-number">Consulta {{ i + 1 }}</h4>
                <button 
                  type="button" 
                  class="btn-remove-consultation" 
                  (click)="removeConsultation(i)"
                  *ngIf="consultations.length > 1"
                  title="Eliminar consulta"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
              
          <div class="form-row">
            <div class="form-group">
              <label>Tipo de Consulta</label>
                  <select [(ngModel)]="consultation.consultType" class="form-control" [name]="'consultType' + i">
                <option value="ATENCIÓN MÉDICA">ATENCIÓN MÉDICA</option>
                <option value="CONSULTA GENERAL">CONSULTA GENERAL</option>
                <option value="CONSULTA ESPECIALIZADA">CONSULTA ESPECIALIZADA</option>
                <option value="EMERGENCIA">EMERGENCIA</option>
              </select>
            </div>
            <div class="form-group">
              <label>CIE-10</label>
              <div class="input-with-icon">
                <input 
                  type="text" 
                      [(ngModel)]="consultation.cie10Code" 
                  class="form-control" 
                  placeholder="J069"
                  readonly
                      [name]="'cie10Code' + i"
                />
                    <button type="button" class="btn-icon" (click)="openCIE10Modal(i)">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group form-group-full">
                  <label>Descripción COD CIE-10</label>
                  <input type="text" [(ngModel)]="consultation.cie10Description" class="form-control" readonly [name]="'cie10Description' + i" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>COD. SEC</label>
                  <div class="input-with-icon">
                    <input 
                      type="text" 
                      [(ngModel)]="consultation.secondaryCode" 
                      (ngModelChange)="consultation.secondaryCode = $event.toUpperCase()"
                      class="form-control" 
                      placeholder="Código secundario"
                      [name]="'secondaryCode' + i"
                      style="text-transform: uppercase;"
                    />
                    <button type="button" class="btn-icon" (click)="openSecondaryCodeModal(i)" title="Buscar código secundario">
                      <i class="fas fa-search"></i>
                    </button>
                  </div>
                </div>
                <div class="form-group form-group-full">
                  <label>Descripción COD. SEC</label>
                  <input 
                    type="text" 
                    [(ngModel)]="consultation.secondaryDescription" 
                    (ngModelChange)="consultation.secondaryDescription = $event.toUpperCase()"
                    class="form-control" 
                    [name]="'secondaryDescription' + i"
                    style="text-transform: uppercase;"
                    placeholder="Descripción del código secundario"
                  />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group form-group-full">
              <label>Causas</label>
              <input 
                type="text" 
                    [ngModel]="consultation.causes" 
                    (ngModelChange)="consultation.causes = $event.toUpperCase();" 
                class="form-control" 
                style="text-transform: uppercase;"
                    [name]="'causes' + i"
              />
            </div>
          </div>

          <!-- Validaciones condicionales -->
          <div class="form-row">
            <div class="form-group">
              <label>Validaciones</label>
              <div class="checkbox-group">
                <label>
                  <input type="checkbox" [(ngModel)]="consultation.isIncident" [name]="'isIncident' + i" /> ¿Es Incidente/Accidente?
                </label>
                <label>
                  <input type="checkbox" [(ngModel)]="consultation.needsGloves" [name]="'needsGloves' + i" /> ¿Requiere Uso de Guantes?
                </label>
                <label>
                  <input type="checkbox" [(ngModel)]="consultation.needsDiet" [name]="'needsDiet' + i" /> ¿Requiere Dieta?
                </label>
                <label>
                  <input type="checkbox" [(ngModel)]="consultation.needsFoodIntake" [name]="'needsFoodIntake' + i" /> ¿Requiere Ingreso de Alimentos?
                </label>
              </div>
            </div>
          </div>

          <!-- Campos de Incidente/Accidente (condicionales) -->
          <div class="form-row" *ngIf="consultation.isIncident">
            <div class="form-group form-group-full">
              <label style="color: #dc2626; font-weight: 600;">INCIDENTE/ACCIDENTE</label>
            </div>
          </div>
          <div class="form-row" *ngIf="consultation.isIncident">
            <div class="form-group">
              <label>Condición</label>
              <input 
                type="text" 
                [(ngModel)]="consultation.incidentCondition" 
                (ngModelChange)="consultation.incidentCondition = $event.toUpperCase()" 
                class="form-control" 
                placeholder="ESTABLE" 
                style="text-transform: uppercase;"
                [name]="'incidentCondition' + i"
              />
            </div>
            <div class="form-group">
              <label>Días de reposo</label>
              <input type="number" [(ngModel)]="consultation.incidentDaysOfRest" class="form-control" min="0" max="99" [name]="'incidentDaysOfRest' + i" />
            </div>
          </div>

          <!-- Campos de Uso de Guantes (condicionales) -->
          <div class="form-row" *ngIf="consultation.needsGloves">
            <div class="form-group form-group-full">
              <label style="color: #dc2626; font-weight: 600;">USO DE GUANTES</label>
            </div>
          </div>
          <div class="form-row" *ngIf="consultation.needsGloves">
            <div class="form-group">
              <label>Desde (Guantes)</label>
              <input type="date" [(ngModel)]="consultation.glovesStartDate" class="form-control" [name]="'glovesStartDate' + i" />
            </div>
            <div class="form-group">
              <label>Hasta (Guantes)</label>
              <input type="date" [(ngModel)]="consultation.glovesEndDate" class="form-control" [name]="'glovesEndDate' + i" />
            </div>
          </div>

          <!-- Campos de Dieta (condicionales) -->
          <div class="form-row" *ngIf="consultation.needsDiet">
            <div class="form-group form-group-full">
              <label style="color: #dc2626; font-weight: 600;">DIETA</label>
            </div>
          </div>

          <!-- Campos de Ingreso de Alimentos (condicionales) -->
          <div class="form-row" *ngIf="consultation.needsFoodIntake">
            <div class="form-group form-group-full">
              <label style="color: #dc2626; font-weight: 600;">INGRESO DE ALIMENTOS</label>
            </div>
          </div>
          <div class="form-row" *ngIf="consultation.needsFoodIntake">
            <div class="form-group">
              <label>
                <input type="checkbox" [(ngModel)]="consultation.indefiniteFoodIntake" (ngModelChange)="onIndefiniteFoodIntakeChange(consultation, i)" [name]="'indefiniteFoodIntake' + i" /> ¿Es ingreso indefinido de alimentos?
              </label>
            </div>
          </div>
          <div class="form-row" *ngIf="consultation.needsFoodIntake">
            <div class="form-group">
              <label>Desde (Ingreso de Alimentos)</label>
              <input type="date" [(ngModel)]="consultation.foodIntakeStartDate" class="form-control" [name]="'foodIntakeStartDate' + i" />
            </div>
            <div class="form-group">
              <label>Hasta (Ingreso de Alimentos)</label>
              <input type="date" [(ngModel)]="consultation.foodIntakeEndDate" class="form-control" [name]="'foodIntakeEndDate' + i" [disabled]="consultation.indefiniteFoodIntake" />
            </div>
          </div>
            </div>
          </div>
          
          <!-- Botón para agregar consulta -->
          <div class="form-row">
            <div class="form-group form-group-full">
              <button type="button" class="btn btn-add-consultation" (click)="addConsultation()">
                <i class="fas fa-plus"></i> Agregar Consulta
              </button>
            </div>
          </div>
          
          <!-- Estado final (común para todas las consultas) -->
          <div class="form-row">
            <div class="form-group">
              <label>Estado final</label>
              <div class="checkbox-group">
                <label>
                  <input type="checkbox" [(ngModel)]="formData.attended" (ngModelChange)="onAttendedChange()" [disabled]="formData.absent" /> ATENDIDO
                </label>
                <label>
                  <input type="checkbox" [(ngModel)]="formData.absent" (ngModelChange)="onAbsentChange()" [disabled]="formData.attended" /> AUSENTE
                </label>
              </div>
            </div>
          </div>
          </div>
        </div>

        <!-- Evolución -->
        <div class="form-section">
          <div class="section-header" (click)="toggleSection('evolution')">
            <h3 class="section-title">Evolución</h3>
            <button type="button" class="btn-toggle" (click)="$event.stopPropagation(); toggleSection('evolution')">
              <i class="fas" [class.fa-chevron-up]="sectionExpanded.evolution" [class.fa-chevron-down]="!sectionExpanded.evolution"></i>
            </button>
          </div>
          <div class="section-content" *ngIf="sectionExpanded.evolution">
          <div class="form-group form-group-full">
            <textarea 
              [ngModel]="formData.diagnosis" 
              (ngModelChange)="formData.diagnosis = $event.toUpperCase(); updateSharedConsultationData();" 
              class="form-control textarea-large" 
              rows="5"
              placeholder="Evolución médica..."
              style="text-transform: uppercase;"
            ></textarea>
          </div>
          </div>
        </div>

        <!-- Datos de atención -->
        <div class="form-section">
          <div class="section-header" (click)="toggleSection('attentionData')">
            <h3 class="section-title">Datos de atención</h3>
            <button type="button" class="btn-toggle" (click)="$event.stopPropagation(); toggleSection('attentionData')">
              <i class="fas" [class.fa-chevron-up]="sectionExpanded.attentionData" [class.fa-chevron-down]="!sectionExpanded.attentionData"></i>
            </button>
          </div>
          <div class="section-content" *ngIf="sectionExpanded.attentionData">
          <div class="form-row">
            <div class="form-group">
              <label>Mensual por código</label>
              <input type="text" [(ngModel)]="attentionData.monthlyByCode" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Contador</label>
              <input type="text" [(ngModel)]="attentionData.counter" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Mensual totales</label>
              <input type="text" [(ngModel)]="attentionData.monthlyTotal" class="form-control" readonly />
            </div>
            <div class="form-group">
              <label>Anual totales</label>
              <input type="text" [(ngModel)]="attentionData.annualTotal" class="form-control" readonly />
            </div>
          </div>
          </div>
        </div>

        <!-- Receta -->
        <div class="form-section">
          <div class="section-header" (click)="toggleSection('prescription')">
            <h3 class="section-title">Receta</h3>
            <button type="button" class="btn-toggle" (click)="$event.stopPropagation(); toggleSection('prescription')">
              <i class="fas" [class.fa-chevron-up]="sectionExpanded.prescription" [class.fa-chevron-down]="!sectionExpanded.prescription"></i>
            </button>
          </div>
          <div class="section-content" *ngIf="sectionExpanded.prescription">
          <div class="form-row">
            <div class="form-group">
              <label>Medicinas a Recetar</label>
            <textarea 
                [ngModel]="formData.prescriptionMedicines" 
                (ngModelChange)="formData.prescriptionMedicines = $event.toUpperCase(); updatePrescription();" 
              class="form-control textarea-large" 
              rows="5"
                placeholder="Medicinas a recetar..."
              style="text-transform: uppercase;"
            ></textarea>
            </div>
            <div class="form-group">
              <label>Indicaciones de Uso</label>
              <textarea 
                [ngModel]="formData.prescriptionInstructions" 
                (ngModelChange)="formData.prescriptionInstructions = $event.toUpperCase(); updatePrescription();" 
                class="form-control textarea-large" 
                rows="5"
                placeholder="Cómo se debe tomar las medicinas..."
                style="text-transform: uppercase;"
              ></textarea>
            </div>
          </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions-top">
          <button type="button" class="btn btn-success" (click)="saveRecord()" [disabled]="saving || !patientData.id">
            <i class="fas fa-spinner fa-spin" *ngIf="saving"></i>
            <i class="fas fa-save" *ngIf="!saving"></i>
            {{ saving ? 'GUARDANDO...' : 'GUARDAR ATEN. MED.' }}
          </button>
          <button type="button" class="btn btn-info" (click)="downloadHistory()">
            <i class="fas fa-file-excel"></i> Descargar Historial
          </button>
          <button type="button" class="btn btn-secondary" (click)="clearFormData()">
            <i class="fas fa-eraser"></i> Borrar datos en pantalla
          </button>
          <button type="button" class="btn btn-secondary" (click)="loadLastData()" [disabled]="consultationHistory.length === 0">
            <i class="fas fa-history"></i> Cargar ultimos datos
          </button>
        </div>

        <!-- Historial de Consultas -->
        <div class="form-section" *ngIf="patientData.id">
          <h3 class="section-title">Historial de Consultas</h3>
          <div class="history-container" *ngIf="!loadingHistory">
            <div class="history-list">
              <div class="history-item" *ngFor="let record of consultationHistory">
                <span class="history-date">{{ formatDateForDisplay(record.date) }}</span>
                <span class="history-doctor">{{ formatDoctorName(record.doctor?.fullName || record.doctorName || 'N/A') }}</span>
                <span class="history-type">{{ (record.consultType || 'ATENCIÓN MÉDICA').toUpperCase() }}</span>
                <span class="history-code">{{ (record.cie10Code || '-').toUpperCase() }}</span>
                <span class="history-description">{{ formatDescription(record) }}</span>
              </div>
              <div class="history-item no-results" *ngIf="consultationHistory.length === 0">
                No hay consultas registradas para este paciente
              </div>
            </div>
          </div>
          <div class="text-center" *ngIf="loadingHistory">
            <i class="fas fa-spinner fa-spin"></i> Cargando historial...
          </div>
        </div>

        <!-- Action Buttons (Receta) -->
        <div class="form-actions">
          <button type="button" class="btn btn-primary" (click)="openEmailModal()">
            <i class="fas fa-envelope"></i> ENVIAR RECETA POR CORREO
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

      <!-- Modal Código Secundario -->
      <div class="modal-overlay" *ngIf="showSecondaryCodeModal" (click)="closeSecondaryCodeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Buscar Código Secundario (COD. SEC)</h3>
            <button type="button" class="btn-close" (click)="closeSecondaryCodeModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="search-box">
              <input 
                type="text" 
                [(ngModel)]="secondaryCodeSearchQuery" 
                (input)="filterSecondaryCode()"
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
                    *ngFor="let code of filteredSecondaryCodeList" 
                    (click)="selectSecondaryCode(code)"
                    class="cie10-row"
                  >
                    <td><strong>{{ code.code }}</strong></td>
                    <td>{{ code.description }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="no-results" *ngIf="filteredSecondaryCodeList.length === 0">
                <p>No se encontraron resultados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Confirmación de Código Secundario Relacionado -->
      <div class="modal-overlay" *ngIf="showSecondaryCodeConfirmationModal" (click)="closeSecondaryCodeConfirmationModal()">
        <div class="modal-content confirmation-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>¿Desea agregar el código secundario relacionado?</h3>
            <button type="button" class="btn-close" (click)="closeSecondaryCodeConfirmationModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="confirmation-message">
              <p>
                <i class="fas fa-info-circle" style="color: #007bff; margin-right: 8px;"></i>
                Este código CIE-10 tiene un código secundario asociado.
              </p>
              <div class="secondary-code-info" *ngIf="pendingSecondaryCode">
                <p><strong>Código Secundario:</strong> {{ pendingSecondaryCode.code }}</p>
                <p><strong>Descripción:</strong> {{ pendingSecondaryCode.description }}</p>
              </div>
              <p class="confirmation-question">
                ¿Desea que se agregue automáticamente este código secundario?
              </p>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-primary" (click)="confirmSecondaryCode()">
                <i class="fas fa-check"></i> Sí, agregar
              </button>
              <button type="button" class="btn btn-secondary" (click)="rejectSecondaryCode()">
                <i class="fas fa-times"></i> No, cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Correo para Receta -->
      <div class="modal-overlay" *ngIf="showEmailModal" (click)="closeEmailModal()">
        <div class="modal-content confirmation-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Enviar Receta por Correo</h3>
            <button type="button" class="btn-close" (click)="closeEmailModal()" [disabled]="sendingEmail">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="confirmation-message">
              <p>
                <i class="fas fa-info-circle" style="color: #007bff; margin-right: 8px;"></i>
                Ingrese el correo electrónico del paciente para enviar la receta médica.
              </p>
              <div class="form-group" style="margin-top: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 600;">Correo Electrónico:</label>
                <input 
                  type="email" 
                  [(ngModel)]="patientEmail" 
                  class="form-control" 
                  placeholder="ejemplo@correo.com"
                  [disabled]="sendingEmail"
                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"
                />
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-primary" (click)="sendPrescriptionByEmail()" [disabled]="sendingEmail || !patientEmail">
                <i class="fas fa-paper-plane" *ngIf="!sendingEmail"></i>
                <i class="fas fa-spinner fa-spin" *ngIf="sendingEmail"></i>
                {{ sendingEmail ? 'Enviando...' : 'Enviar Receta' }}
              </button>
              <button type="button" class="btn btn-secondary" (click)="closeEmailModal()" [disabled]="sendingEmail">
                <i class="fas fa-times"></i> Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Vulnerabilidades -->
      <div class="modal-overlay" *ngIf="showVulnerabilityModal" (click)="closeVulnerabilityModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Buscar Vulnerabilidad</h3>
            <button type="button" class="btn-close" (click)="closeVulnerabilityModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="search-box">
              <input 
                type="text" 
                [(ngModel)]="vulnerabilitySearchQuery" 
                (input)="filterVulnerability()"
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
                    *ngFor="let vuln of filteredVulnerabilityList" 
                    (click)="selectVulnerability(vuln)"
                    class="cie10-row"
                  >
                    <td><strong>{{ vuln.code }}</strong></td>
                    <td>{{ vuln.description }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="no-results" *ngIf="filteredVulnerabilityList.length === 0">
                <p>No se encontraron resultados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      

      <!-- Tab Content: Antidoping -->
      <div *ngIf="activeTab === 'antidoping'">
        <app-antidoping></app-antidoping>
      </div>
      
      <!-- Tab Content: Certificates -->
      <div *ngIf="activeTab === 'certificates'">
        <app-certificates></app-certificates>
      </div>
    </div>
  `,
  styles: [`
    .tabs-container {
      max-width: 1400px;
      margin: 0 auto 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .tabs {
      display: flex;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .tab-button {
      flex: 1;
      padding: 15px 20px;
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 500;
      color: #64748b;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .tab-button:hover {
      background: #f8fafc;
      color: #334155;
    }
    
    .tab-button.active {
      color: #667eea;
      border-bottom-color: #667eea;
      background: #f8fafc;
    }
    
    .tab-button i {
      font-size: 1rem;
    }
    .medical-record-page {
      min-height: 100vh;
      background: #f5f7fa;
      padding: 20px;
    }

    .form-header {
      max-width: 1400px;
      margin: 0 auto 20px;
    }

    .btn-back {
      background: #667eea;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-back:hover {
      background: #5568d3;
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
    }

    .form-section {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    .form-section:last-of-type {
      border-bottom: none;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
      cursor: pointer;
    }

    .section-header:hover {
      border-bottom-color: #5568d3;
    }

    .section-title {
      color: #1e293b;
      font-size: 1.2rem;
      font-weight: 600;
      margin: 0;
      flex: 1;
    }

    .btn-toggle {
      background: transparent;
      border: none;
      color: #667eea;
      font-size: 1.2rem;
      padding: 5px 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 4px;
    }

    .btn-toggle:hover {
      background: #f1f5f9;
      color: #5568d3;
    }

    .btn-toggle:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .section-content {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
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

    .checkbox-group label input[type="checkbox"]:disabled {
      cursor: not-allowed;
      opacity: 0.5;
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

    .textarea-large {
      min-height: 120px;
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

    .form-actions-top {
      display: flex;
      gap: 15px;
      margin-top: 30px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
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

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

    .btn-success:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

    .btn-info:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #64748b;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #475569;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3);
    }

    .btn-secondary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .form-actions .btn-primary:first-child {
      background: #dc2626;
    }

    .form-actions .btn-primary:first-child:hover {
      background: #b91c1c;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
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

    .confirmation-modal {
      max-width: 500px;
    }

    .confirmation-message {
      padding: 20px 0;
      text-align: center;
    }

    .confirmation-message p {
      margin: 10px 0;
      font-size: 14px;
      color: #333;
    }

    .confirmation-question {
      font-weight: 600;
      font-size: 16px;
      margin-top: 20px !important;
      color: #007bff !important;
    }

    .secondary-code-info {
      background: #f8f9fa;
      border-left: 4px solid #007bff;
      padding: 15px;
      margin: 15px 0;
      text-align: left;
      border-radius: 4px;
    }

    .secondary-code-info p {
      margin: 8px 0;
      font-size: 14px;
    }

    .secondary-code-info strong {
      color: #007bff;
      margin-right: 8px;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      padding: 20px 0 10px;
    }

    .modal-actions .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
    }

    .modal-actions .btn-primary {
      background: #007bff;
      color: white;
    }

    .modal-actions .btn-primary:hover {
      background: #0056b3;
    }

    .modal-actions .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .modal-actions .btn-secondary:hover {
      background: #545b62;
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

    .cie10-row:active {
      background-color: #e2e8f0;
    }

    .no-results {
      padding: 40px;
      text-align: center;
      color: #64748b;
    }

    /* Estilos para tabla de historial */
    .history-container {
      margin-top: 20px;
    }

    .history-table-wrapper {
      overflow-x: auto;
      overflow-y: auto;
      max-height: 400px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .history-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      font-size: 0.9rem;
    }

    .history-table thead {
      background: #f1f5f9;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .history-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #334155;
      border-bottom: 2px solid #e2e8f0;
      white-space: nowrap;
    }

    .history-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #475569;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .history-table tbody tr:hover {
      background: #f8fafc;
    }

    .history-table tbody tr:last-child td {
      border-bottom: none;
    }

    .text-center {
      text-align: center;
      padding: 20px;
      color: #64748b;
    }

    /* Estilos para lista de historial */
    .history-container {
      margin-top: 20px;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 0;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      background: white;
    }

    .history-item {
      display: flex;
      align-items: center;
      padding: 12px 15px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.9rem;
      color: #334155;
      background: white;
      gap: 15px;
    }

    .history-item:last-child {
      border-bottom: none;
    }

    .history-item:hover {
      background: #f8fafc;
    }

    .history-date {
      min-width: 100px;
      font-weight: 500;
      color: #1e293b;
    }

    .history-doctor {
      min-width: 150px;
      font-weight: 500;
      color: #1e293b;
      text-transform: uppercase;
    }

    .history-type {
      min-width: 150px;
      color: #475569;
      text-transform: uppercase;
    }

    .history-code {
      min-width: 80px;
      font-weight: 600;
      color: #667eea;
      text-transform: uppercase;
    }

    .history-description {
      flex: 1;
      color: #475569;
      text-transform: uppercase;
    }

    .history-item.no-results {
      padding: 20px;
      text-align: center;
      color: #64748b;
      font-style: italic;
    }

    .btn i {
      margin-right: 8px;
    }

    /* Estilos para consultas múltiples */
    .consultations-list {
      margin-bottom: 20px;
    }

    .consultation-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
    }

    .consultation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #cbd5e1;
    }

    .consultation-number {
      margin: 0;
      color: #1e293b;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .btn-remove-consultation {
      background: #ef4444;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }

    .btn-remove-consultation:hover {
      background: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
    }

    .btn-add-consultation {
      background: #10b981;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s;
      width: 100%;
      justify-content: center;
    }

    .btn-add-consultation:hover {
      background: #059669;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-add-consultation i {
      margin-right: 0;
    }
  `]
})
export class MedicalRecordsComponent implements OnInit {
  activeTab: 'medical' | 'antidoping' | 'certificates' = 'medical';
  searchIdentification = '';
  patientData: Partial<Patient> = {};
  private searchTimeout: any = null;
  
  formData = {
    date: '',
    time: '',
    doctor: '',
    attended: false,
    absent: false,
    diagnosis: '',
    prescription: '',
    prescriptionMedicines: '',
    prescriptionInstructions: ''
  };

  consultations: Array<{
    consultType: string;
    cie10Code: string;
    cie10Description: string;
    secondaryCode: string;
    secondaryDescription: string;
    causes: string;
    isIncident: boolean;
    needsGloves: boolean;
    needsDiet: boolean;
    needsFoodIntake: boolean;
    indefiniteFoodIntake: boolean;
    glovesStartDate: string;
    glovesEndDate: string;
    dietStartDate: string;
    dietEndDate: string;
    foodIntakeStartDate: string;
    foodIntakeEndDate: string;
    incidentCondition?: string;
    incidentDaysOfRest?: number;
  }> = [
    {
    consultType: 'ATENCIÓN MÉDICA',
    cie10Code: '',
    cie10Description: '',
      secondaryCode: '',
      secondaryDescription: '',
      causes: '',
      isIncident: false,
      needsGloves: false,
      needsDiet: false,
      needsFoodIntake: false,
      indefiniteFoodIntake: false,
      glovesStartDate: '',
      glovesEndDate: '',
      dietStartDate: '',
      dietEndDate: '',
      foodIntakeStartDate: '',
      foodIntakeEndDate: '',
      incidentCondition: 'ESTABLE',
      incidentDaysOfRest: 0
    }
  ];

  attentionData = {
    monthlyByCode: 'NUEVO',
    counter: '0',
    monthlyTotal: '0',
    annualTotal: '0'
  };

  saving = false;
  successMessage = '';
  errorMessage = '';

  // Modal CIE-10
  showCIE10Modal = false;
  currentCIE10Index = 0; // Índice de la consulta actual para CIE-10
  cie10SearchQuery = '';
  cie10List: CIE10[] = [];
  filteredCIE10List: CIE10[] = [];

  // Modal Código Secundario
  showSecondaryCodeModal = false;
  currentSecondaryCodeIndex = 0; // Índice de la consulta actual para COD. SEC
  secondaryCodeSearchQuery = '';
  secondaryCodeList: CIE10[] = [];
  filteredSecondaryCodeList: CIE10[] = [];

  // Modal de confirmación de código secundario relacionado
  showSecondaryCodeConfirmationModal = false;
  pendingSecondaryCode: { code: string; description: string } | null = null;
  pendingCIE10Index = 0;

  // Modal de correo para receta
  showEmailModal = false;
  patientEmail = '';
  sendingEmail = false;


  // Vulnerabilidades
  showVulnerabilityModal = false;
  vulnerabilitySearchQuery = '';
  vulnerabilityList: Vulnerability[] = [];
  filteredVulnerabilityList: Vulnerability[] = [];

  // Historial de consultas
  consultationHistory: any[] = [];
  loadingHistory = false;

  // Control de secciones expandibles
  sectionExpanded = {
    patientData: true,
    consultationData: true,
    evolution: true,
    attentionData: true,
    prescription: true
  };


  toggleSection(section: string) {
    this.sectionExpanded[section as keyof typeof this.sectionExpanded] = 
      !this.sectionExpanded[section as keyof typeof this.sectionExpanded];
  }

  constructor(
    private http: HttpClient,
    private router: Router,
    private sharedPatientService: SharedPatientService,
    private vulnerabilityService: VulnerabilityService
  ) {}

  ngOnInit() {
    // Inicializar fecha y hora actual (bloqueadas en el momento de entrada)
    const now = new Date();
    
    // Formato de fecha: YYYY-MM-DD
    this.formData.date = now.toISOString().split('T')[0];
    
    // Formato de hora: HH:mm (24 horas para el input type="time", pero se muestra como readonly)
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.formData.time = `${hours}:${minutes}`;
    
    // Obtener nombre del médico del usuario logueado
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.formData.doctor = user.fullName || user.username || '';
    }

    // NO cargar automáticamente los datos compartidos al iniciar
    // Los campos deben estar vacíos para que el usuario los llene
    // Los datos compartidos solo se usarán cuando el usuario busque un paciente
  }

  loadSharedPatientData(sharedPatient: any) {
    // Este método NO se usa al iniciar el módulo
    // Los campos deben estar vacíos para que el usuario los llene manualmente
    // Solo se usa cuando el usuario busca un paciente específico
  }

  onIdentificationChange(value: string) {
    // Convertir a mayúsculas
    this.searchIdentification = value.toUpperCase();
    
    // Limpiar timeout anterior si existe
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
    
    // Si el valor es diferente al paciente actual y tiene al menos 10 caracteres, buscar automáticamente
    const currentIdentification = this.patientData.identification || '';
    if (this.searchIdentification !== currentIdentification && this.searchIdentification.length >= 10) {
      // Delay para evitar búsquedas mientras el usuario está escribiendo
      this.searchTimeout = setTimeout(() => {
        // Verificar que el valor no haya cambiado durante el delay
        if (this.searchIdentification === value.toUpperCase() && this.searchIdentification.length >= 10) {
          this.searchPatient();
        }
        this.searchTimeout = null;
      }, 800);
    } else if (this.searchIdentification !== currentIdentification && this.searchIdentification.length === 0) {
      // Si se borra la cédula, limpiar los datos del paciente
      this.patientData = {};
      this.sharedPatientService.clearPatientData();
      this.consultationHistory = [];
    }
  }

  searchPatient() {
    if (!this.searchIdentification) {
      this.errorMessage = 'Por favor ingrese una identificación';
      return;
    }

    this.http.get<any>(`${environment.apiUrl}/patients/search`, {
      params: { identification: this.searchIdentification }
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const patient = response.data;
          
          // Discapacidad y vulnerabilidad ahora son campos de texto con descripción
          this.patientData = {
            ...patient,
            fullName: `${patient.firstName} ${patient.lastName}`.trim(),
            disability: patient.disability || '', // Mantener como texto (descripción)
            vulnerableDescription: patient.vulnerableDescription || '', // Descripción de vulnerabilidad desde lista maestra
            vulnerableReversible: patient.vulnerableReversible || false // Checkbox de vulnerabilidad reversible
          };
          
          // Guardar información del paciente en el servicio compartido
          const sharedData: SharedPatientData = {
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
            vulnerable: patient.vulnerable || '',
            vulnerableDescription: patient.vulnerableDescription || '',
            vulnerableReversible: patient.vulnerableReversible || false
          };
          this.sharedPatientService.setPatientData(sharedData);
          
          // Limpiar datos del formulario cuando se busca un nuevo paciente
          this.clearFormData(false);
          
          // NO cargar automáticamente los datos de consulta previa
          // Los campos de consulta (CIE-10, causas, evolución, prescripción) deben estar vacíos
          // para que el usuario los llene manualmente
          
          this.errorMessage = '';
          // Cargar historial del paciente
          this.loadConsultationHistory();
        } else {
          this.errorMessage = 'Paciente no encontrado';
          this.patientData = {};
          this.consultationHistory = [];
        }
      },
      error: (error) => {
        console.error('Error buscando paciente:', error);
        this.errorMessage = 'Error al buscar paciente: ' + (error.error?.message || 'Error desconocido');
        this.patientData = {};
        this.consultationHistory = [];
      }
    });
  }

  loadConsultationHistory() {
    if (!this.patientData.id) {
      this.consultationHistory = [];
      return;
    }

    this.loadingHistory = true;
    this.http.get<any>(`${environment.apiUrl}/medical-records`, {
      params: { patientId: this.patientData.id.toString() }
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.consultationHistory = response.data || [];
        }
        this.loadingHistory = false;
      },
      error: (error) => {
        console.error('Error cargando historial:', error);
        this.consultationHistory = [];
        this.loadingHistory = false;
      }
    });
  }

  clearFormData(clearMessages: boolean = false, keepPatientData: boolean = true) {
    // Resetear solo los campos del formulario, mantener fecha y hora actual
    const now = new Date();
    this.formData.date = now.toISOString().split('T')[0];
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.formData.time = `${hours}:${minutes}`;
    
    // Resetear consultas a una sola consulta vacía
    this.consultations = [{
      consultType: 'ATENCIÓN MÉDICA',
      cie10Code: '',
      cie10Description: '',
      secondaryCode: '',
      secondaryDescription: '',
      causes: '',
      isIncident: false,
      needsGloves: false,
      needsDiet: false,
      needsFoodIntake: false,
      indefiniteFoodIntake: false,
      glovesStartDate: '',
      glovesEndDate: '',
      dietStartDate: '',
      dietEndDate: '',
      foodIntakeStartDate: '',
      foodIntakeEndDate: '',
      incidentCondition: 'ESTABLE',
      incidentDaysOfRest: 0
    }];
    
    this.formData.attended = false;
    this.formData.absent = false;
    this.formData.diagnosis = '';
    this.formData.prescription = '';
    this.formData.prescriptionMedicines = '';
    this.formData.prescriptionInstructions = '';
    
    // Limpiar datos compartidos de consulta (pero mantener datos del paciente si se indica)
    if (keepPatientData) {
      const currentShared = this.sharedPatientService.getPatientData();
      if (currentShared) {
        const clearedShared: SharedPatientData = {
          ...currentShared,
          cie10Code: undefined,
          cie10Description: undefined,
          secondaryCode: undefined,
          secondaryDescription: undefined,
          causes: undefined,
          diagnosis: undefined,
          prescription: undefined,
          prescriptionMedicines: undefined,
          prescriptionInstructions: undefined
        };
        this.sharedPatientService.setPatientData(clearedShared);
      }
    }
    
    if (clearMessages) {
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  loadLastData() {
    if (this.consultationHistory.length === 0) {
      this.errorMessage = 'No hay datos previos para cargar';
      return;
    }

    const lastRecord = this.consultationHistory[0]; // El más reciente

    // Actualizar fecha y hora actual
    const now = new Date();
    this.formData.date = now.toISOString().split('T')[0];
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.formData.time = `${hours}:${minutes}`;

    // Cargar datos del último registro en la primera consulta
    this.consultations = [{
      consultType: lastRecord.consultType || 'ATENCIÓN MÉDICA',
      cie10Code: lastRecord.cie10Code || '',
      cie10Description: lastRecord.cie10Description || '',
      secondaryCode: lastRecord.secondaryCode || '',
      secondaryDescription: lastRecord.secondaryDescription || '',
      causes: lastRecord.causes || '',
      isIncident: false,
      needsGloves: false,
      needsDiet: false,
      needsFoodIntake: false,
      indefiniteFoodIntake: false,
      glovesStartDate: '',
      glovesEndDate: '',
      dietStartDate: '',
      dietEndDate: '',
      foodIntakeStartDate: '',
      foodIntakeEndDate: '',
      incidentCondition: 'ESTABLE',
      incidentDaysOfRest: 0
    }];

    // Convertir finalStatus a checkboxes
    if (lastRecord.finalStatus === 'ATENDIDO') {
      this.formData.attended = true;
      this.formData.absent = false;
    } else if (lastRecord.finalStatus === 'AUSENTE') {
      this.formData.attended = false;
      this.formData.absent = true;
    } else {
      this.formData.attended = false;
      this.formData.absent = false;
    }
    this.formData.diagnosis = lastRecord.diagnosis || '';
    
    // Manejar receta: si viene separada o combinada
    if (lastRecord.prescriptionMedicines && lastRecord.prescriptionInstructions) {
      this.formData.prescriptionMedicines = lastRecord.prescriptionMedicines;
      this.formData.prescriptionInstructions = lastRecord.prescriptionInstructions;
      this.updatePrescription();
    } else if (lastRecord.prescription) {
      // Intentar separar el campo combinado si tiene el formato MEDICINAS:/INDICACIONES:
      const prescriptionText = lastRecord.prescription;
      if (prescriptionText.includes('MEDICINAS:') && prescriptionText.includes('INDICACIONES:')) {
        const parts = prescriptionText.split('INDICACIONES:');
        const medicinesPart = parts[0].replace('MEDICINAS:', '').trim();
        const instructionsPart = parts[1]?.trim() || '';
        this.formData.prescriptionMedicines = medicinesPart;
        this.formData.prescriptionInstructions = instructionsPart;
      } else {
        // Si no tiene formato separado, poner todo en medicinas
        this.formData.prescriptionMedicines = prescriptionText;
        this.formData.prescriptionInstructions = '';
      }
      this.updatePrescription();
    } else {
      this.formData.prescriptionMedicines = '';
      this.formData.prescriptionInstructions = '';
      this.formData.prescription = '';
    }

    this.successMessage = 'Últimos datos cargados exitosamente';
  }

  formatDateForDisplay(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatDoctorName(name: string): string {
    if (!name || name === 'N/A') return 'N/A';
    // Asegurar que tenga el prefijo "DR." si no lo tiene
    const upperName = name.toUpperCase().trim();
    if (upperName.startsWith('DR.')) {
      return upperName;
    }
    return `DR. ${upperName}`;
  }

  formatDescription(record: any): string {
    let description = '';
    
    // Si hay causa ACCIDENTE o INCIDENTE, formatear como "INCIDENTE G1 - TORAX" o "ACCIDENTE G1 - TORAX"
    if (record.causes === 'ACCIDENTE' || record.causes === 'INCIDENTE') {
      description = record.causes;
      
      // Si hay descripción CIE-10, agregarla después
      if (record.cie10Description) {
        // Extraer solo la parte relevante de la descripción (sin el sufijo "- ACCIDENTE LABORAL" o "- INCIDENTE LABORAL")
        let cieDesc = record.cie10Description;
        cieDesc = cieDesc.replace(/\s*-\s*ACCIDENTE\s*LABORAL/gi, '');
        cieDesc = cieDesc.replace(/\s*-\s*INCIDENTE\s*LABORAL/gi, '');
        cieDesc = cieDesc.trim();
        
        if (cieDesc) {
          // Si la descripción contiene información adicional, agregarla
          // Formato: "INCIDENTE G1 - TORAX" o similar
          description += ` ${cieDesc}`;
        }
      }
    } else if (record.cie10Description) {
      // Si no hay causa especial, usar solo la descripción CIE-10
      description = record.cie10Description;
    } else {
      description = '-';
    }
    
    return description.toUpperCase();
  }

  addConsultation() {
    this.consultations.push({
      consultType: 'ATENCIÓN MÉDICA',
      cie10Code: '',
      cie10Description: '',
      secondaryCode: '',
      secondaryDescription: '',
      causes: '',
      isIncident: false,
      needsGloves: false,
      needsDiet: false,
      needsFoodIntake: false,
      indefiniteFoodIntake: false,
      glovesStartDate: '',
      glovesEndDate: '',
      dietStartDate: '',
      dietEndDate: '',
      foodIntakeStartDate: '',
      foodIntakeEndDate: '',
      incidentCondition: 'ESTABLE',
      incidentDaysOfRest: 0
    });
  }

  removeConsultation(index: number) {
    if (this.consultations.length > 1) {
      this.consultations.splice(index, 1);
    }
  }

  onIndefiniteFoodIntakeChange(consultation: any, index: number) {
    if (consultation.indefiniteFoodIntake) {
      // Si se marca como indefinido, limpiar solo la fecha "Hasta"
      consultation.foodIntakeEndDate = '';
    }
  }

  openCIE10Modal(index: number) {
    this.currentCIE10Index = index;
    this.showCIE10Modal = true;
    this.cie10SearchQuery = '';
    
    // Siempre recargar los códigos CIE-10 para obtener los más recientes
      this.http.get<any>(`${environment.apiUrl}/cie10`, {
        params: { page: '1', limit: '1000' }
      }).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.cie10List = response.data;
            this.filteredCIE10List = this.cie10List;
          }
        },
        error: (error) => {
          console.error('Error cargando CIE-10:', error);
          this.errorMessage = 'Error al cargar códigos CIE-10';
        }
      });
  }

  closeCIE10Modal() {
    this.showCIE10Modal = false;
    this.cie10SearchQuery = '';
  }

  filterCIE10() {
    const query = this.cie10SearchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredCIE10List = this.cie10List;
      return;
    }

    this.filteredCIE10List = this.cie10List.filter(code => 
      code.code.toLowerCase().includes(query) ||
      code.description.toLowerCase().includes(query)
    );
  }

  selectCIE10(code: CIE10) {
    const consultation = this.consultations[this.currentCIE10Index];
    consultation.cie10Code = code.code;
    consultation.cie10Description = code.description;
    
    // Si la categoría es INCIDENTE o ACCIDENTE, usar esa como causa, sino usar la descripción
    if (code.category === 'INCIDENTE' || code.category === 'ACCIDENTE') {
      consultation.causes = code.category;
    } else {
      consultation.causes = code.description || '';
    }
    
    this.closeCIE10Modal();
    
    // Generar código secundario relacionado al CIE-10 seleccionado y mostrar modal de confirmación
    this.checkAndGenerateSecondaryCode(code, this.currentCIE10Index);
  }

  checkAndGenerateSecondaryCode(cie10: CIE10, consultationIndex: number) {
    // Si ya tiene código secundario, no generar
    if (this.consultations[consultationIndex].secondaryCode) {
      return;
    }

    // Generar código secundario basado en el patrón: INC-[CIE10]-[ID]
    const secondaryCode = this.generateSecondaryCode(cie10.code);
    const secondaryDescription = this.generateSecondaryDescription(cie10);

    // Mostrar modal de confirmación
    this.pendingSecondaryCode = {
      code: secondaryCode,
      description: secondaryDescription
    };
    this.pendingCIE10Index = consultationIndex;
    this.showSecondaryCodeConfirmationModal = true;
  }

  confirmSecondaryCode() {
    if (this.pendingSecondaryCode && this.consultations[this.pendingCIE10Index]) {
      this.consultations[this.pendingCIE10Index].secondaryCode = this.pendingSecondaryCode.code;
      this.consultations[this.pendingCIE10Index].secondaryDescription = this.pendingSecondaryCode.description;
    }
    this.closeSecondaryCodeConfirmationModal();
  }

  rejectSecondaryCode() {
    this.closeSecondaryCodeConfirmationModal();
  }

  closeSecondaryCodeConfirmationModal() {
    this.showSecondaryCodeConfirmationModal = false;
    this.pendingSecondaryCode = null;
    this.pendingCIE10Index = 0;
  }

  generateSecondaryCode(cie10Code: string): string {
    if (!cie10Code) return '';
    
    // Generar código secundario con formato relacionado al código CIE-10
    // Formato basado en el ejemplo: INC-J03-2511
    // Extraer parte del código CIE-10 (ej: J03 de J03.9)
    const cie10Parts = cie10Code.split(/[.-]/);
    const cie10Base = cie10Parts[0] || cie10Code.substring(0, 3);
    
    // Generar número único basado en timestamp (últimos 4 dígitos)
    // Esto asegura que cada código secundario sea único
    const timestamp = Date.now();
    const uniqueId = timestamp.toString().slice(-4);
    
    // Determinar prefijo basado en la categoría o tipo
    // Por defecto usar INC para incidentes/accidentes
    const prefix = 'INC';
    
    // Formato: INC-[CIE10]-[ID único de 4 dígitos]
    // Ejemplo: INC-J03-2511
    return `${prefix}-${cie10Base.toUpperCase()}-${uniqueId}`;
  }

  generateSecondaryDescription(cie10: CIE10): string {
    if (!cie10) return '';
    
    // Generar descripción secundaria basada en el CIE-10
    // Formato: "INCIDENTE RELACIONADO A [DESCRIPCIÓN CIE-10]"
    if (cie10.category === 'INCIDENTE' || cie10.category === 'ACCIDENTE') {
      return `INCIDENTE RELACIONADO A ${cie10.description.toUpperCase()}`;
    }
    return `RELACIONADO A ${cie10.description.toUpperCase()}`;
  }

  openSecondaryCodeModal(index: number) {
    this.currentSecondaryCodeIndex = index;
    this.showSecondaryCodeModal = true;
    this.secondaryCodeSearchQuery = '';
    
    // Cargar códigos CIE-10 para usar como códigos secundarios
    this.http.get<any>(`${environment.apiUrl}/cie10`, {
      params: { page: '1', limit: '1000' }
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.secondaryCodeList = response.data;
          this.filteredSecondaryCodeList = this.secondaryCodeList;
        }
      },
      error: (error) => {
        console.error('Error cargando códigos secundarios:', error);
        this.errorMessage = 'Error al cargar códigos secundarios';
      }
    });
  }

  closeSecondaryCodeModal() {
    this.showSecondaryCodeModal = false;
    this.secondaryCodeSearchQuery = '';
  }

  filterSecondaryCode() {
    const query = this.secondaryCodeSearchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredSecondaryCodeList = this.secondaryCodeList;
      return;
    }

    this.filteredSecondaryCodeList = this.secondaryCodeList.filter(code => 
      code.code.toLowerCase().includes(query) ||
      code.description.toLowerCase().includes(query)
    );
  }

  selectSecondaryCode(code: CIE10) {
    const consultation = this.consultations[this.currentSecondaryCodeIndex];
    consultation.secondaryCode = code.code;
    consultation.secondaryDescription = code.description;
    
    this.closeSecondaryCodeModal();
  }

  updatePrescription() {
    // Combinar medicinas e indicaciones en el campo prescription para compatibilidad
    const medicines = this.formData.prescriptionMedicines || '';
    const instructions = this.formData.prescriptionInstructions || '';
    
    if (medicines && instructions) {
      this.formData.prescription = `MEDICINAS:\n${medicines}\n\nINDICACIONES:\n${instructions}`;
    } else if (medicines) {
      this.formData.prescription = `MEDICINAS:\n${medicines}`;
    } else if (instructions) {
      this.formData.prescription = `INDICACIONES:\n${instructions}`;
    } else {
      this.formData.prescription = '';
    }
    
    this.updateSharedConsultationData();
  }

  updateSharedConsultationData() {
    const currentShared = this.sharedPatientService.getPatientData();
    if (currentShared && this.consultations.length > 0) {
      const firstConsultation = this.consultations[0];
      const updatedShared: SharedPatientData = {
        ...currentShared,
        cie10Code: firstConsultation.cie10Code || undefined,
        cie10Description: firstConsultation.cie10Description || undefined,
        secondaryCode: firstConsultation.secondaryCode || undefined,
        secondaryDescription: firstConsultation.secondaryDescription || undefined,
        causes: firstConsultation.causes || undefined,
        diagnosis: this.formData.diagnosis || undefined,
        prescription: this.formData.prescription || undefined,
        prescriptionMedicines: this.formData.prescriptionMedicines || undefined,
        prescriptionInstructions: this.formData.prescriptionInstructions || undefined
      };
      this.sharedPatientService.setPatientData(updatedShared);
    }
  }

  formatDate(dateISO: string): string {
    if (!dateISO) return '';
    const date = new Date(dateISO);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  formatTime(time24: string): string {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  }

  openEmailModal() {
    // Validar que haya datos necesarios
    if (!this.patientData.fullName) {
      this.errorMessage = 'Por favor busque un paciente primero';
      return;
    }

    if (!this.formData.prescriptionMedicines && !this.formData.prescriptionInstructions && !this.formData.prescription) {
      this.errorMessage = 'No hay contenido de receta para generar el PDF';
      return;
    }

    this.errorMessage = '';
    this.patientEmail = '';
    this.showEmailModal = true;
  }

  closeEmailModal() {
    if (!this.sendingEmail) {
      this.showEmailModal = false;
      this.patientEmail = '';
    }
  }

  sendPrescriptionByEmail() {
    if (!this.patientEmail || !this.patientEmail.trim()) {
      this.errorMessage = 'Por favor ingrese un correo electrónico válido';
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.patientEmail)) {
      this.errorMessage = 'Por favor ingrese un correo electrónico válido';
      return;
    }

    this.sendingEmail = true;
    this.errorMessage = '';

    try {
      // Generar PDF y enviarlo por correo
      const pdfBlob = this.generatePrescriptionPDF();
      const fileName = `Receta_${this.patientData.identification || 'N/A'}_${this.formData.date.replace(/-/g, '')}.pdf`;

      // Crear FormData para enviar al backend
      const formData = new FormData();
      formData.append('email', this.patientEmail.trim());
      formData.append('patientName', this.patientData.fullName || '');
      formData.append('patientIdentification', this.patientData.identification || this.searchIdentification);
      formData.append('pdf', pdfBlob, fileName);

      this.http.post<any>(`${environment.apiUrl}/medical-records/send-prescription-email`, formData)
        .subscribe({
          next: (response) => {
            this.sendingEmail = false;
            if (response.success) {
              this.successMessage = 'Receta enviada por correo exitosamente';
              this.closeEmailModal();
              setTimeout(() => {
                this.successMessage = '';
              }, 5000);
            } else {
              this.errorMessage = response.message || 'Error al enviar la receta por correo';
            }
          },
          error: (error) => {
            this.sendingEmail = false;
            console.error('Error enviando receta por correo:', error);
            if (error.error && error.error.message) {
              this.errorMessage = error.error.message;
            } else {
              this.errorMessage = 'Error al enviar la receta por correo. Verifique la configuración del servidor de correo.';
            }
          }
        });
    } catch (error: any) {
      this.sendingEmail = false;
      console.error('Error generando PDF:', error);
      this.errorMessage = 'Error al generar el PDF de la receta';
    }
  }

  generatePrescriptionPDF(): Blob {
    // Crear PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configuración
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Función helper para agregar texto con wrap
    const addText = (text: string, fontSize: number, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }

      const lines = doc.splitTextToSize(text, maxWidth);
      
      (lines as string[]).forEach((line: string) => {
        if (yPosition > 270) { // Nueva página si es necesario
          doc.addPage();
          yPosition = margin;
        }

        if (align === 'center') {
          doc.text(line, pageWidth / 2, yPosition, { align: 'center' });
        } else if (align === 'right') {
          doc.text(line, pageWidth - margin, yPosition, { align: 'right' });
        } else {
          doc.text(line, margin, yPosition);
        }
        
        yPosition += fontSize * 0.5;
      });
    };

    // Encabezado
    addText('MARBELIZE S.A.', 16, true, 'center');
    yPosition += 5;
    addText('Portal de Atención Médica', 12, false, 'center');
    yPosition += 5;
    addText('RECETA MÉDICA', 14, true, 'center');
    yPosition += 10;

    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Datos del paciente
    addText('DATOS DEL PACIENTE', 12, true);
    yPosition += 2;
    addText(`Paciente: ${this.patientData.fullName}`, 10);
    addText(`Identificación: ${this.patientData.identification || this.searchIdentification}`, 10);
    addText(`Género: ${this.patientData.gender || 'N/A'}`, 10);
    addText(`Empresa: ${this.patientData.company || 'Marbelize S.A.'}`, 10);
    yPosition += 5;

    // Información de la consulta
    addText('INFORMACIÓN DE LA CONSULTA', 12, true);
    yPosition += 2;
    addText(`Fecha: ${this.formatDate(this.formData.date)}`, 10);
    addText(`Hora: ${this.formatTime(this.formData.time)}`, 10);
    addText(`Médico: ${this.formData.doctor || 'No especificado'}`, 10);
    
    // Mostrar información de las consultas
    this.consultations.forEach((consultation, index) => {
      if (consultation.cie10Code) {
        addText(`Consulta ${index + 1} - CIE-10: ${consultation.cie10Code} - ${consultation.cie10Description || ''}`, 10);
        if (consultation.secondaryCode) {
          addText(`COD. SEC: ${consultation.secondaryCode} - ${consultation.secondaryDescription || ''}`, 10);
        }
      }
    });
    
    yPosition += 5;

    // Línea separadora
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    // Título RECETA
    addText('RECETA MÉDICA', 12, true, 'center');
    yPosition += 8;

    // Contenido de la receta dividido en dos columnas
    const columnWidth = (pageWidth - (margin * 3)) / 2; // Ancho de cada columna (con espacio entre ellas)
    const leftColumnX = margin;
    const rightColumnX = margin + columnWidth + margin;
    let maxYPosition = yPosition; // Para rastrear la altura máxima de ambas columnas

    // Columna izquierda - Medicinas
    if (this.formData.prescriptionMedicines) {
      let currentY = yPosition;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('MEDICINAS A RECETAR:', leftColumnX, currentY);
      currentY += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const medicinesLines = doc.splitTextToSize(this.formData.prescriptionMedicines.toUpperCase(), columnWidth);
      medicinesLines.forEach((line: string) => {
        doc.text(line, leftColumnX, currentY);
        currentY += 5;
      });
      maxYPosition = Math.max(maxYPosition, currentY);
    }

    // Columna derecha - Indicaciones
    if (this.formData.prescriptionInstructions) {
      let currentY = yPosition;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('INDICACIONES DE USO:', rightColumnX, currentY);
      currentY += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const instructionsLines = doc.splitTextToSize(this.formData.prescriptionInstructions.toUpperCase(), columnWidth);
      instructionsLines.forEach((line: string) => {
        doc.text(line, rightColumnX, currentY);
        currentY += 5;
      });
      maxYPosition = Math.max(maxYPosition, currentY);
    }

    // Si no hay campos separados pero hay prescription combinado, usar ese
    if (!this.formData.prescriptionMedicines && !this.formData.prescriptionInstructions && this.formData.prescription) {
      const prescriptionText = this.formData.prescription.toUpperCase();
      const prescriptionLines = doc.splitTextToSize(prescriptionText, pageWidth - (margin * 2));
      prescriptionLines.forEach((line: string) => {
        addText(line, 10, false);
      });
      maxYPosition = yPosition + (prescriptionLines.length * 5) + 5;
    }

    yPosition = maxYPosition + 5;

    // Línea separadora
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Firma y fecha
    addText(`Fecha de emisión: ${this.formatDate(this.formData.date)}`, 10, false, 'right');
    yPosition += 8;
    
    // Línea para firma
    doc.line(pageWidth - margin - 60, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
    addText('Firma del Médico', 10, false, 'right');
    yPosition += 5;
    addText(this.formData.doctor || 'Médico', 10, true, 'right');

    // Pie de página
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    const footerText = 'Este documento es generado automáticamente por el Sistema Médico Marbelize S.A.';
    const footerLines = doc.splitTextToSize(footerText, maxWidth);
    doc.text(footerLines as string[], pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Restaurar color negro para futuras operaciones
    doc.setTextColor(0, 0, 0);

    // Generar nombre del archivo
    const fileName = `Receta_${this.patientData.identification || 'N/A'}_${this.formData.date.replace(/-/g, '')}.pdf`;

    // Convertir PDF a Blob para enviar por correo
    const pdfBlob = doc.output('blob');
    
    return pdfBlob;
  }

  generatePrescription() {
    // Validar que haya datos necesarios
    if (!this.patientData.fullName) {
      this.errorMessage = 'Por favor busque un paciente primero';
      return;
    }

    if (!this.formData.prescriptionMedicines && !this.formData.prescriptionInstructions && !this.formData.prescription) {
      this.errorMessage = 'No hay contenido de receta para generar el PDF';
      return;
    }

    this.errorMessage = '';

    // Generar PDF y descargarlo
    const pdfBlob = this.generatePrescriptionPDF();
    const fileName = `Receta_${this.patientData.identification || 'N/A'}_${this.formData.date.replace(/-/g, '')}.pdf`;
    
    // Crear URL del blob y descargar
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.successMessage = 'PDF de receta generado exitosamente';
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  saveRecord() {
    if (!this.patientData.id) {
      this.errorMessage = 'Por favor busque un paciente primero';
      return;
    }

    if (!this.formData.diagnosis) {
      this.errorMessage = 'Por favor complete la evolución médica';
      return;
    }

    // Validar que al menos una consulta tenga CIE-10
    const hasValidConsultation = this.consultations.some(c => c.cie10Code && c.cie10Code.trim() !== '');
    if (!hasValidConsultation) {
      this.errorMessage = 'Por favor seleccione al menos un código CIE-10 en alguna consulta';
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userStr = localStorage.getItem('currentUser');
    const user = userStr ? JSON.parse(userStr) : null;

    // Guardar cada consulta como un registro separado
    const savePromises: Promise<any>[] = [];
    
    this.consultations
      .filter(c => c.cie10Code && c.cie10Code.trim() !== '') // Solo guardar consultas con CIE-10
      .forEach(consultation => {
        // Guardar registro médico
        const recordData = {
          patientId: this.patientData.id,
          doctorId: user?.id || 1,
          date: this.formData.date,
          time: this.formData.time,
          consultType: consultation.consultType || 'ATENCIÓN MÉDICA',
          cie10Code: consultation.cie10Code || undefined,
          cie10Description: consultation.cie10Description || undefined,
          secondaryCode: consultation.secondaryCode || undefined,
          secondaryDescription: consultation.secondaryDescription || undefined,
          causes: consultation.causes || undefined,
          finalStatus: this.formData.attended ? 'ATENDIDO' : (this.formData.absent ? 'AUSENTE' : undefined),
          diagnosis: this.formData.diagnosis,
          prescription: this.formData.prescription || undefined,
          prescriptionMedicines: this.formData.prescriptionMedicines || undefined,
          prescriptionInstructions: this.formData.prescriptionInstructions || undefined,
        };

        savePromises.push(this.http.post<any>(`${environment.apiUrl}/medical-records`, recordData).toPromise());

        // Si es incidente, guardar también en incidents
        if (consultation.isIncident) {
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
            cie10Code: consultation.cie10Code || undefined,
            cie10Description: consultation.cie10Description || undefined,
            causes: consultation.causes || undefined,
            secondaryCode: consultation.secondaryCode || undefined,
            secondaryDescription: consultation.secondaryDescription || undefined,
            diagnosis: this.formData.diagnosis || undefined,
            prescription: this.formData.prescription || undefined,
            condition: consultation.incidentCondition || 'ESTABLE',
            daysOfRest: consultation.incidentDaysOfRest || 0,
            observations: undefined
          };
          savePromises.push(this.http.post<any>(`${environment.apiUrl}/incidents`, incidentData).toPromise());
        }

        // Si necesita guantes, guardar también en gloves
        if (consultation.needsGloves && consultation.glovesStartDate && consultation.glovesEndDate) {
          const glovesData = {
            identification: this.patientData.identification || '',
            startDate: consultation.glovesStartDate,
            endDate: consultation.glovesEndDate,
            observations: '',
            cie10Code: consultation.cie10Code || undefined,
            cie10Description: consultation.cie10Description || undefined,
            causes: consultation.causes || undefined,
            secondaryCode: consultation.secondaryCode || undefined,
            secondaryDescription: consultation.secondaryDescription || undefined,
            evolution: ''
          };
          savePromises.push(this.http.post<any>(`${environment.apiUrl}/gloves`, glovesData).toPromise());
        }

        // Si necesita dieta, guardar también en diets
        if (consultation.needsDiet && consultation.dietStartDate && consultation.dietEndDate) {
          const dietData = {
            identification: this.patientData.identification || '',
            startDate: consultation.dietStartDate,
            endDate: consultation.dietEndDate,
            observations: '',
            cie10Code: consultation.cie10Code || undefined,
            cie10Description: consultation.cie10Description || undefined,
            causes: consultation.causes || undefined,
            secondaryCode: consultation.secondaryCode || undefined,
            secondaryDescription: consultation.secondaryDescription || undefined,
            evolution: ''
          };
          savePromises.push(this.http.post<any>(`${environment.apiUrl}/diets`, dietData).toPromise());
        }

        // Si necesita ingreso de alimentos, guardar también en diets
        if (consultation.needsFoodIntake && consultation.foodIntakeStartDate) {
          const foodIntakeData = {
            identification: this.patientData.identification || '',
            startDate: consultation.foodIntakeStartDate,
            endDate: consultation.indefiniteFoodIntake ? '' : (consultation.foodIntakeEndDate || ''),
            observations: consultation.indefiniteFoodIntake ? 'INGRESO INDEFINIDO' : '',
            cie10Code: consultation.cie10Code || undefined,
            cie10Description: consultation.cie10Description || undefined,
            causes: consultation.causes || undefined,
            secondaryCode: consultation.secondaryCode || undefined,
            secondaryDescription: consultation.secondaryDescription || undefined,
            evolution: ''
          };
          savePromises.push(this.http.post<any>(`${environment.apiUrl}/diets`, foodIntakeData).toPromise());
        }
      });

    // Ejecutar todas las peticiones en paralelo
    Promise.all(savePromises)
      .then((responses: any[]) => {
        const allSuccess = responses.every(r => r && r.success);
        if (allSuccess) {
          this.successMessage = `${responses.length} registro(s) médico(s) guardado(s) exitosamente`;
          
          // Actualizar datos compartidos con información de la primera consulta
          const firstConsultation = this.consultations.find(c => c.cie10Code && c.cie10Code.trim() !== '');
          if (firstConsultation) {
            const currentShared = this.sharedPatientService.getPatientData();
            if (currentShared) {
              const updatedShared: SharedPatientData = {
                ...currentShared,
                cie10Code: firstConsultation.cie10Code || undefined,
                cie10Description: firstConsultation.cie10Description || undefined,
                secondaryCode: firstConsultation.secondaryCode || undefined,
                secondaryDescription: firstConsultation.secondaryDescription || undefined,
                causes: firstConsultation.causes || undefined,
                diagnosis: this.formData.diagnosis || undefined,
                prescription: this.formData.prescription || undefined,
                prescriptionMedicines: this.formData.prescriptionMedicines || undefined,
                prescriptionInstructions: this.formData.prescriptionInstructions || undefined
              };
              this.sharedPatientService.setPatientData(updatedShared);
            }
          }
          
          // Actualizar contadores con el último registro guardado
          const lastResponse = responses[responses.length - 1];
          if (lastResponse && lastResponse.data) {
            this.attentionData.counter = String(lastResponse.data.monthlyCount || 0);
            this.attentionData.monthlyTotal = String(lastResponse.data.totalMonthlyCount || 0);
            this.attentionData.annualTotal = String(lastResponse.data.annualCount || 0);
              this.attentionData.monthlyByCode = this.attentionData.counter === '0' ? 'NUEVO' : this.attentionData.counter;
            }
          
            this.saving = false;
            // Recargar historial después de guardar
            this.loadConsultationHistory();
          
            setTimeout(() => {
              this.successMessage = '';
            }, 5000);
          } else {
          this.errorMessage = 'Error al guardar uno o más registros';
            this.saving = false;
          }
      })
      .catch((error) => {
        console.error('Error guardando registros:', error);
          this.errorMessage = 'Error al guardar: ' + (error.error?.message || 'Error desconocido');
          this.saving = false;
      });
  }

  onVulnerableReversibleChange() {
    this.updatePatientData();
  }

  openVulnerabilityModal() {
    this.showVulnerabilityModal = true;
    this.vulnerabilitySearchQuery = '';
    
    // Cargar vulnerabilidades desde el servicio
    this.vulnerabilityService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.vulnerabilityList = response.data;
          this.filteredVulnerabilityList = this.vulnerabilityList;
        }
      },
      error: (error) => {
        console.error('Error cargando vulnerabilidades:', error);
        this.errorMessage = 'Error al cargar vulnerabilidades';
      }
    });
  }

  closeVulnerabilityModal() {
    this.showVulnerabilityModal = false;
    this.vulnerabilitySearchQuery = '';
  }

  filterVulnerability() {
    const query = this.vulnerabilitySearchQuery.trim();
    if (!query || query.length < 2) {
      this.filteredVulnerabilityList = this.vulnerabilityList;
      return;
    }

    // Buscar usando el servicio HTTP para obtener resultados actualizados
    this.vulnerabilityService.search(query).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.filteredVulnerabilityList = response.data;
        }
      },
      error: (error) => {
        console.error('Error buscando vulnerabilidades:', error);
        // Fallback a búsqueda local si falla la búsqueda HTTP
        const lowerQuery = query.toLowerCase();
        this.filteredVulnerabilityList = this.vulnerabilityList.filter(vuln => 
          vuln.code.toLowerCase().includes(lowerQuery) ||
          vuln.description.toLowerCase().includes(lowerQuery)
        );
      }
    });
  }

  selectVulnerability(vuln: Vulnerability) {
    this.patientData.vulnerableDescription = vuln.description;
    this.updatePatientData();
    this.closeVulnerabilityModal();
  }

  onAttendedChange() {
    if (this.formData.attended) {
      this.formData.absent = false;
    }
  }

  onAbsentChange() {
    if (this.formData.absent) {
      this.formData.attended = false;
    }
  }

  updatePatientData() {
    if (!this.patientData.id) return;

    const updateData: any = {};
    if (this.patientData.disability !== undefined) {
      updateData.disability = this.patientData.disability;
    }
    if (this.patientData.vulnerableDescription !== undefined) {
      updateData.vulnerableDescription = this.patientData.vulnerableDescription;
      // Si hay descripción de vulnerabilidad, marcar vulnerable como SI
      updateData.vulnerable = this.patientData.vulnerableDescription ? 'SI' : 'NO';
    }
    if (this.patientData.vulnerableReversible !== undefined) {
      updateData.vulnerableReversible = this.patientData.vulnerableReversible;
    }

    if (Object.keys(updateData).length === 0) return;

    this.http.put<any>(`${environment.apiUrl}/patients/${this.patientData.id}`, updateData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Actualizar datos compartidos
            const currentShared = this.sharedPatientService.getPatientData();
            if (currentShared) {
              const updatedShared: SharedPatientData = {
                ...currentShared,
                disability: updateData.disability || currentShared.disability,
                vulnerable: updateData.vulnerable || currentShared.vulnerable,
                vulnerableDescription: updateData.vulnerableDescription || currentShared.vulnerableDescription,
                vulnerableReversible: updateData.vulnerableReversible !== undefined ? updateData.vulnerableReversible : currentShared.vulnerableReversible
              };
              this.sharedPatientService.setPatientData(updatedShared);
            }
          }
        },
        error: (error) => {
          console.error('Error actualizando paciente:', error);
        }
      });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  downloadHistory() {
    this.errorMessage = '';
    this.successMessage = '';
    
    this.http.get(`${environment.apiUrl}/medical-records/export/excel`, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        // Verificar el status code
        if (response.status !== 200) {
          this.errorMessage = 'Error al descargar el historial';
          return;
        }
        
        const blob = response.body;
        if (!blob) {
          this.errorMessage = 'No se recibieron datos del servidor';
          return;
        }
        
        // Verificar que el Content-Type sea Excel
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // Si la respuesta es JSON, leer el blob como texto para obtener el mensaje de error
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorData = JSON.parse(reader.result as string);
              this.errorMessage = errorData.message || 'Error al descargar el historial';
            } catch {
              this.errorMessage = 'Error al descargar el historial';
            }
          };
          reader.readAsText(blob);
          return;
        }
        
        // Si es un blob válido, descargarlo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Historial_Registros_Medicos_${new Date().toISOString().split('T')[0]}.xlsx`;
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
        
        // Si el error tiene un body blob, intentar leerlo como texto
        if (error.error instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorText = JSON.parse(reader.result as string);
              this.errorMessage = errorText.message || 'Error al descargar el historial';
            } catch {
              this.errorMessage = 'Error al descargar el historial';
            }
          };
          reader.readAsText(error.error);
        } else if (error.error && typeof error.error === 'object') {
          this.errorMessage = error.error.message || 'Error al descargar el historial';
        } else {
          this.errorMessage = 'Error al descargar el historial: ' + (error.message || 'Error desconocido');
        }
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

}

