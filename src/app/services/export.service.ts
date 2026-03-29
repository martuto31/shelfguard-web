import { Injectable } from '@angular/core';

import { environment } from './../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ExportService {

  private apiUrl: string = environment.apiUrl;

  private download(path: string): void {
    const token = localStorage.getItem('accessToken');

    if (!token) return;

    window.open(`${this.apiUrl}${path}?authorization=${encodeURIComponent('Bearer ' + token)}`, '_blank');
  }

  public downloadAnalyticsPdf(): void {
    this.download('exports/analytics/pdf');
  }

  public downloadAnalyticsCsv(): void {
    this.download('exports/analytics/csv');
  }

  public downloadProductsCsv(): void {
    this.download('exports/products/csv');
  }

  public downloadBatchesCsv(): void {
    this.download('exports/batches/csv');
  }

}
