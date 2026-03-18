import { Injectable, signal } from '@angular/core';

import { lastValueFrom } from 'rxjs';

import { AuthService } from './auth.service';

import { User } from './../models/user.model';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  constructor(
    private authService: AuthService) { }

  public user = signal<User | null>(null);

  public async setUserFromDatabase(): Promise<number> {
    const request = this.authService.getUser();
    const response = await lastValueFrom(request);

    if (response.status === 200) {
      this.user.set(response.data!);
    }

    return response.status;
  }

  public isUserLogged(): boolean {
    const token = localStorage.getItem('accessToken')

    return !!token;
  }

  public logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    this.user.set(null);
  }

}
