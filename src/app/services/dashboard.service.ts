import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiResponse, HttpService } from './http.service';

import { DashboardData } from './../models/dashboard.model';

import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class DashboardService {

  constructor(
    private httpService: HttpService) { }

  private apiUrl: string = environment.apiUrl;

  public get(): Observable<ApiResponse<DashboardData>> {
    const url = this.apiUrl + 'dashboard';

    return this.httpService.get(url);
  }

}
