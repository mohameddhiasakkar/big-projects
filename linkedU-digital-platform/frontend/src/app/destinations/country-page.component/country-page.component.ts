import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DestinationService } from '../../core/services/destination.service';
import { Destination } from '../../shared/models/models';

@Component({
  selector: 'app-country-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './country-page.component.html',
  styleUrl: './country-page.component.css'
})
export class CountryPageComponent implements OnInit {
  destination: Destination | null = null;
  isLoading = true;
  errorMessage = '';
  readonly backendUrl = 'http://localhost:8080';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly destinationService: DestinationService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) { this.errorMessage = 'Invalid destination.'; this.isLoading = false; return; }

    this.destinationService.getBySlug(slug).subscribe({
      next: (data) => { this.destination = data; this.isLoading = false; },
      error: () => { this.errorMessage = 'Destination not found.'; this.isLoading = false; }
    });
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '/assets/Pictures/map.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${this.backendUrl}${imageUrl}`;
  }

  splitLines(text: string | undefined): string[] {
    if (!text?.trim()) return [];
    return text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  }

  formatNumber(n: number | undefined): string {
    if (!n) return '—';
    return n.toLocaleString();
  }
}
