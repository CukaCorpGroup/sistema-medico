import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-left-panel"></div>
      <div class="login-right-panel">
        <div class="login-box">
          <div class="logo-section">
            <h1>Bienvenido a Marbelize Task</h1>
            <p class="subtitle">Nueva visita salva vientos</p>
          </div>

          <form class="login-form" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label>
                <i class="fas fa-user"></i>
                Usuario
              </label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="username"
                name="username"
                placeholder="Ingrese su usuario"
                [disabled]="loading"
              />
            </div>

            <div class="form-group">
              <label>
                <i class="fas fa-lock"></i>
                Contraseña
              </label>
              <input
                type="password"
                class="form-control"
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                [disabled]="loading"
              />
            </div>

            <div class="alert alert-danger" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <button type="submit" class="btn btn-login" [disabled]="loading">
              <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
              <i class="fas fa-sign-in-alt" *ngIf="!loading"></i>
              {{ loading ? 'Iniciando sesión...' : 'INGRESAR' }}
            </button>
          </form>

          <div class="login-footer">
            <p>© Version v1.1 | Usuario: admin | Contraseña: admin123</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      height: 100vh;
    }

    .login-left-panel {
      flex: 1;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%);
    }

    .login-right-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      padding: 40px;
    }

    .login-box {
      width: 100%;
      max-width: 420px;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 40px;
    }

    .logo-section h1 {
      font-size: 1.5rem;
      color: #1e3a8a;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #64748b;
      font-size: 0.95rem;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-group label {
      display: block;
      color: #334155;
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .form-group label i {
      margin-right: 8px;
      color: #3b82f6;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.95rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-control:disabled {
      background-color: #f1f5f9;
      cursor: not-allowed;
    }

    .alert {
      padding: 12px;
      margin-bottom: 16px;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .alert-danger {
      background-color: #fee;
      color: #c00;
      border: 1px solid #fcc;
    }

    .btn-login {
      width: 100%;
      padding: 14px;
      background: #4338ca;
      border: none;
      border-radius: 6px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
      transition: all 0.3s ease;
    }

    .btn-login:hover:not(:disabled) {
      background: #3730a3;
      transform: translateY(-1px);
    }

    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-login i {
      margin-right: 8px;
    }

    .login-footer {
      margin-top: 30px;
      text-align: center;
    }

    .login-footer p {
      color: #94a3b8;
      font-size: 0.85rem;
    }
  `]
})
export class LoginComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  username = 'admin';
  password = 'admin123';
  loading = false;
  errorMessage = '';

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Por favor ingrese usuario y contraseña';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.post<any>(`${environment.apiUrl}/auth/login`, {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        if (response.success && response.data) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('currentUser', JSON.stringify(response.data.user));
          
          // Redirigir al dashboard
          alert('¡Login exitoso! Bienvenido ' + response.data.user.fullName);
          window.location.href = '/dashboard';
        }
      },
      error: (error) => {
        console.error('Error de login:', error);
        this.errorMessage = error.error?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}
