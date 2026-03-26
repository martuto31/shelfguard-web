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
      title: 'Вход — ShelfGuard',
    },

    {
      path: 'dashboard',
      loadComponent: () => import('./components/dashboard/dashboard.component').then(c => c.DashboardComponent),
      title: 'Табло — ShelfGuard',
      canActivate: [authGuard()],
    },

    {
      path: 'products',
      loadComponent: () => import('./components/products/products.component').then(c => c.ProductsComponent),
      title: 'Продукти — ShelfGuard',
      canActivate: [authGuard(Role.OWNER, Role.MANAGER)],
    },

    {
      path: 'suppliers',
      loadComponent: () => import('./components/suppliers/suppliers.component').then(c => c.SuppliersComponent),
      title: 'Доставчици — ShelfGuard',
      canActivate: [authGuard(Role.OWNER, Role.MANAGER)],
    },

    {
      path: 'batches',
      loadComponent: () => import('./components/batches/batches.component').then(c => c.BatchesComponent),
      title: 'Партиди — ShelfGuard',
      canActivate: [authGuard(Role.OWNER, Role.MANAGER)],
    },

    {
      path: 'pick',
      loadComponent: () => import('./components/pick/pick.component').then(c => c.PickComponent),
      title: 'Пикиране — ShelfGuard',
      canActivate: [authGuard()],
    },

    {
      path: 'write-off',
      loadComponent: () => import('./components/write-off/write-off.component').then(c => c.WriteOffComponent),
      title: 'Бракуване — ShelfGuard',
      canActivate: [authGuard(Role.OWNER, Role.MANAGER)],
    },

    {
      path: 'analytics',
      loadComponent: () => import('./components/analytics/analytics.component').then(c => c.AnalyticsComponent),
      title: 'Анализи — ShelfGuard',
      canActivate: [authGuard(Role.OWNER, Role.MANAGER)],
    },

    {
      path: 'users',
      loadComponent: () => import('./components/users/users.component').then(c => c.UsersComponent),
      title: 'Потребители — ShelfGuard',
      canActivate: [authGuard(Role.OWNER)],
    },

    {
      path: '**',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
];
