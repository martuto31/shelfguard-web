import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiResponse, HttpService } from './http.service';

import { AnalyticsData } from './../models/analytics.model';

import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class AnalyticsService {

  constructor(
    private httpService: HttpService) { }

  private apiUrl: string = environment.apiUrl;

  public get(): Observable<ApiResponse<AnalyticsData>> {
    const url = this.apiUrl + 'analytics';

    return this.httpService.get(url);
  }

}
