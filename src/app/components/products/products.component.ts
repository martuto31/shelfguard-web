import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { lastValueFrom } from 'rxjs';

import { ExportService } from './../../services/export.service';
import { ProductService } from './../../services/product.service';
import { SnackbarService } from './../../services/snackbar.service';

import { Product } from './../../models/product.model';

interface FormControls {
  name: FormControl<string | null>;
  sku: FormControl<string | null>;
  category: FormControl<string | null>;
  unit: FormControl<string | null>;
  minStockThreshold: FormControl<number | null>;
  minShelfLifeDays: FormControl<number | null>;
}

@Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrl: './products.component.css',
    imports: [
        ReactiveFormsModule,
    ]
})

export class ProductsComponent {

  constructor(
    private formBuilder: FormBuilder,
    private exportService: ExportService,
    private productService: ProductService,
    private snackbarService: SnackbarService) {

    this.createForm();
    this.loadProducts();
  }

  public products = signal<Product[]>([]);
  public formGroup!: FormGroup<FormControls>;
  public showForm = signal(false);
  public editingId = signal<string | null>(null);
  public isLoading = signal(false);

  public async loadProducts(): Promise<void> {
    const response = await lastValueFrom(this.productService.getAll());

    if (response.status === 200) {
      this.products.set(response.data || []);
    } else {
      this.snackbarService.error('Неуспешно зареждане на продукти.');
    }
  }

  public openForm(product?: Product): void {
    this.showForm.set(true);

    if (product) {
      this.editingId.set(product.id);
      this.formGroup.patchValue({
        name: product.name,
        sku: product.sku,
        category: product.category,
        unit: product.unit,
        minStockThreshold: product.minStockThreshold,
        minShelfLifeDays: product.minShelfLifeDays,
      });
    } else {
      this.editingId.set(null);
      this.formGroup.reset({ unit: 'pcs', minStockThreshold: 0, minShelfLifeDays: 0 });
    }
  }

  public closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.formGroup.reset({ unit: 'pcs', minStockThreshold: 0, minShelfLifeDays: 0 });
  }

  public async save(): Promise<void> {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();

      return;
    }

    this.isLoading.set(true);

    const body = {
      name: this.formGroup.controls.name.value!,
      sku: this.formGroup.controls.sku.value!,
      category: this.formGroup.controls.category.value || undefined,
      unit: this.formGroup.controls.unit.value || 'pcs',
      minStockThreshold: this.formGroup.controls.minStockThreshold.value || 0,
      minShelfLifeDays: this.formGroup.controls.minShelfLifeDays.value || 0,
    };

    if (this.editingId()) {
      const response = await lastValueFrom(this.productService.update(this.editingId()!, body));

      if (response.status === 200) {
        this.snackbarService.success('Продуктът е обновен.');
        this.closeForm();
        this.loadProducts();
      } else {
        this.snackbarService.error('Неуспешно обновяване на продукт.');
      }
    } else {
      const response = await lastValueFrom(this.productService.create(body));

      if (response.status === 201) {
        this.snackbarService.success('Продуктът е създаден.');
        this.closeForm();
        this.loadProducts();
      } else if (response.status === 409) {
        this.snackbarService.error('Вече съществува продукт с това SKU.');
      } else {
        this.snackbarService.error('Неуспешно създаване на продукт.');
      }
    }

    this.isLoading.set(false);
  }

  public async deleteProduct(id: string): Promise<void> {
    const response = await lastValueFrom(this.productService.delete(id));

    if (response.status === 200) {
      this.snackbarService.success('Продуктът е изтрит.');
      this.loadProducts();
    } else if (response.status === 409) {
      this.snackbarService.error('Не може да се изтрие — продуктът има активни партиди.');
    } else {
      this.snackbarService.error('Неуспешно изтриване на продукт.');
    }
  }

  public exportCsv(): void {
    this.exportService.downloadProductsCsv();
  }

  public hasError(controlName: string, errorName: string) {
    return this.formGroup.get(controlName)?.hasError(errorName) && this.formGroup.get(controlName)?.touched;
  }

  private createForm(): void {
    const formControls: FormControls = {
      name: this.formBuilder.control('', [Validators.required]),
      sku: this.formBuilder.control('', [Validators.required]),
      category: this.formBuilder.control(''),
      unit: this.formBuilder.control('pcs'),
      minStockThreshold: this.formBuilder.control(0),
      minShelfLifeDays: this.formBuilder.control(0),
    };

    this.formGroup = this.formBuilder.group(formControls);
  }

}
