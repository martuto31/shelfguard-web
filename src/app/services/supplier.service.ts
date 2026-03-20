import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiResponse, HttpService } from './http.service';

import { Supplier, CreateSupplierBody } from './../models/supplier.model';

import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class SupplierService {

  constructor(
    private httpService: HttpService) { }

  private apiUrl: string = environment.apiUrl;

  public getAll(): Observable<ApiResponse<Supplier[]>> {
    const url = this.apiUrl + 'suppliers';

    return this.httpService.get(url);
  }

  public create(body: CreateSupplierBody): Observable<ApiResponse<Supplier>> {
    const url = this.apiUrl + 'suppliers';

    return this.httpService.post(url, body);
  }

  public update(id: string, body: CreateSupplierBody): Observable<ApiResponse<Supplier>> {
    const url = this.apiUrl + 'suppliers/' + id;

    return this.httpService.put(url, body);
  }

}
