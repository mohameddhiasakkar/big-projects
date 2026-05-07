import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true; // skip guard on server
  }

  const role = localStorage.getItem('userRole')?.toUpperCase();
  const allowedRoles: string[] = route.data['roles'] ?? [];

  if (role && allowedRoles.includes(role)) {
    return true;
  }

  router.navigateByUrl('/login');
  return false;
};