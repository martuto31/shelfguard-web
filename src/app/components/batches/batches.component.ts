import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { lastValueFrom } from 'rxjs';

import { BatchService } from './../../services/batch.service';
import { ExportService } from './../../services/export.service';
import { ProductService } from './../../services/product.service';
import { SnackbarService } from './../../services/snackbar.service';
import { SupplierService } from './../../services/supplier.service';

import { Batch } from './../../models/batch.model';
import { Product } from './../../models/product.model';
import { Supplier } from './../../models/supplier.model';

interface FormControls {
  productId: FormControl<string | null>;
  batchNumber: FormControl<string | null>;
  quantity: FormControl<number | null>;
  expiryDate: FormControl<string | null>;
  supplierId: FormControl<string | null>;
  notes: FormControl<string | null>;
}

@Component({
    selector: 'app-batches',
    templateUrl: './batches.component.html',
    styleUrl: './batches.component.css',
    imports: [
        ReactiveFormsModule,
        DatePipe,
    ]
})

export class BatchesComponent {

  constructor(
    private formBuilder: FormBuilder,
    private exportService: ExportService,
    private productService: ProductService,
    private supplierService: SupplierService,
    private batchService: BatchService,
    private snackbarService: SnackbarService) {

    this.createForm();
    this.loadProducts();
    this.loadSuppliers();
  }

  public products = signal<Product[]>([]);
  public suppliers = signal<Supplier[]>([]);
  public batches = signal<Batch[]>([]);
  public formGroup!: FormGroup<FormControls>;
  public showForm = signal(false);
  public isLoading = signal(false);
  public selectedProductId = signal('');

  public async loadProducts(): Promise<void> {
    const response = await lastValueFrom(this.productService.getAll());

    if (response.status === 200) {
      this.products.set(response.data || []);
    } else {
      this.snackbarService.error('Неуспешно зареждане на продукти.');
    }
  }

  public async loadSuppliers(): Promise<void> {
    const response = await lastValueFrom(this.supplierService.getAll());

    if (response.status === 200) {
      this.suppliers.set(response.data || []);
    } else {
      this.snackbarService.error('Неуспешно зареждане на доставчици.');
    }
  }

  public async loadBatches(productId: string): Promise<void> {
    if (!productId) {
      this.batches.set([]);

      return;
    }

    const response = await lastValueFrom(this.productService.getBatches(productId));

    if (response.status === 200) {
      this.batches.set(response.data || []);
    } else {
      this.snackbarService.error('Неуспешно зареждане на партиди.');
    }
  }

  public onProductChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedProductId.set(select.value);
    this.loadBatches(this.selectedProductId());
  }

  public openForm(): void {
    this.showForm.set(true);
    this.formGroup.reset();

    if (this.selectedProductId()) {
      this.formGroup.patchValue({ productId: this.selectedProductId() });
    }
  }

  public closeForm(): void {
    this.showForm.set(false);
    this.formGroup.reset();
  }

  public async save(): Promise<void> {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();

      return;
    }

    this.isLoading.set(true);

    const body = {
      productId: this.formGroup.controls.productId.value!,
      batchNumber: this.formGroup.controls.batchNumber.value!,
      quantity: this.formGroup.controls.quantity.value!,
      expiryDate: this.formGroup.controls.expiryDate.value!,
      supplierId: this.formGroup.controls.supplierId.value || undefined,
      notes: this.formGroup.controls.notes.value || undefined,
    };

    const response = await lastValueFrom(this.batchService.create(body));

    if (response.status === 201) {
      this.snackbarService.success('Партидата е приета. Наличността е обновена.');
      this.closeForm();
      this.selectedProductId.set(body.productId);
      this.loadBatches(this.selectedProductId());
    } else {
      this.snackbarService.error('Неуспешно приемане на партида.');
    }

    this.isLoading.set(false);
  }

  public getProductName(batch: Batch): string {
    if (typeof batch.productId === 'object') {
      return (batch.productId as Product).name;
    }

    const product = this.products().find(p => p.id === batch.productId);

    return product ? product.name : '';
  }

  public getSupplierName(batch: Batch): string {
    if (typeof batch.supplierId === 'object' && batch.supplierId) {
      return (batch.supplierId as Supplier).name;
    }

    if (!batch.supplierId) {
      return '—';
    }

    const supplier = this.suppliers().find(s => s.id === batch.supplierId);

    return supplier ? supplier.name : '—';
  }

  public getBatchStatusClass(batch: Batch): string {
    if (batch.quantityRemaining <= 0) {
      return 'depleted';
    }

    const days = this.getDaysUntilExpiry(batch);

    if (days <= 0) {
      return 'expired';
    }

    if (days <= 30) {
      return 'critical';
    }

    if (days <= 60) {
      return 'warning';
    }

    return 'good';
  }

  public getBatchStatusLabel(batch: Batch): string {
    const statusMap: Record<string, string> = {
      depleted: 'Изчерпано',
      expired: 'Изтекло',
      critical: 'Критично',
      warning: 'Внимание',
      good: 'Добро',
    };

    return statusMap[this.getBatchStatusClass(batch)];
  }

  private getDaysUntilExpiry(batch: Batch): number {
    const now = new Date();
    const expiry = new Date(batch.expiryDate);

    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  public exportCsv(): void {
    this.exportService.downloadBatchesCsv();
  }

  public hasError(controlName: string, errorName: string) {
    return this.formGroup.get(controlName)?.hasError(errorName) && this.formGroup.get(controlName)?.touched;
  }

  private createForm(): void {
    const formControls: FormControls = {
      productId: this.formBuilder.control('', [Validators.required]),
      batchNumber: this.formBuilder.control('', [Validators.required]),
      quantity: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(1)]),
      expiryDate: this.formBuilder.control('', [Validators.required]),
      supplierId: this.formBuilder.control(''),
      notes: this.formBuilder.control(''),
    };

    this.formGroup = this.formBuilder.group(formControls);
  }

}
