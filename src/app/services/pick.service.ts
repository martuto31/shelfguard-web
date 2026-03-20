import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiResponse, HttpService } from './http.service';

import { PickResult, PickSuggestion } from './../models/batch.model';

import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class PickService {

  constructor(
    private httpService: HttpService) { }

  private apiUrl: string = environment.apiUrl;

  public suggest(productId: string, quantity: number): Observable<ApiResponse<PickResult>> {
    const url = this.apiUrl + 'picks/suggest';

    return this.httpService.post(url, { productId, quantity });
  }

  public confirm(productId: string, suggestions: PickSuggestion[]): Observable<ApiResponse<void>> {
    const url = this.apiUrl + 'picks/confirm';

    return this.httpService.post(url, { productId, suggestions });
  }

}
