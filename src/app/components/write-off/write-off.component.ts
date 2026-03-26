import { DatePipe } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import { lastValueFrom } from 'rxjs';

import { WriteOffService } from './../../services/write-off.service';
import { SnackbarService } from './../../services/snackbar.service';

import { WriteOffRow } from './../../models/write-off.model';

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
    private snackbarService: SnackbarService) {

    this.load();
  }

  public rows = signal<WriteOffRow[]>([]);
  public reason = signal('Изтекъл срок');
  public isLoading = signal(false);
  public isConfirming = signal(false);

  public selectedCount = computed(() => this.rows().filter(r => r.selected).length);
  public totalWriteOff = computed(() => this.rows().filter(r => r.selected).reduce((sum, r) => sum + r.writeOffQuantity, 0));
  public allSelected = computed(() => this.rows().length > 0 && this.rows().every(r => r.selected));

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

}
