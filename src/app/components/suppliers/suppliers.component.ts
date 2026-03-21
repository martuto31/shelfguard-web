import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { lastValueFrom } from 'rxjs';

import { SupplierService } from './../../services/supplier.service';
import { SnackbarService } from './../../services/snackbar.service';

import { Supplier } from './../../models/supplier.model';

interface FormControls {
  name: FormControl<string | null>;
  contactPerson: FormControl<string | null>;
  phone: FormControl<string | null>;
  email: FormControl<string | null>;
}

@Component({
    selector: 'app-suppliers',
    templateUrl: './suppliers.component.html',
    styleUrl: './suppliers.component.css',
    imports: [
        ReactiveFormsModule,
    ]
})

export class SuppliersComponent {

  constructor(
    private formBuilder: FormBuilder,
    private supplierService: SupplierService,
    private snackbarService: SnackbarService) {

    this.createForm();
    this.loadSuppliers();
  }

  public suppliers = signal<Supplier[]>([]);
  public formGroup!: FormGroup<FormControls>;
  public showForm = signal(false);
  public editingId = signal<string | null>(null);
  public isLoading = signal(false);

  public async loadSuppliers(): Promise<void> {
    const response = await lastValueFrom(this.supplierService.getAll());

    if (response.status === 200) {
      this.suppliers.set(response.data || []);
    } else {
      this.snackbarService.error('Неуспешно зареждане на доставчици.');
    }
  }

  public openForm(supplier?: Supplier): void {
    this.showForm.set(true);

    if (supplier) {
      this.editingId.set(supplier.id);
      this.formGroup.patchValue({
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
      });
    } else {
      this.editingId.set(null);
      this.formGroup.reset();
    }
  }

  public closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.formGroup.reset();
  }

  public async save(): Promise<void> {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();

      return;
    }

    this.isLoading.set(true);

    const body = {
      name: this.formGroup.controls.name.value!,
      contactPerson: this.formGroup.controls.contactPerson.value || undefined,
      phone: this.formGroup.controls.phone.value || undefined,
      email: this.formGroup.controls.email.value || undefined,
    };

    if (this.editingId()) {
      const response = await lastValueFrom(this.supplierService.update(this.editingId()!, body));

      if (response.status === 200) {
        this.snackbarService.success('Доставчикът е обновен.');
        this.closeForm();
        this.loadSuppliers();
      } else {
        this.snackbarService.error('Неуспешно обновяване на доставчик.');
      }
    } else {
      const response = await lastValueFrom(this.supplierService.create(body));

      if (response.status === 201) {
        this.snackbarService.success('Доставчикът е създаден.');
        this.closeForm();
        this.loadSuppliers();
      } else {
        this.snackbarService.error('Неуспешно създаване на доставчик.');
      }
    }

    this.isLoading.set(false);
  }

  public hasError(controlName: string, errorName: string) {
    return this.formGroup.get(controlName)?.hasError(errorName) && this.formGroup.get(controlName)?.touched;
  }

  private createForm(): void {
    const formControls: FormControls = {
      name: this.formBuilder.control('', [Validators.required]),
      contactPerson: this.formBuilder.control(''),
      phone: this.formBuilder.control(''),
      email: this.formBuilder.control(''),
    };

    this.formGroup = this.formBuilder.group(formControls);
  }

}
