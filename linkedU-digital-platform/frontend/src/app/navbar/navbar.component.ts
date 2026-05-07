import { Component, HostListener, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  menuOpen = signal(false);
  scrolled = signal(false);

  loggedIn = false;
  role: string | null = null;
  roleLinks: NavLink[] = [];

  constructor() {
    effect(() => {
      if (this.menuOpen()) {
        document.body.classList.add('drawer-open');
      } else {
        document.body.classList.remove('drawer-open');
      }
    });
  }
  
  publicLinks: NavLink[] = [
    { label: 'Accueil',      path: '/' },
    { label: 'Destinations', path: '/destinations' },
    { label: 'Services',     path: '/services' },
    { label: 'Blogs',        path: '/blogs' },
    { label: 'À propos',     path: '/about-us' },
  ];

  ngOnInit(): void {
    this.refreshAuthState();
    this.router.events.subscribe(() => this.refreshAuthState());
  }

  private refreshAuthState(): void {
    this.loggedIn = this.authService.isLoggedIn();
    this.role = this.authService.getUserRole();
    this.roleLinks = this.buildRoleLinks(this.role);
  }

  private buildRoleLinks(role: string | null): NavLink[] {
    switch (role) {
      case 'ADMIN':
        return [{ label: 'Panneau d\'administration', path: '/admin' }];
      case 'AGENT':
        return [
          { label: 'Portail Agent', path: '/agent' },
        ];
      case 'STUDENT':
        return [
          { label: 'Tableau de bord',  path: '/student' },
          { label: 'Mon Profil',       path: '/profile/student' },
          { label: 'Messages',         path: '/chat' },
          { label: 'Tickets',          path: '/ticket' }
        ];
      case 'GUEST':
        return [
          { label: 'Mon Profil', path: '/profile/guest' },
          { label: 'Messages',   path: '/chat' }
        ];
      case 'USER':
        return [
          { label: 'Mon Profil', path: '/profile' },
          { label: 'Messages',   path: '/chat' }
        ];
      default:
        return [];
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 20);
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.loggedIn = false;
    this.role = null;
    this.roleLinks = [];
    this.closeMenu();
    this.router.navigate(['/']);
  }
}