import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-page">
      <div class="dashboard-header">
        <h1>🎉 ¡Bienvenido al Sistema Médico Marbelize!</h1>
        <p>Has iniciado sesión correctamente</p>
        <button class="btn btn-logout" (click)="logout()">
          <i class="fas fa-sign-out-alt"></i>
          Cerrar Sesión
        </button>
      </div>
      
      <div class="dashboard-content">
        <div class="success-card">
          <i class="fas fa-check-circle"></i>
          <h2>Sistema Médico Čuka Corp Group</h2>
          <p><strong>Usuario:</strong> {{ currentUser?.fullName || 'Administrador' }}</p>
          <p><strong>Rol:</strong> {{ currentUser?.role || 'Doctor' }}</p>
          <p><strong>Email:</strong> {{ currentUser?.email || 'admin@marbelize.com' }}</p>
        </div>

        <div class="modules-grid">
          <div class="module-card" (click)="navigateToModule('medical-records')" role="button" tabindex="0">
            <i class="fas fa-notes-medical"></i>
            <h4>Nueva Atención</h4>
            <p>Gestión de consultas, incidentes, antidopaje y certificados</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
    }

    .dashboard-header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }

    .dashboard-header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }

    .dashboard-header p {
      font-size: 1.2rem;
      margin-bottom: 20px;
    }

    .btn-logout {
      background: white;
      color: #667eea;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-logout:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .btn-logout i {
      margin-right: 8px;
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
    }

    .success-card {
      background: white;
      padding: 40px;
      border-radius: 16px;
      text-align: center;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }

    .success-card i {
      font-size: 4rem;
      color: #10b981;
      margin-bottom: 20px;
    }

    .success-card h2 {
      color: #1e293b;
      margin-bottom: 20px;
    }

    .success-card p {
      color: #64748b;
      margin: 10px 0;
      font-size: 1.1rem;
    }

    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .module-card {
      background: white;
      padding: 40px 30px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      cursor: pointer;
      border: 2px solid transparent;
    }

    .module-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
      border-color: #667eea;
    }

    .module-card:active {
      transform: translateY(-4px);
    }

    .module-card i {
      font-size: 3.5rem;
      color: #667eea;
      margin-bottom: 20px;
      display: block;
    }

    .module-card h4 {
      color: #1e293b;
      margin-bottom: 10px;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .module-card p {
      color: #64748b;
      font-size: 0.95rem;
      margin: 0;
    }
  `]
})
export class DashboardComponent {
  currentUser: any = null;

  constructor(private router: Router) {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  navigateToModule(module: string) {
    this.router.navigate([`/${module}`]);
  }
}

