import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';

import { lastValueFrom } from 'rxjs';

import { BatchService } from './../../services/batch.service';
import { SnackbarService } from './../../services/snackbar.service';

import { Batch } from './../../models/batch.model';
import { Product } from './../../models/product.model';

interface ExpiryGroup {
  label: string;
  cssClass: string;
  batches: Batch[];
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    imports: [
        DatePipe,
    ]
})

export class DashboardComponent {

  constructor(
    private batchService: BatchService,
    private snackbarService: SnackbarService) {

    this.loadExpiring();
  }

  public groups = signal<ExpiryGroup[]>([]);
  public isLoading = signal(false);

  public async loadExpiring(): Promise<void> {
    this.isLoading.set(true);

    const response = await lastValueFrom(this.batchService.getExpiring(90));

    if (response.status === 200) {
      const batches = response.data || [];
      this.groups.set(this.groupByExpiry(batches));
    } else {
      this.snackbarService.error('Неуспешно зареждане на данни.');
    }

    this.isLoading.set(false);
  }

  public getProductName(batch: Batch): string {
    if (typeof batch.productId === 'object') {
      return (batch.productId as Product).name;
    }

    return '';
  }

  public getDaysUntilExpiry(batch: Batch): number {
    const now = new Date();
    const expiry = new Date(batch.expiryDate);

    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  private groupByExpiry(batches: Batch[]): ExpiryGroup[] {
    const now = new Date();
    const critical: Batch[] = [];
    const warning: Batch[] = [];
    const good: Batch[] = [];

    for (const batch of batches) {
      const expiry = new Date(batch.expiryDate);
      const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (days <= 0) {
        continue;
      }

      if (days <= 30) {
        critical.push(batch);
      } else if (days <= 60) {
        warning.push(batch);
      } else {
        good.push(batch);
      }
    }

    const groups: ExpiryGroup[] = [];

    if (critical.length > 0) {
      groups.push({ label: 'Изтича до 30 дни', cssClass: 'critical', batches: critical });
    }

    if (warning.length > 0) {
      groups.push({ label: 'Изтича до 30–60 дни', cssClass: 'warning', batches: warning });
    }

    if (good.length > 0) {
      groups.push({ label: 'Изтича до 60–90 дни', cssClass: 'good', batches: good });
    }

    return groups;
  }

}
