import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiResponse, HttpService } from './http.service';

import { ExpiredBatch, WriteOffItem } from './../models/write-off.model';

import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class WriteOffService {

  constructor(
    private httpService: HttpService) { }

  private apiUrl: string = environment.apiUrl;

  public getExpired(): Observable<ApiResponse<ExpiredBatch[]>> {
    const url = this.apiUrl + 'write-offs/expired';

    return this.httpService.get(url);
  }

  public confirm(items: WriteOffItem[]): Observable<ApiResponse<void>> {
    const url = this.apiUrl + 'write-offs/confirm';

    return this.httpService.post(url, { items });
  }

}
