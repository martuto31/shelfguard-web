import { DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import { lastValueFrom } from 'rxjs';

import { WriteOffService } from './../../services/write-off.service';
import { ProductService } from './../../services/product.service';
import { SnackbarService } from './../../services/snackbar.service';

import { WriteOffRow, ManualWriteOffRow } from './../../models/write-off.model';
import { Product } from './../../models/product.model';

@Component({
    selector: 'app-write-off',
    templateUrl: './write-off.component.html',
    styleUrl: './write-off.component.css',
    imports: [
        DatePipe,
    ]
})

export class WriteOffComponent {

  constructor(
    private writeOffService: WriteOffService,
    private productService: ProductService,
    private snackbarService: SnackbarService) {

    this.load();
    this.loadProducts();
  }

  public activeTab = signal<'expired' | 'manual'>('expired');

  // Expired

  public rows = signal<WriteOffRow[]>([]);
  public reason = signal('Изтекъл срок');
  public isLoading = signal(false);
  public isConfirming = signal(false);

  public selectedCount = computed(() => this.rows().filter(r => r.selected).length);
  public totalWriteOff = computed(() => this.rows().filter(r => r.selected).reduce((sum, r) => sum + r.writeOffQuantity, 0));
  public allSelected = computed(() => this.rows().length > 0 && this.rows().every(r => r.selected));

  // Manual

  public products = signal<Product[]>([]);
  public selectedProductId = signal('');
  public manualRows = signal<ManualWriteOffRow[]>([]);
  public manualReason = signal('Повредена стока');
  public isLoadingBatches = signal(false);
  public isConfirmingManual = signal(false);

  public manualSelectedCount = computed(() => this.manualRows().filter(r => r.selected).length);
  public manualTotalWriteOff = computed(() => this.manualRows().filter(r => r.selected).reduce((sum, r) => sum + r.writeOffQuantity, 0));
  public manualAllSelected = computed(() => this.manualRows().length > 0 && this.manualRows().every(r => r.selected));

  public setTab(tab: 'expired' | 'manual'): void {
    this.activeTab.set(tab);
  }

  public async load(): Promise<void> {
    this.isLoading.set(true);

    const response = await lastValueFrom(this.writeOffService.getExpired());

    if (response.status === 200 && response.data) {
      this.rows.set((response.data as WriteOffRow[]).map(batch => ({
        ...batch,
        selected: true,
        writeOffQuantity: batch.quantityRemaining,
      })));
    } else {
      this.snackbarService.error('Неуспешно зареждане на изтекли партиди.');
    }

    this.isLoading.set(false);
  }

  public onReasonChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.reason.set(select.value);
  }

  public toggleRow(index: number): void {
    const current = [...this.rows()];
    current[index] = { ...current[index], selected: !current[index].selected };
    this.rows.set(current);
  }

  public toggleAll(): void {
    const selectAll = !this.allSelected();
    this.rows.set(this.rows().map(r => ({ ...r, selected: selectAll })));
  }

  public onQuantityChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const qty = Math.max(1, Math.min(input.valueAsNumber || 1, this.rows()[index].quantityRemaining));
    const current = [...this.rows()];
    current[index] = { ...current[index], writeOffQuantity: qty };
    this.rows.set(current);
  }

  public async confirmWriteOff(): Promise<void> {
    const selected = this.rows().filter(r => r.selected);

    if (selected.length === 0) {
      this.snackbarService.error('Изберете поне една партида.');

      return;
    }

    this.isConfirming.set(true);

    const items = selected.map(r => ({
      batchId: r.batchId,
      productId: r.productId,
      quantity: r.writeOffQuantity,
      reason: this.reason(),
    }));

    const response = await lastValueFrom(this.writeOffService.confirm(items));

    if (response.status === 200) {
      this.snackbarService.success(`Бракувани ${selected.length} партиди. Наличността е обновена.`);
      this.load();
    } else if (response.status === 409) {
      this.snackbarService.error('Наличността се е променила. Опитайте отново.');
      this.load();
    } else {
      this.snackbarService.error('Неуспешно бракуване.');
    }

    this.isConfirming.set(false);
  }

  public async loadProducts(): Promise<void> {
    const response = await lastValueFrom(this.productService.getAll());

    if (response.status === 200) {
      this.products.set(response.data || []);
    } else {
      this.snackbarService.error('Неуспешно зареждане на продукти.');
    }
  }

  public onProductChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const productId = select.value;

    if (!productId) {
      this.selectedProductId.set('');
      this.manualRows.set([]);

      return;
    }

    this.selectedProductId.set(productId);
    this.loadBatches(productId);
  }

  public async loadBatches(productId: string): Promise<void> {
    this.isLoadingBatches.set(true);

    const response = await lastValueFrom(this.writeOffService.getActiveBatches(productId));

    if (response.status === 200 && response.data) {
      this.manualRows.set((response.data as ManualWriteOffRow[]).map(batch => ({
        ...batch,
        selected: false,
        writeOffQuantity: batch.quantityRemaining,
      })));
    } else {
      this.snackbarService.error('Неуспешно зареждане на партиди.');
    }

    this.isLoadingBatches.set(false);
  }

  public onManualReasonChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.manualReason.set(select.value);
  }

  public toggleManualRow(index: number): void {
    const current = [...this.manualRows()];
    current[index] = { ...current[index], selected: !current[index].selected };
    this.manualRows.set(current);
  }

  public toggleManualAll(): void {
    const selectAll = !this.manualAllSelected();
    this.manualRows.set(this.manualRows().map(r => ({ ...r, selected: selectAll })));
  }

  public onManualQuantityChange(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const qty = Math.max(1, Math.min(input.valueAsNumber || 1, this.manualRows()[index].quantityRemaining));
    const current = [...this.manualRows()];
    current[index] = { ...current[index], writeOffQuantity: qty };
    this.manualRows.set(current);
  }

  public async confirmManualWriteOff(): Promise<void> {
    const selected = this.manualRows().filter(r => r.selected);

    if (selected.length === 0) {
      this.snackbarService.error('Изберете поне една партида.');

      return;
    }

    this.isConfirmingManual.set(true);

    const items = selected.map(r => ({
      batchId: r.batchId,
      productId: r.productId,
      quantity: r.writeOffQuantity,
      reason: this.manualReason(),
    }));

    const response = await lastValueFrom(this.writeOffService.confirm(items));

    if (response.status === 200) {
      this.snackbarService.success(`Бракувани ${selected.length} партиди. Наличността е обновена.`);
      this.loadBatches(this.selectedProductId());
    } else if (response.status === 409) {
      this.snackbarService.error('Наличността се е променила. Опитайте отново.');
      this.loadBatches(this.selectedProductId());
    } else {
      this.snackbarService.error('Неуспешно бракуване.');
    }

    this.isConfirmingManual.set(false);
  }

}
