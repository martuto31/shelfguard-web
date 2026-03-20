import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { SnackbarService } from '../services/snackbar.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const router = inject(Router);
  const snackbarService = inject(SnackbarService);

  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  if (!accessToken) {
    return next(req);
  }

  const headers: Record<string, string> = { Authorization: accessToken };

  if (refreshToken) {
    headers['Authorization-Refresh'] = refreshToken;
  }

  return next(req.clone({ setHeaders: headers })).pipe(
    catchError((error) => {
      if (error.status === 401) {
        const isLoginRequest = req.url.includes('auth/login');

        if (!isLoginRequest) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          snackbarService.error('Сесията изтече. Моля, влезте отново.');

          router.navigate(['/login']);
        }
      }

      return throwError(() => error);
    })
  );
};
