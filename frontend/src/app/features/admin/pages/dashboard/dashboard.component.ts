import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ExternalApiService } from '../../../../core/services/external-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <h1>Admin Dashboard</h1>
    <p>Taxas de câmbio (API externa Frankfurter)</p>
    @if (loading()) {
      <p>A carregar taxas...</p>
    } @else {
      <ul>
        @for (code of currencies(); track code) {
          <li>1 EUR = {{ rates()[code] | number:'1.2-4' }} {{ code }}</li>
        }
      </ul>
    }
  `
})
export class DashboardComponent {
  private externalApi = inject(ExternalApiService);
  loading = signal(true);
  rates = signal<Record<string, number>>({});
  currencies = signal<string[]>([]);

  constructor() {
    this.externalApi.getRates('EUR', 'USD,GBP,BRL').subscribe({
      next: res => {
        this.rates.set(res.data.rates || {});
        this.currencies.set(Object.keys(res.data.rates || {}));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}