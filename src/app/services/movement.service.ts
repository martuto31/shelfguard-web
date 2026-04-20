import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiResponse, HttpService } from './http.service';

import { StockMovement } from './../models/movement.model';

import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class MovementService {

  constructor(
    private httpService: HttpService) { }

  private apiUrl: string = environment.apiUrl;

  public getAll(): Observable<ApiResponse<StockMovement[]>> {
    const url = this.apiUrl + 'movements';

    return this.httpService.get(url);
  }

  public getRecent(limit: number): Observable<ApiResponse<StockMovement[]>> {
    const url = this.apiUrl + `movements?limit=${limit}`;

    return this.httpService.get(url);
  }

}
