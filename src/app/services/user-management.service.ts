import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiResponse, HttpService } from './http.service';

import { User, CreateUserBody, UpdateUserBody } from './../models/user.model';

import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class UserManagementService {

  constructor(
    private httpService: HttpService) { }

  private apiUrl: string = environment.apiUrl;

  public getAll(): Observable<ApiResponse<User[]>> {
    const url = this.apiUrl + 'users';

    return this.httpService.get(url);
  }

  public create(body: CreateUserBody): Observable<ApiResponse<User>> {
    const url = this.apiUrl + 'users';

    return this.httpService.post(url, body);
  }

  public update(id: string, body: UpdateUserBody): Observable<ApiResponse<User>> {
    const url = this.apiUrl + 'users/' + id;

    return this.httpService.put(url, body);
  }

}
