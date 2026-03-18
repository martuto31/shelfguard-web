import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from './../../services/user.service';

import { Role } from './../../models/user.model';

export const authGuard = (...roles: Role[]) => {
  return async() => {
    const router = inject(Router);
    const userService = inject(UserService);

    const token = localStorage.getItem('accessToken');

    if (!token) {
      return router.navigate(['/login']);
    }

    let user = userService.user();

    if (!user) {
      await userService.setUserFromDatabase();

      user = userService.user();
    }

    if (!user || !user.active) {
      return router.navigate(['/login']);
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
      return router.navigate(['/']);
    }

    return true;
  }
}
