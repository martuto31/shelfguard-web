import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiResponse, HttpService } from './http.service';

import { Product, CreateProductBody } from './../models/product.model';
import { Batch } from './../models/batch.model';

import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ProductService {

  constructor(
    private httpService: HttpService) { }

  private apiUrl: string = environment.apiUrl;

  public getAll(): Observable<ApiResponse<Product[]>> {
    const url = this.apiUrl + 'products';

    return this.httpService.get(url);
  }

  public create(body: CreateProductBody): Observable<ApiResponse<Product>> {
    const url = this.apiUrl + 'products';

    return this.httpService.post(url, body);
  }

  public update(id: string, body: CreateProductBody): Observable<ApiResponse<Product>> {
    const url = this.apiUrl + 'products/' + id;

    return this.httpService.put(url, body);
  }

  public delete(id: string): Observable<ApiResponse<void>> {
    const url = this.apiUrl + 'products/' + id;

    return this.httpService.delete(url);
  }

  public getBatches(id: string): Observable<ApiResponse<Batch[]>> {
    const url = this.apiUrl + 'products/' + id + '/batches';

    return this.httpService.get(url);
  }

}
