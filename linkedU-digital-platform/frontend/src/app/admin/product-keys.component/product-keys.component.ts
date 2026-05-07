import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';
import { ProductKey } from '../../shared/models/models';

@Component({
  selector: 'app-product-keys',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-keys.component.html',
  styleUrl: './product-keys.component.css'
})
export class ProductKeysComponent implements OnInit {
  availableKeys: ProductKey[] = [];
  newlyCreatedKeys: ProductKey[] = [];

  quantity: number = 1;
  loading = false;
  creating = false;
  errorMsg = '';
  successMsg = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadAvailableKeys();
  }

  loadAvailableKeys(): void {
    this.loading = true;
    this.errorMsg = '';
    this.adminService.getAvailableProductKeys().subscribe({
      next: (keys) => {
        this.availableKeys = keys;
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Échec du chargement des clés de produit.';
        this.loading = false;
      }
    });
  }

  createKeys(): void {
    if (this.quantity < 1) return;
    this.creating = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.newlyCreatedKeys = [];

    this.adminService.createProductKeys(this.quantity).subscribe({
      next: (keys) => {
        this.newlyCreatedKeys = keys;
        this.successMsg = `${keys.length} clé(s) créée(s) avec succès.`;
        this.creating = false;
        this.loadAvailableKeys();
      },
      error: (err) => {
        this.errorMsg = 'Échec de la création des clés de produit.';
        this.creating = false;
      }
    });
  }

  copyKey(key: string): void {
    navigator.clipboard.writeText(key);
  }
}