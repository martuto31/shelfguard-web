import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';

import { lastValueFrom } from 'rxjs';

import { PickService } from './../../services/pick.service';
import { ProductService } from './../../services/product.service';
import { SnackbarService } from './../../services/snackbar.service';

import { Product } from './../../models/product.model';
import { PickSuggestion } from './../../models/batch.model';

@Component({
    selector: 'app-pick',
    templateUrl: './pick.component.html',
    styleUrl: './pick.component.css',
    imports: [
        DatePipe,
    ]
})

export class PickComponent {

  constructor(
    private productService: ProductService,
    private pickService: PickService,
    private snackbarService: SnackbarService) {

    this.loadProducts();
  }

  public products = signal<Product[]>([]);
  public selectedProductId = signal('');
  public quantity = signal<number | null>(null);
  public suggestions = signal<PickSuggestion[]>([]);
  public totalQuantity = signal(0);
  public expiredCount = signal(0);
  public isLoading = signal(false);
  public showSuggestions = signal(false);

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
    this.selectedProductId.set(select.value);
  }

  public onQuantityChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.quantity.set(input.valueAsNumber || null);
  }

  public async suggest(): Promise<void> {
    if (!this.selectedProductId() || !this.quantity() || this.quantity()! <= 0) {
      this.snackbarService.error('Изберете продукт и въведете количество.');

      return;
    }

    this.isLoading.set(true);

    const response = await lastValueFrom(this.pickService.suggest(this.selectedProductId(), this.quantity()!));

    if (response.status === 200 && response.data) {
      this.suggestions.set(response.data.suggestions);
      this.totalQuantity.set(response.data.totalQuantity);
      this.expiredCount.set(response.data.expiredCount);
      this.showSuggestions.set(true);
    } else if (response.status === 404) {
      this.snackbarService.error('Няма налична наличност за този продукт.');
      this.suggestions.set([]);
      this.showSuggestions.set(false);
    } else {
      this.snackbarService.error('Нещо се обърка.');
    }

    this.isLoading.set(false);
  }

  public async confirmPick(): Promise<void> {
    this.isLoading.set(true);

    const response = await lastValueFrom(this.pickService.confirm(this.selectedProductId(), this.suggestions()));

    if (response.status === 200) {
      this.snackbarService.success('Пикирането е потвърдено. Наличността е обновена.');
      this.reset();
    } else if (response.status === 409) {
      this.snackbarService.error('Наличността се е променила. Опитайте отново.');
      this.showSuggestions.set(false);
    } else {
      this.snackbarService.error('Неуспешно потвърждаване на пикиране.');
    }

    this.isLoading.set(false);
  }

  public reset(): void {
    this.selectedProductId.set('');
    this.quantity.set(null);
    this.suggestions.set([]);
    this.totalQuantity.set(0);
    this.expiredCount.set(0);
    this.showSuggestions.set(false);
  }

  public getDaysClass(days: number): string {
    if (days <= 7) return 'days-critical';
    if (days <= 30) return 'days-warning';

    return '';
  }

  public getProductName(): string {
    const product = this.products().find(p => p.id === this.selectedProductId());

    return product ? product.name : '';
  }

}
