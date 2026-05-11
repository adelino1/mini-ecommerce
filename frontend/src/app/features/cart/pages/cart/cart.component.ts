import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="cart-container">
      <h2>O Meu Carrinho</h2>

      @if (cart.items().length === 0) {
        <div class="empty">
          <p>O seu carrinho está vazio.</p>
          <a routerLink="/shop" class="btn-shop">Ir às compras</a>
        </div>
      } @else {
        <div class="cart-content">
          <div class="cart-items">
            @for (item of cart.items(); track item.product_id) {
              <div class="cart-item">
                <div class="item-image">
                  @if (item.image_url) {
                    <img [src]="item.image_url" [alt]="item.name"/>
                  } @else {
                    <div class="img-placeholder">{{ item.name[0] }}</div>
                  }
                </div>
                <div class="item-info">
                  <h4>{{ item.name }}</h4>
                  <p class="unit-price">{{ item.price | number:'1.2-2' }} € / unidade</p>
                </div>
                <div class="item-qty">Qtd: {{ item.quantity }}</div>
                <div class="item-subtotal">{{ item.subtotal | number:'1.2-2' }} €</div>
                <button class="btn-remove" (click)="removeItem(item.product_id)">
                  ✕
                </button>
              </div>
            }
          </div>

          <div class="cart-summary">
            <h3>Resumo</h3>
            <div class="summary-row">
              <span>Itens ({{ cart.count() }})</span>
              <span>{{ cart.total() | number:'1.2-2' }} €</span>
            </div>
            <div class="summary-total">
              <span>Total</span>
              <span>{{ cart.total() | number:'1.2-2' }} €</span>
            </div>
            <a routerLink="/checkout" class="btn-checkout">
              Finalizar Compra
            </a>
            <a routerLink="/shop" class="btn-continue">
              Continuar a Comprar
            </a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-container { max-width: 900px; margin: 0 auto; }
    h2 { margin-bottom: 1.5rem; color: #333; }

    .empty {
      text-align: center;
      padding: 3rem;
      color: #888;
    }
    .btn-shop {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.7rem 1.5rem;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }

    .cart-content {
      display: grid;
      grid-template-columns: 1fr 280px;
      gap: 2rem;
      align-items: start;
    }

    .cart-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      margin-bottom: 0.8rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }
    .item-image {
      width: 60px;
      height: 60px;
      flex-shrink: 0;
      border-radius: 4px;
      overflow: hidden;
      background: #f8f8f8;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .item-image img { width: 100%; height: 100%; object-fit: cover; }
    .img-placeholder {
      width: 40px;
      height: 40px;
      background: #007bff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .item-info { flex: 1; }
    .item-info h4 { margin: 0 0 0.2rem; color: #333; font-size: 0.95rem; }
    .unit-price { margin: 0; color: #888; font-size: 0.85rem; }
    .item-qty { color: #555; font-size: 0.9rem; white-space: nowrap; }
    .item-subtotal { font-weight: bold; color: #e74c3c; white-space: nowrap; }
    .btn-remove {
      background: none;
      border: 1px solid #ddd;
      color: #999;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      cursor: pointer;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-remove:hover { background: #ffe0e0; color: #e74c3c; border-color: #e74c3c; }

    .cart-summary {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      position: sticky;
      top: 80px;
    }
    .cart-summary h3 { margin: 0 0 1rem; color: #333; }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      color: #555;
      font-size: 0.95rem;
    }
    .summary-total {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: 1.1rem;
      padding-top: 0.8rem;
      border-top: 1px solid #eee;
      margin: 0.8rem 0 1.2rem;
    }
    .btn-checkout {
      display: block;
      text-align: center;
      padding: 0.8rem;
      background: #28a745;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 1rem;
      margin-bottom: 0.8rem;
      transition: background 0.2s;
    }
    .btn-checkout:hover { background: #1e7e34; }
    .btn-continue {
      display: block;
      text-align: center;
      padding: 0.7rem;
      border: 1px solid #ddd;
      color: #555;
      text-decoration: none;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    .btn-continue:hover { background: #f5f5f5; }
    @media (max-width: 900px) {
      .cart-content { grid-template-columns: 1fr; }
      .cart-item { flex-wrap: wrap; }
    }
  `]
})
export class CartComponent implements OnInit {
  cart = inject(CartService);

  ngOnInit() {
    this.cart.loadCart().subscribe();
  }

  removeItem(productId: number) {
    this.cart.removeItem(productId).subscribe();
  }
}