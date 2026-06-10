import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { lastValueFrom } from 'rxjs';

import { DashboardService } from './../../services/dashboard.service';
import { MovementService } from './../../services/movement.service';
import { SnackbarService } from './../../services/snackbar.service';

import {
    DashboardSummary,
    LowStockAlert,
    ExpiringBatch,
    RecentActivity,
} from './../../models/dashboard.model';
import { StockMovement } from './../../models/movement.model';

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
    private movementService: MovementService,
    private snackbarService: SnackbarService) {

    this.load();
  }

  public isLoading = signal(false);
  public summary = signal<DashboardSummary | null>(null);
  public lowStockAlerts = signal<LowStockAlert[]>([]);
  public groups = signal<ExpiryGroup[]>([]);
  public recentActivity = signal<RecentActivity[]>([]);

  public async load(): Promise<void> {
    this.isLoading.set(true);

    const [dashboardResponse, movementsResponse] = await Promise.all([
      lastValueFrom(this.dashboardService.get()),
      lastValueFrom(this.movementService.getRecent(5)),
    ]);

    if (dashboardResponse.status === 200 && dashboardResponse.data) {
      this.summary.set(dashboardResponse.data.summary);
      this.lowStockAlerts.set(dashboardResponse.data.lowStockAlerts);
      this.groups.set(this.groupByExpiry(dashboardResponse.data.expiringBatches));
    } else {
      this.snackbarService.error('Неуспешно зареждане на данни.');
    }

    if (movementsResponse.status === 200 && movementsResponse.data) {
      this.recentActivity.set(
        movementsResponse.data.slice(0, 5).map(m => this.toRecentActivity(m))
      );
    }

    this.isLoading.set(false);
  }

  public getTypeClass(type: string): string {
    if (type === 'IN') return 'type-in';
    if (type === 'OUT') return 'type-out';

    return 'type-adjustment';
  }

  public getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      IN: 'Приемане',
      OUT: 'Извеждане',
      ADJUSTMENT: 'Корекция',
    };

    return labels[type] ?? type;
  }

  private toRecentActivity(m: StockMovement): RecentActivity {
    return {
      id: m.id,
      type: m.type,
      productName: typeof m.productId === 'object' ? `${m.productId.name} (${m.productId.sku})` : m.productId,
      batchNumber: typeof m.batchId === 'object' ? m.batchId.batchNumber : m.batchId,
      quantity: m.quantity,
      performedBy: typeof m.performedBy === 'object' ? m.performedBy.name : m.performedBy,
      createdAt: m.createdAt,
    };
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
