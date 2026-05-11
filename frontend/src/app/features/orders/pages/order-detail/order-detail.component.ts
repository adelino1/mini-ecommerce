import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Order } from '../../../../core/models/interfaces';
import { OrderService } from '../../../../core/services/order.service';
import { CurrencyService } from '../../../../core/services/currency.service';

@Component({
  standalone: true,
  imports: [DecimalPipe, DatePipe, RouterLink],
  template: `
    <div class="order-detail">
      <a routerLink="/orders">← Voltar</a>
      @if (loading()) {
        <p>A carregar...</p>
      } @else if (!order()) {
        <p>Pedido não encontrado.</p>
      } @else {
        <h1>Pedido #{{ order()!.id }}</h1>
        <p>Estado: {{ order()!.status }}</p>
        <p>Data: {{ order()!.created_at | date:'short' }}</p>
        <h3>Itens</h3>
        <ul>
          @for (item of order()!.items || []; track item.id) {
            <li>
              {{ item.product_name }} - {{ item.quantity }} x
              @if (currency.rate() > 0) {
                <strong>{{ toAoa(item.unit_price) | number:'1.0-0' }} Kz</strong>
              } @else {
                ...
              }
            </li>
          }
        </ul>
        @if (currency.rate() > 0) {
          <h3>Total: {{ toAoa(order()!.total) | number:'1.0-0' }} Kz</h3>
        } @else {
          <h3>Total: ...</h3>
        }
      }
    </div>
  `
})
export class OrderDetailComponent {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  currency = inject(CurrencyService);
  order = signal<Order | null>(null);
  loading = signal(true);

  constructor() {
    this.currency.ensureRateLoaded();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.orderService.getOrder(id).subscribe({
      next: res => {
        this.order.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  toAoa(valueEur: number): number {
    return this.currency.toAoa(valueEur);
  }
}