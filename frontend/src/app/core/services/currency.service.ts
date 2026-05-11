import { Injectable, signal } from '@angular/core';
import { ExternalApiService } from './external-api.service';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  // Fallback fixo para nunca ficar sem preço em Kwanza.
  private readonly fallbackRate = 950;
  private aoaRate = signal<number>(this.fallbackRate);
  rate = this.aoaRate.asReadonly();
  private loaded = false;

  constructor(private externalApi: ExternalApiService) {}

  ensureRateLoaded() {
    if (this.loaded) return;
    this.loaded = true;
    this.externalApi.getRates('EUR', 'AOA').subscribe({
      next: res => {
        const rate = Number(res.data?.rates?.['AOA'] ?? 0);
        if (rate > 0) this.aoaRate.set(rate);
      },
      error: () => {
        // Mantém fallback em caso de erro.
        this.aoaRate.set(this.fallbackRate);
        this.loaded = false;
      }
    });
  }

  toAoa(valueEur: number): number {
    const rate = this.aoaRate();
    return Number(valueEur) * rate;
  }

  getCurrentRate(): number {
    return this.aoaRate();
  }
}
