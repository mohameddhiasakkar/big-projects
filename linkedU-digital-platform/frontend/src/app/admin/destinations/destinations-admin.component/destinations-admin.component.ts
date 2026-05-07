import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DestinationService } from '../../../core/services/destination.service';
import { Destination } from '../../../shared/models/models';

type ViewMode = 'list' | 'create' | 'edit';

@Component({
  selector: 'app-destinations-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './destinations-admin.component.html',
  styleUrl: './destinations-admin.component.css'
})
export class DestinationsAdminComponent implements OnInit {

  viewMode: ViewMode = 'list';
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  destinations: Destination[] = [];
  selectedDestination: Destination | null = null;
  deleteConfirmId: number | null = null;
  isDeleting = false;

  // Form fields
  form = this.emptyForm();
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  readonly backendUrl = 'http://localhost:8080';

  constructor(private readonly destinationService: DestinationService) {}

  ngOnInit(): void { this.loadDestinations(); }

  emptyForm() {
    return {
      countryName: '',
      description: '',
      paragraph: '',
      publicUniversities: '',
      privateColleges: '',
      teachingLanguages: '',
      specialities: '',
      educationSystem: '',
      numberOfUniversities: null as number | null,
      numberOfStudents: null as number | null,
      averageTuitionFee: null as number | null,
      averageLivingCost: null as number | null,
      offers: ''
    };
  }

  loadDestinations(): void {
    this.isLoading = true;
    this.destinationService.adminGetAll().subscribe({
      next: (data) => { this.destinations = data; this.isLoading = false; },
      error: () => { this.errorMessage = 'Failed to load destinations.'; this.isLoading = false; }
    });
  }

  showCreate(): void {
    this.form = this.emptyForm();
    this.selectedImage = null;
    this.imagePreview = null;
    this.viewMode = 'create';
    this.errorMessage = '';
    this.successMessage = '';
  }

  showEdit(dest: Destination): void {
    this.selectedDestination = dest;
    this.form = {
      countryName: dest.countryName || '',
      description: dest.description || '',
      paragraph: dest.paragraph || '',
      publicUniversities: dest.publicUniversities || '',
      privateColleges: dest.privateColleges || '',
      teachingLanguages: dest.teachingLanguages || '',
      specialities: dest.specialities || '',
      educationSystem: dest.educationSystem || '',
      numberOfUniversities: dest.numberOfUniversities || null,
      numberOfStudents: dest.numberOfStudents || null,
      averageTuitionFee: dest.averageTuitionFee || null,
      averageLivingCost: dest.averageLivingCost || null,
      offers: dest.offers || ''
    };
    this.selectedImage = null;
    this.imagePreview = dest.imageUrl ? this.getImageUrl(dest.imageUrl) : null;
    this.viewMode = 'edit';
    this.errorMessage = '';
    this.successMessage = '';
  }

  showList(): void {
    this.viewMode = 'list';
    this.errorMessage = '';
    this.successMessage = '';
    this.deleteConfirmId = null;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.selectedImage = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => { this.imagePreview = e.target?.result as string; };
    reader.readAsDataURL(this.selectedImage);
  }

  buildFormData(): FormData {
    const fd = new FormData();
    fd.append('countryName', this.form.countryName);
    if (this.form.description)        fd.append('description', this.form.description);
    if (this.form.paragraph)          fd.append('paragraph', this.form.paragraph);
    if (this.form.publicUniversities) fd.append('publicUniversities', this.form.publicUniversities);
    if (this.form.privateColleges)    fd.append('privateColleges', this.form.privateColleges);
    if (this.form.teachingLanguages)  fd.append('teachingLanguages', this.form.teachingLanguages);
    if (this.form.specialities)       fd.append('specialities', this.form.specialities);
    if (this.form.educationSystem)    fd.append('educationSystem', this.form.educationSystem);
    if (this.form.numberOfUniversities !== null) fd.append('numberOfUniversities', String(this.form.numberOfUniversities));
    if (this.form.numberOfStudents !== null)     fd.append('numberOfStudents', String(this.form.numberOfStudents));
    if (this.form.averageTuitionFee !== null)    fd.append('averageTuitionFee', String(this.form.averageTuitionFee));
    if (this.form.averageLivingCost !== null)    fd.append('averageLivingCost', String(this.form.averageLivingCost));
    if (this.form.offers)             fd.append('offers', this.form.offers);
    if (this.selectedImage)           fd.append('image', this.selectedImage);
    return fd;
  }

  onSave(): void {
    if (!this.form.countryName.trim()) { this.errorMessage = 'Country name is required.'; return; }
    this.isSaving = true;
    this.errorMessage = '';

    const fd = this.buildFormData();
    const action = this.viewMode === 'create'
      ? this.destinationService.create(fd)
      : this.destinationService.update(this.selectedDestination!.id!, fd);

    action.subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.isSaving = false;
        this.loadDestinations();
        setTimeout(() => this.showList(), 1200);
      },
      error: (err: { error?: { error?: string } }) => {
        this.errorMessage = err?.error?.error || 'Save failed.';
        this.isSaving = false;
      }
    });
  }

  confirmDelete(id: number): void { this.deleteConfirmId = id; }
  cancelDelete(): void { this.deleteConfirmId = null; }

  onDelete(id: number): void {
    this.isDeleting = true;
    this.destinationService.delete(id).subscribe({
      next: () => {
        this.destinations = this.destinations.filter(d => d.id !== id);
        this.deleteConfirmId = null;
        this.isDeleting = false;
        this.successMessage = 'Destination deleted.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => { this.isDeleting = false; this.deleteConfirmId = null; }
    });
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${this.backendUrl}${imageUrl}`;
  }

  splitLines(text: string | undefined): string[] {
    if (!text?.trim()) return [];
    return text.split('\n').filter(l => l.trim());
  }
}