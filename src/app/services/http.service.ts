import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';

import { catchError, map, Observable, of } from 'rxjs';

export interface ApiResponse<T> {
  data?: T;
  status: number;
  error?: string;
  networkError?: boolean;
}

interface HttpOptions {
  headers?: HttpHeaders;
  observe: 'response';
  responseType?: any;
}

@Injectable({
  providedIn: 'root'
})

export class HttpService {

  constructor(
    private httpClient: HttpClient) { }

  public get<Response>(url: string, responseType?: string, headers?: any): Observable<ApiResponse<Response>> {
    const options = { observe: 'response', responseType: responseType ?? 'json', headers: headers };

    return this.httpClient.get(url, options as HttpOptions)
      .pipe(
        map((response: HttpResponse<any>) => {
          return this.onSuccess<Response>(response);
        }),
        catchError((error: HttpErrorResponse) => {
          return this.onError<Response>(error);
        })
      );
  }

  public delete<Response>(url: string, headers?: any): Observable<ApiResponse<Response>> {
    const options = { observe: 'response', responseType: 'json', headers: headers };

    return this.httpClient.delete(url, options as HttpOptions)
      .pipe(
        map((response: HttpResponse<any>) => {
          return this.onSuccess<Response>(response);
        }),
        catchError((error: HttpErrorResponse) => {
          return this.onError<Response>(error);
        })
      );
  }

  public post<Body, Response>(url: string, body: Body, responseType?: string, headers?: any): Observable<ApiResponse<Response>> {
    const options = { observe: 'response', responseType: responseType ?? 'json', headers: headers };

    return this.httpClient.post(url, body, options as HttpOptions)
      .pipe(
        map((response: HttpResponse<any>) => {
          return this.onSuccess<Response>(response);
        }),
        catchError((error: HttpErrorResponse) => {
          return this.onError<Response>(error);
        })
      );
  }

  public put<Body, Response>(url: string, body: Body, headers?: any): Observable<ApiResponse<Response>> {
    const options = { observe: 'response', responseType: 'json', headers: headers };

    return this.httpClient.put(url, body, options as HttpOptions)
      .pipe(
        map((response: HttpResponse<any>) => {
          return this.onSuccess<Response>(response);
        }),
        catchError((error: HttpErrorResponse) => {
          return this.onError<Response>(error);
        })
      );
  }

  private onSuccess<Response>(response: HttpResponse<Response>): ApiResponse<Response> {
    this.setTokens(response.headers);

    const apiResponse: ApiResponse<Response> = {
      data: response.body ?? { } as Response,
      status: response.status,
    };

    return apiResponse;
  }

  private onError<Response>(error: HttpErrorResponse): Observable<ApiResponse<Response>> {
    const message = typeof error.error === 'string'
      ? error.error
      : error.error?.message ?? '';

    const apiResponse: ApiResponse<Response> = {
      data: { } as Response,
      status: error.status,
      error: message,
      networkError: error.status === 0,
    };

    return of(apiResponse);
  }

  private setTokens(headers: HttpHeaders): void {
    const accessToken = headers.get('Authorization-Access');
    const refreshToken = headers.get('Authorization-Refresh');

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

}
