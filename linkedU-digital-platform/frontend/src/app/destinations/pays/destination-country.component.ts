import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PublicDestinationService } from '../../core/services/public-destination.service';
import { Destination } from '../../shared/models/models';

@Component({
  selector: 'app-destination-country',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './destination-country.component.html'
})
export class DestinationCountryComponent implements OnInit {
  destination: Destination | null = null;
  isLoading = true;
  private readonly backendBaseUrl = 'http://localhost:8080';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly destinationService: PublicDestinationService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('country') || '';
    this.destinationService.getAll().subscribe({
      next: (data) => {
        this.destination =
          data.find((item) => this.toCountrySlug(item.countryName) === slug) || null;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private toCountrySlug(countryName: string): string {
    return countryName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  splitLines(text?: string): string[] {
    if (!text?.trim()) {
      return [];
    }
    return text.split('\n').map((line) => line.trim()).filter(Boolean);
  }

  getImageUrl(): string {
    const imageUrl = this.destination?.imageUrl?.trim();
    if (!imageUrl) {
      return '/pics/traveling.jpg';
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return `${this.backendBaseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }
}
