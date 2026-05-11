import { Component, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Order } from '../../../../core/models/interfaces';
import { OrderService } from '../../../../core/services/order.service';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  standalone: true,
  imports: [DecimalPipe, DatePipe, RouterLink],
  template: `
    <div class="orders-page">
      <div class="head">
        <h1>Os Meus Pedidos</h1>
        @if (auth.isAdmin()) {
          <button class="btn-export" (click)="exportCsv()">Exportar CSV</button>
        }
      </div>
      @if (loading()) {
        <p>A carregar...</p>
      } @else if (orders().length === 0) {
        <p>Sem pedidos.</p>
      } @else {
        <table>
          <thead>
            <tr>
              <th>ID</th>
              @if (auth.isAdmin()) { <th>Cliente</th> }
              <th>Total</th>
              <th>Estado</th>
              <th>Data</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (order of orders(); track order.id) {
              <tr>
                <td>#{{ order.id }}</td>
                @if (auth.isAdmin()) { <td>{{ order.user_name || '-' }}</td> }
                <td>{{ order.total | number:'1.2-2' }} €</td>
                <td>{{ order.status }}</td>
                <td>{{ order.created_at | date:'short' }}</td>
                <td><a [routerLink]="['/orders', order.id]">Ver</a></td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `,
  styles: [`
    .orders-page { max-width: 920px; margin: 0 auto; }
    .head { display: flex; justify-content: space-between; align-items: center; }
    .btn-export { background: #0d6efd; color: #fff; border: none; padding: 0.5rem 0.8rem; border-radius: 4px; cursor: pointer; }
    table { width: 100%; border-collapse: collapse; background: var(--surface); }
    th, td { padding: 0.7rem; border-bottom: 1px solid var(--border); text-align: left; }
  `]
})
export class OrderListComponent {
  private orderService = inject(OrderService);
  auth = inject(AuthService);
  orders = signal<Order[]>([]);
  loading = signal(true);
  exportUrl = `${environment.apiUrl}/orders/export.php`;

  constructor() {
    this.orderService.listOrders().subscribe({
      next: res => {
        this.orders.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  exportCsv() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    fetch(this.exportUrl, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Falha no download');
        return res.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch(() => {});
  }
}