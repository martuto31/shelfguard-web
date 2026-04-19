import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnDestroy, ViewChild, signal } from '@angular/core';

import { lastValueFrom } from 'rxjs';

import { Chart, registerables } from 'chart.js';

import { AnalyticsService } from './../../services/analytics.service';
import { ExportService } from './../../services/export.service';
import { SnackbarService } from './../../services/snackbar.service';

import {
    AnalyticsSummary,
    StockByProduct,
    ExpiryRisk,
    WasteByProduct,
    SupplierScore,
    MonthlyMovement,
} from './../../models/analytics.model';

Chart.register(...registerables);

@Component({
    selector: 'app-analytics',
    templateUrl: './analytics.component.html',
    styleUrl: './analytics.component.css',
    imports: [
        DatePipe,
    ]
})

export class AnalyticsComponent implements OnDestroy {

  @ViewChild('monthlyChart') monthlyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('riskChart') riskChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('wasteChart') wasteChartRef!: ElementRef<HTMLCanvasElement>;

  private monthlyChartInstance: Chart | null = null;
  private riskChartInstance: Chart | null = null;
  private wasteChartInstance: Chart | null = null;

  constructor(
    private analyticsService: AnalyticsService,
    private exportService: ExportService,
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

      setTimeout(() => this.renderCharts(), 0);
    } else {
      this.snackbarService.error('Неуспешно зареждане на анализи.');
    }

    this.isLoading.set(false);
  }

  private renderCharts(): void {
    this.renderMonthlyChart();
    this.renderRiskChart();
    this.renderWasteChart();
  }

  private renderMonthlyChart(): void {
    if (!this.monthlyChartRef) return;

    this.monthlyChartInstance?.destroy();

    const months = this.movementsByMonth();

    this.monthlyChartInstance = new Chart(this.monthlyChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: months.map(m => this.formatMonth(m.month)),
        datasets: [
          {
            label: 'Получено (IN)',
            data: months.map(m => m.totalIn),
            backgroundColor: '#22c55e',
            borderRadius: 4,
          },
          {
            label: 'Пикирано (OUT)',
            data: months.map(m => m.totalOut),
            backgroundColor: '#2563eb',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
      },
    });
  }

  private renderRiskChart(): void {
    if (!this.riskChartRef) return;

    this.riskChartInstance?.destroy();

    const risk = this.expiryRisk();

    if (!risk) return;

    const levels = [
      { label: 'Изтекли', value: risk.expired.count, color: '#ef4444' },
      { label: 'Критични (≤7д)', value: risk.critical.count, color: '#f97316' },
      { label: 'Внимание (≤30д)', value: risk.warning.count, color: '#f59e0b' },
      { label: 'Наблюдение (≤90д)', value: risk.monitor.count, color: '#3b82f6' },
      { label: 'Безопасни', value: risk.safe.count, color: '#22c55e' },
    ].filter(l => l.value > 0);

    this.riskChartInstance = new Chart(this.riskChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: levels.map(l => l.label),
        datasets: [{
          data: levels.map(l => l.value),
          backgroundColor: levels.map(l => l.color),
          borderWidth: 2,
          borderColor: '#ffffff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
      },
    });
  }

  private renderWasteChart(): void {
    if (!this.wasteChartRef) return;

    this.wasteChartInstance?.destroy();

    const items = this.wasteByProduct().filter(i => i.totalWasted > 0).slice(0, 10);

    if (items.length === 0) return;

    this.wasteChartInstance = new Chart(this.wasteChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: items.map(i => i.productName),
        datasets: [{
          label: 'Загуби %',
          data: items.map(i => i.wasteRate),
          backgroundColor: items.map(i => i.wasteRate >= 10 ? '#ef4444' : i.wasteRate >= 5 ? '#f59e0b' : '#2563eb'),
          borderRadius: 4,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%` } },
        },
      },
    });
  }

  public ngOnDestroy(): void {
    this.monthlyChartInstance?.destroy();
    this.riskChartInstance?.destroy();
    this.wasteChartInstance?.destroy();
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

  public exportPdf(): void {
    this.exportService.downloadAnalyticsPdf();
  }

  public exportCsv(): void {
    this.exportService.downloadAnalyticsCsv();
  }

  public getWasteChartHeight(): number {
    const items = this.wasteByProduct().filter(i => i.totalWasted > 0).length;
    return Math.max(160, items * 36);
  }

  public getTotalExpiryRiskCount(): number {
    const risk = this.expiryRisk();

    if (!risk) return 0;

    return risk.expired.count + risk.critical.count + risk.warning.count + risk.monitor.count + risk.safe.count;
  }

}
