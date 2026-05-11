import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ExternalApiService } from '../../../../core/services/external-api.service';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { OrderService } from '../../../../core/services/order.service';
import { Order, Product } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, DatePipe, RouterLink],
  template: `
    <section class="admin-dashboard">
      <div class="page-head">
        <div>
          <h1>Painel de Administração</h1>
          <p>Resumo do catálogo, pedidos e taxas de câmbio em tempo real.</p>
        </div>
        <button (click)="loadDashboard()" [disabled]="loading()">Atualizar</button>
      </div>

      <div class="quick-actions">
        <a routerLink="/admin/products" class="panel action">Gerir Produtos</a>
        <a routerLink="/admin/categories" class="panel action">Gerir Categorias</a>
        <a routerLink="/admin/orders" class="panel action">Gerir Pedidos</a>
      </div>

      @if (loading()) {
        <div class="panel">A carregar métricas...</div>
      } @else {
        <div class="kpis">
          <article class="panel">
            <h3>Produtos ativos</h3>
            <p class="kpi">{{ totalProducts() }}</p>
          </article>
          <article class="panel">
            <h3>Categorias</h3>
            <p class="kpi">{{ totalCategories() }}</p>
          </article>
          <article class="panel">
            <h3>Pedidos</h3>
            <p class="kpi">{{ totalOrders() }}</p>
          </article>
          <article class="panel">
            <h3>Receita (acumulada)</h3>
            @if (aoaRate() > 0) {
              <p class="kpi">{{ revenueAoa() | number:'1.0-0' }} Kz</p>
            } @else {
              <p class="kpi">A carregar...</p>
            }
          </article>
        </div>

        <div class="two-columns">
          <article class="panel">
            <h3>Pedidos recentes</h3>
            @if (recentOrders().length === 0) {
              <p>Sem pedidos registados.</p>
            } @else {
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  @for (order of recentOrders(); track order.id) {
                    <tr>
                      <td><a [routerLink]="['/orders', order.id]">#{{ order.id }}</a></td>
                      <td>{{ order.user_name || '—' }}</td>
                      <td>{{ order.status }}</td>
                      <td>
                        @if (aoaRate() > 0) {
                          <strong>{{ toAoa(order.total) | number:'1.0-0' }} Kz</strong>
                        } @else {
                          ...
                        }
                      </td>
                      <td>{{ order.created_at | date:'short' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </article>

          <article class="panel">
            <h3>Taxa de câmbio para Kwanza</h3>
            @if (currencies().length === 0) {
              <p>Não foi possível carregar as taxas agora.</p>
            } @else {
              <ul class="rates">
                @for (code of currencies(); track code) {
                  <li>1 EUR = {{ rates()[code] | number:'1.2-4' }} {{ code }}</li>
                }
              </ul>
            }
            <h4>Alertas</h4>
            @if (lowStockProducts().length === 0) {
              <p>Sem alertas de stock baixo.</p>
            } @else {
              <ul class="alerts">
                @for (p of lowStockProducts(); track p.id) {
                  <li>{{ p.name }} - stock: {{ p.stock }}</li>
                }
              </ul>
            }
          </article>
        </div>
      }
    </section>
  `,
  styles: [`
    .admin-dashboard { max-width: 1100px; margin: 0 auto; display: grid; gap: 1rem; }
    .page-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
    .page-head p { margin: 0.25rem 0 0; color: var(--muted); }
    .page-head button { border: none; background: #0d6efd; color: #fff; padding: 0.55rem 0.9rem; border-radius: 6px; cursor: pointer; }
    .page-head button:disabled { opacity: 0.7; cursor: not-allowed; }
    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .quick-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .action { text-decoration: none; color: var(--text); font-weight: 600; display: block; }
    .action:hover { border-color: #0d6efd; }
    .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; }
    .kpi { font-size: 1.6rem; margin: 0.5rem 0 0; font-weight: 700; }
    .sub-kpi { margin: 0.3rem 0 0; color: #0d6efd; font-weight: 600; }
    .two-columns { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.93rem; }
    th, td { padding: 0.55rem; border-bottom: 1px solid var(--border); text-align: left; }
    .rates, .alerts { margin: 0.6rem 0 0; padding-left: 1rem; }
    .alerts li { color: #a13a00; font-weight: 600; }
    @media (max-width: 980px) {
      .kpis { grid-template-columns: repeat(2, 1fr); }
      .quick-actions { grid-template-columns: 1fr; }
      .two-columns { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private externalApi = inject(ExternalApiService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private orderService = inject(OrderService);
  loading = signal(true);
  rates = signal<Record<string, number>>({});
  currencies = signal<string[]>([]);
  totalProducts = signal(0);
  totalCategories = signal(0);
  totalOrders = signal(0);
  revenueEur = signal(0);
  revenueAoa = signal(0);
  aoaRate = signal(0);
  recentOrders = signal<Order[]>([]);
  lowStockProducts = signal<Product[]>([]);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);
    forkJoin({
      rates: this.externalApi.getRates('EUR', 'AOA,USD,GBP,BRL'),
      products: this.productService.getProducts({ page: 1, limit: 200 }),
      categories: this.categoryService.getCategories(),
      orders: this.orderService.listOrders()
    }).subscribe({
      next: ({ rates, products, categories, orders }) => {
        const ratesData = rates.data?.rates || {};
        this.rates.set(ratesData);
        this.currencies.set(Object.keys(ratesData));

        const aoa = Number(ratesData['AOA'] || 0);
        this.aoaRate.set(aoa);

        const productRows = products.data?.products || [];
        this.totalProducts.set(products.data?.total || productRows.length);
        this.lowStockProducts.set(productRows.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).slice(0, 6));

        this.totalCategories.set(categories.data?.length || 0);

        const orderRows = orders.data || [];
        this.totalOrders.set(orderRows.length);
        this.recentOrders.set(orderRows.slice(0, 8));
        const revenue = orderRows.reduce((sum, o) => sum + Number(o.total || 0), 0);
        this.revenueEur.set(revenue);
        this.revenueAoa.set(aoa > 0 ? revenue * aoa : 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  toAoa(valueEur: number): number {
    return Number(valueEur) * Number(this.aoaRate() || 0);
  }
}