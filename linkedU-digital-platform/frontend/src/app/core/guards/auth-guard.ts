import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true; // skip guard on server
  }

  const token = localStorage.getItem('token');
  if (token) {
    return true;
  }

  router.navigateByUrl('/login');
  return false;
};