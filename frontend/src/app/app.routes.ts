import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'medical-records',
    loadComponent: () => import('./pages/medical-records/medical-records.component').then(m => m.MedicalRecordsComponent)
  },
  {
    path: 'incidents',
    loadComponent: () => import('./pages/incidents/incidents.component').then(m => m.IncidentsComponent)
  },
  {
    path: 'antidoping',
    loadComponent: () => import('./pages/antidoping/antidoping.component').then(m => m.AntidopingComponent)
  },
  {
    path: 'certificates',
    loadComponent: () => import('./pages/certificates/certificates.component').then(m => m.CertificatesComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
