import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { lastValueFrom } from 'rxjs';

import { UserManagementService } from './../../services/user-management.service';
import { UserService } from './../../services/user.service';
import { SnackbarService } from './../../services/snackbar.service';

import { Role, User } from './../../models/user.model';

interface FormControls {
  name: FormControl<string | null>;
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  role: FormControl<string | null>;
}

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrl: './users.component.css',
    imports: [
        ReactiveFormsModule,
    ]
})

export class UsersComponent {

  constructor(
    private formBuilder: FormBuilder,
    private userManagementService: UserManagementService,
    private userService: UserService,
    private snackbarService: SnackbarService) {

    this.createForm();
    this.loadUsers();
  }

  public users = signal<User[]>([]);
  public formGroup!: FormGroup<FormControls>;
  public showForm = signal(false);
  public editingId = signal<string | null>(null);
  public isLoading = signal(false);

  public async loadUsers(): Promise<void> {
    const response = await lastValueFrom(this.userManagementService.getAll());

    if (response.status === 200) {
      this.users.set(response.data || []);
    } else {
      this.snackbarService.error('Неуспешно зареждане на потребители.');
    }
  }

  public openForm(user?: User): void {
    this.showForm.set(true);

    if (user) {
      this.editingId.set(user.id);
      this.formGroup.controls.email.clearValidators();
      this.formGroup.controls.password.clearValidators();
      this.formGroup.controls.email.updateValueAndValidity();
      this.formGroup.controls.password.updateValueAndValidity();
      this.formGroup.patchValue({
        name: user.name,
        role: user.role,
      });
    } else {
      this.editingId.set(null);
      this.formGroup.controls.email.setValidators([Validators.required, Validators.email]);
      this.formGroup.controls.password.setValidators([Validators.required]);
      this.formGroup.controls.email.updateValueAndValidity();
      this.formGroup.controls.password.updateValueAndValidity();
      this.formGroup.reset({ role: 'MANAGER' });
    }
  }

  public closeForm(): void {
    this.showForm.set(false);
    this.editingId.set(null);
    this.formGroup.reset({ role: 'MANAGER' });
  }

  public async save(): Promise<void> {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();

      return;
    }

    this.isLoading.set(true);

    if (this.editingId()) {
      const body = {
        name: this.formGroup.controls.name.value!,
        role: this.formGroup.controls.role.value! as Role,
      };

      const response = await lastValueFrom(this.userManagementService.update(this.editingId()!, body));

      if (response.status === 200) {
        this.snackbarService.success('Потребителят е обновен.');
        this.closeForm();
        this.loadUsers();
      } else {
        this.snackbarService.error(response.error || 'Неуспешно обновяване.');
      }
    } else {
      const body = {
        name: this.formGroup.controls.name.value!,
        email: this.formGroup.controls.email.value!,
        password: this.formGroup.controls.password.value!,
        role: this.formGroup.controls.role.value! as Role,
      };

      const response = await lastValueFrom(this.userManagementService.create(body));

      if (response.status === 201) {
        this.snackbarService.success('Потребителят е създаден.');
        this.closeForm();
        this.loadUsers();
      } else if (response.status === 409) {
        this.snackbarService.error('Вече съществува потребител с този имейл.');
      } else {
        this.snackbarService.error('Неуспешно създаване на потребител.');
      }
    }

    this.isLoading.set(false);
  }

  public async toggleActive(user: User): Promise<void> {
    const response = await lastValueFrom(
      this.userManagementService.update(user.id, { active: !user.active }),
    );

    if (response.status === 200) {
      this.snackbarService.success(user.active ? 'Потребителят е деактивиран.' : 'Потребителят е активиран.');
      this.loadUsers();
    } else {
      this.snackbarService.error(response.error || 'Неуспешна операция.');
    }
  }

  public isSelf(user: User): boolean {
    return user.id === this.userService.user()?.id;
  }

  public getRoleLabel(role: Role): string {
    switch (role) {
      case Role.OWNER: return 'Собственик';
      case Role.MANAGER: return 'Мениджър';
      case Role.WORKER: return 'Работник';
    }
  }

  public hasError(controlName: string, errorName: string) {
    return this.formGroup.get(controlName)?.hasError(errorName) && this.formGroup.get(controlName)?.touched;
  }

  private createForm(): void {
    const formControls: FormControls = {
      name: this.formBuilder.control('', [Validators.required]),
      email: this.formBuilder.control('', [Validators.required, Validators.email]),
      password: this.formBuilder.control('', [Validators.required]),
      role: this.formBuilder.control('MANAGER'),
    };

    this.formGroup = this.formBuilder.group(formControls);
  }

}
