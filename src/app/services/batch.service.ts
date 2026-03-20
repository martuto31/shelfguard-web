import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiResponse, HttpService } from './http.service';

import { Batch, CreateBatchBody } from './../models/batch.model';

import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class BatchService {

  constructor(
    private httpService: HttpService) { }

  private apiUrl: string = environment.apiUrl;

  public create(body: CreateBatchBody): Observable<ApiResponse<Batch>> {
    const url = this.apiUrl + 'batches';

    return this.httpService.post(url, body);
  }

  public update(id: string, body: Partial<Batch>): Observable<ApiResponse<Batch>> {
    const url = this.apiUrl + 'batches/' + id;

    return this.httpService.put(url, body);
  }

  public getExpiring(days: number = 30): Observable<ApiResponse<Batch[]>> {
    const url = this.apiUrl + 'batches/expiring?days=' + days;

    return this.httpService.get(url);
  }

}
