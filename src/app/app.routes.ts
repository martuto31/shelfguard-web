import { Routes } from '@angular/router';
import { authGuard } from './components/guards/auth.guard';

import { Role } from './models/user.model';

export const routes: Routes = [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },

    {
      path: 'login',
      loadComponent: () => import('./components/auth/login/login.component').then(c => c.LoginComponent),
      title: 'Login — ShelfGuard',
    },

    {
      path: 'dashboard',
      loadComponent: () => import('./components/dashboard/dashboard.component').then(c => c.DashboardComponent),
      title: 'Dashboard — ShelfGuard',
      canActivate: [authGuard()],
    },

    {
      path: 'products',
      loadComponent: () => import('./components/products/products.component').then(c => c.ProductsComponent),
      title: 'Products — ShelfGuard',
      canActivate: [authGuard(Role.OWNER, Role.MANAGER)],
    },

    {
      path: 'batches',
      loadComponent: () => import('./components/batches/batches.component').then(c => c.BatchesComponent),
      title: 'Batches — ShelfGuard',
      canActivate: [authGuard(Role.OWNER, Role.MANAGER)],
    },

    {
      path: 'pick',
      loadComponent: () => import('./components/pick/pick.component').then(c => c.PickComponent),
      title: 'Pick — ShelfGuard',
      canActivate: [authGuard()],
    },

    {
      path: 'analytics',
      loadComponent: () => import('./components/analytics/analytics.component').then(c => c.AnalyticsComponent),
      title: 'Analytics — ShelfGuard',
      canActivate: [authGuard(Role.OWNER, Role.MANAGER)],
    },

    {
      path: 'users',
      loadComponent: () => import('./components/users/users.component').then(c => c.UsersComponent),
      title: 'Users — ShelfGuard',
      canActivate: [authGuard(Role.OWNER)],
    },

    {
      path: '**',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
];
