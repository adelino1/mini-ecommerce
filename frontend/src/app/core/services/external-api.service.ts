import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models/interfaces';

interface RatesData {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class ExternalApiService {
  constructor(private api: ApiService) {}

  getRates(base = 'EUR', symbols = 'USD,GBP'): Observable<ApiResponse<RatesData>> {
    return this.api.get<RatesData>(`external/rates.php?base=${base}&symbols=${symbols}`);
  }
}
