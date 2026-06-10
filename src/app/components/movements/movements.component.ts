import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';

import { lastValueFrom } from 'rxjs';

import { MovementService } from './../../services/movement.service';
import { SnackbarService } from './../../services/snackbar.service';

import { StockMovement } from './../../models/movement.model';

@Component({
    selector: 'app-movements',
    templateUrl: './movements.component.html',
    styleUrl: './movements.component.css',
    imports: [
        DatePipe,
    ]
})

export class MovementsComponent {

  constructor(
    private movementService: MovementService,
    private snackbarService: SnackbarService) {

    this.load();
  }

  public movements = signal<StockMovement[]>([]);

  public async load(): Promise<void> {
    const response = await lastValueFrom(this.movementService.getAll());

    if (response.status === 200) {
      this.movements.set(response.data || []);
    } else {
      this.snackbarService.error('Неуспешно зареждане на движения.');
    }
  }

  public getProductName(m: StockMovement): string {
    if (typeof m.productId === 'object') {
      return `${m.productId.name} (${m.productId.sku})`;
    }

    return m.productId;
  }

  public getBatchNumber(m: StockMovement): string {
    if (typeof m.batchId === 'object') {
      return m.batchId.batchNumber;
    }

    return m.batchId;
  }

  public getPerformedBy(m: StockMovement): string {
    if (typeof m.performedBy === 'object') {
      return m.performedBy.name;
    }

    return m.performedBy;
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

}
