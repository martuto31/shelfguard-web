import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { lastValueFrom } from 'rxjs';

import { AuthService } from './../../../services/auth.service';
import { UserService } from './../../../services/user.service';
import { SnackbarService } from './../../../services/snackbar.service';

interface FormControls {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    imports: [
        ReactiveFormsModule,
    ]
})

export class LoginComponent {

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private snackbarService: SnackbarService) {

    this.createForm();
  }

  public formGroup!: FormGroup<FormControls>;
  public isLoading = signal(false);

  public async login(): Promise<void> {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();

      return;
    }

    this.isLoading.set(true);

    const body = {
      email: this.formGroup.controls.email.value!,
      password: this.formGroup.controls.password.value!.trim(),
    };

    const request = this.authService.login(body);
    const response = await lastValueFrom(request);

    switch (response.status) {
      case 200:
        this.userService.setUserFromDatabase();
        this.router.navigate([ '/dashboard' ]);
        break;
      case 401:
        this.snackbarService.error('Невалиден имейл или парола.');
        break;
      default:
        this.snackbarService.error('Нещо се обърка. Опитайте отново.');
    }

    this.isLoading.set(false);
  }

  public hasError(controlName: string, errorName: string) {
    return this.formGroup.get(controlName)?.hasError(errorName) && this.formGroup.get(controlName)?.touched;
  }

  private createForm() {
    const formControls: FormControls = {
      email: this.formBuilder.control('', [ Validators.required, Validators.pattern(/^[a-zA-Z0-9_\.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-\.]+$/) ]),
      password: this.formBuilder.control('', [ Validators.required ]),
    };

    this.formGroup = this.formBuilder.group(formControls);
  }

}
