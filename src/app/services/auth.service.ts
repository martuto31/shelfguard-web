import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiResponse, HttpService } from './http.service';

import { LoginBody, RegisterBody, User } from './../models/user.model';

import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(
    private httpService: HttpService) { }

  private apiUrl: string = environment.apiUrl;

  public register(body: RegisterBody): Observable<ApiResponse<void>> {
    const url = this.apiUrl + 'auth/register';

    return this.httpService.post(url, body);
  }

  public login(body: LoginBody): Observable<ApiResponse<void>> {
    const url = this.apiUrl + 'auth/login';

    return this.httpService.post(url, body);
  }

  public getUser(): Observable<ApiResponse<User>> {
    const url = this.apiUrl + 'auth/user';

    return this.httpService.get(url);
  }

}
