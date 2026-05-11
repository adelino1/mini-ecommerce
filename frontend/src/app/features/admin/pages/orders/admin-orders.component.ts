import { Component, OnInit, signal, inject } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../core/models/interfaces';
import { I18nService } from '../../../../core/services/i18n.service';
import { CurrencyService } from '../../../../core/services/currency.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  template: `
    <div class="admin-orders">
      <div class="page-head">
        <h1>{{ i18n.t('admin.orders') }}</h1>
      </div>

      <div class="orders-list">
        <table class="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{{ i18n.t('order.customer') }}</th>
              <th>{{ i18n.t('order.total') }}</th>
              <th>{{ i18n.t('order.status') }}</th>
              <th>{{ i18n.t('order.date') }}</th>
              <th>{{ i18n.t('admin.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders(); track order.id) {
              <tr>
                <td>{{ order.id }}</td>
                <td>{{ order.user_name }}</td>
                <td>
                  @if (currency.rate() > 0) {
                    {{ toAoa(order.total) | number:'1.0-0' }} Kz
                  } @else {
                    ...
                  }
                </td>
                <td>
                  <select [value]="order.status" (change)="updateStatus(order, $event)">
                    <option value="pending">{{ i18n.t('status.pending') }}</option>
                    <option value="processing">Processando</option>
                    <option value="shipped">{{ i18n.t('status.shipped') }}</option>
                    <option value="delivered">{{ i18n.t('status.delivered') }}</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </td>
                <td>{{ order.created_at | date:'short' }}</td>
                <td>
                  <button (click)="viewOrder(order)" class="btn-secondary">{{ i18n.t('admin.view') }}</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-orders { padding: 2rem; }
    .page-head { margin-bottom: 2rem; }
    .orders-table { width: 100%; border-collapse: collapse; }
    @media (max-width: 768px) {
      .orders-table { font-size: 0.9rem; }
      .orders-table th, .orders-table td { padding: 0.5rem; }
    }
    .orders-table th, .orders-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
    .btn-secondary { background: #6c757d; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  currency = inject(CurrencyService);

  constructor(
    private orderService: OrderService,
    public i18n: I18nService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currency.ensureRateLoaded();
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getAll().subscribe(res => {
      this.orders.set(res.data);
    });
  }

  updateStatus(order: Order, event: Event) {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as Order['status'];
    this.orderService.updateStatus(order.id, newStatus).subscribe(() => {
      order.status = newStatus;
    });
  }

  viewOrder(order: Order) {
    this.router.navigate(['/orders', order.id]);
  }

  toAoa(valueEur: number): number {
    return this.currency.toAoa(valueEur);
  }
}