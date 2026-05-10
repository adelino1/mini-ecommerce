import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.navigate(['/login']);
      return false;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));

    if (payload.role !== 'admin') {
      router.navigate(['/shop']);
      return false;
    }
    return true;
  } catch {
    router.navigate(['/login']);
    return false;
  }
};