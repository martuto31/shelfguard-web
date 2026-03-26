import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { lastValueFrom } from 'rxjs';

import { DashboardService } from './../../services/dashboard.service';
import { SnackbarService } from './../../services/snackbar.service';

import {
    DashboardSummary,
    LowStockAlert,
    ExpiringBatch,
} from './../../models/dashboard.model';

interface ExpiryGroup {
  label: string;
  cssClass: string;
  batches: ExpiringBatch[];
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    imports: [
        DatePipe,
        RouterLink,
    ]
})

export class DashboardComponent {

  constructor(
    private dashboardService: DashboardService,
    private snackbarService: SnackbarService) {

    this.load();
  }

  public isLoading = signal(false);
  public summary = signal<DashboardSummary | null>(null);
  public lowStockAlerts = signal<LowStockAlert[]>([]);
  public groups = signal<ExpiryGroup[]>([]);

  public async load(): Promise<void> {
    this.isLoading.set(true);

    const response = await lastValueFrom(this.dashboardService.get());

    if (response.status === 200 && response.data) {
      this.summary.set(response.data.summary);
      this.lowStockAlerts.set(response.data.lowStockAlerts);
      this.groups.set(this.groupByExpiry(response.data.expiringBatches));
    } else {
      this.snackbarService.error('Неуспешно зареждане на данни.');
    }

    this.isLoading.set(false);
  }

  public getDaysUntilExpiry(batch: ExpiringBatch): number {
    const now = new Date();
    const expiry = new Date(batch.expiryDate);

    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  public getDeficit(alert: LowStockAlert): number {
    return alert.minStockThreshold - alert.currentStock;
  }

  private groupByExpiry(batches: ExpiringBatch[]): ExpiryGroup[] {
    const critical: ExpiringBatch[] = [];
    const warning: ExpiringBatch[] = [];
    const good: ExpiringBatch[] = [];

    for (const batch of batches) {
      const days = this.getDaysUntilExpiry(batch);

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
