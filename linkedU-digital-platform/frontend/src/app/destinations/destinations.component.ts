import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicDestinationService } from '../core/services/public-destination.service';
import { Destination } from '../shared/models/models';

@Component({
    selector: 'app-destinations',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './destinations.component.html',
    styleUrl: './destinations.component.css'
})
export class DestinationsComponent implements OnInit {
  destinations: Destination[] = [];
  isLoading = true;
  errorMessage = '';
  private readonly backendBaseUrl = 'http://localhost:8080';

  constructor(private readonly destinationService: PublicDestinationService) {}

  ngOnInit(): void {
    this.destinationService.getAll().subscribe({
      next: (data) => {
        this.destinations = data;
        this.isLoading = false;
      },
      error: (err) => {
        const backendMessage = typeof err?.error === 'string' ? err.error : err?.error?.message;
        this.errorMessage = backendMessage || 'Impossible de charger les destinations.';
        this.isLoading = false;
      }
    });
  }

  toCountrySlug(countryName: string): string {
    return countryName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  getImageUrl(destination: Destination): string {
    const imageUrl = destination.imageUrl?.trim();
    if (!imageUrl) {
      return '/pics/traveling.jpg';
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${this.backendBaseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }
}
