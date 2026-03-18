import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackbarService {

  constructor(
    private snackBar: MatSnackBar,
  ) {}

  public success(message: string): void {
    this.snackBar.open(message, 'x', {
      duration: 3000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['snackbar-success'],
    });
  }

  public error(message: string): void {
    this.snackBar.open(message, 'x', {
      duration: 5000,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      panelClass: ['snackbar-error'],
    });
  }
}
