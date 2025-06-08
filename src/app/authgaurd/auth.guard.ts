import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const isLoggedIn = !!localStorage.getItem('token'); // or use your auth service

  if (!isLoggedIn) {
    router.navigate(['/unauthorized']);
    return false;
  }
  return true;
};
