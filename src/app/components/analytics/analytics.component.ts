import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';

import { lastValueFrom } from 'rxjs';

import { AnalyticsService } from './../../services/analytics.service';
import { SnackbarService } from './../../services/snackbar.service';

import {
    AnalyticsSummary,
    StockByProduct,
    ExpiryRisk,
    WasteByProduct,
    SupplierScore,
    MonthlyMovement,
} from './../../models/analytics.model';

@Component({
    selector: 'app-analytics',
    templateUrl: './analytics.component.html',
    styleUrl: './analytics.component.css',
    imports: [
        DatePipe,
    ]
})

export class AnalyticsComponent {

  constructor(
    private analyticsService: AnalyticsService,
    private snackbarService: SnackbarService) {

    this.load();
  }

  public isLoading = signal(false);
  public summary = signal<AnalyticsSummary | null>(null);
  public stockByProduct = signal<StockByProduct[]>([]);
  public expiryRisk = signal<ExpiryRisk | null>(null);
  public wasteByProduct = signal<WasteByProduct[]>([]);
  public supplierPerformance = signal<SupplierScore[]>([]);
  public movementsByMonth = signal<MonthlyMovement[]>([]);

  public async load(): Promise<void> {
    this.isLoading.set(true);

    const response = await lastValueFrom(this.analyticsService.get());

    if (response.status === 200 && response.data) {
      this.summary.set(response.data.summary);
      this.stockByProduct.set(response.data.stockByProduct);
      this.expiryRisk.set(response.data.expiryRisk);
      this.wasteByProduct.set(response.data.wasteByProduct);
      this.supplierPerformance.set(response.data.supplierPerformance);
      this.movementsByMonth.set(response.data.movementsByMonth);
    } else {
      this.snackbarService.error('Неуспешно зареждане на анализи.');
    }

    this.isLoading.set(false);
  }

  public getStockStatusClass(item: StockByProduct): string {
    if (item.totalRemaining === 0 && item.minStockThreshold > 0) return 'critical';
    if (item.totalRemaining === 0) return 'muted';
    if (item.isLowStock) return 'warning';

    return 'good';
  }

  public getStockStatusLabel(item: StockByProduct): string {
    if (item.totalRemaining === 0) return 'Няма';
    if (item.isLowStock) return 'Нисък';

    return 'Добър';
  }

  public getDaysUntilExpiry(dateStr: string): number {
    const now = new Date();
    const expiry = new Date(dateStr);

    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  public getExpiryClass(dateStr: string): string {
    const days = this.getDaysUntilExpiry(dateStr);

    if (days <= 0) return 'critical';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';

    return '';
  }

  public getWasteClass(rate: number): string {
    if (rate >= 10) return 'critical';
    if (rate >= 5) return 'warning';

    return '';
  }

  public getShelfLifeClass(days: number): string {
    if (days <= 30) return 'critical';
    if (days <= 60) return 'warning';

    return 'good';
  }

  public formatMonth(month: string): string {
    const months = ['Яну', 'Фев', 'Мар', 'Апр', 'Май', 'Юни', 'Юли', 'Авг', 'Сеп', 'Окт', 'Ное', 'Дек'];
    const [year, m] = month.split('-');

    return `${months[parseInt(m) - 1]} ${year}`;
  }

  public getTotalExpiryRiskCount(): number {
    const risk = this.expiryRisk();

    if (!risk) return 0;

    return risk.expired.count + risk.critical.count + risk.warning.count + risk.monitor.count + risk.safe.count;
  }

}
