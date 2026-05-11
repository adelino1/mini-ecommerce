import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { Product } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="detail-container">
      <a routerLink="/shop" class="back-link">← Voltar à loja</a>

      @if (loading()) {
        <div class="loading">A carregar produto...</div>
      } @else if (!product()) {
        <div class="error">
          <h2>Produto não encontrado</h2>
          <a routerLink="/shop">Voltar à loja</a>
        </div>
      } @else {
        <div class="product-detail">
          <div class="product-image">
            @if (product()!.image_url) {
              <img [src]="product()!.image_url" [alt]="product()!.name"/>
            } @else {
              <div class="image-placeholder">{{ product()!.name[0] }}</div>
            }
          </div>

          <div class="product-info">
            <span class="category-tag">{{ product()!.category_name }}</span>
            <h1>{{ product()!.name }}</h1>
            @if (currencyService.rate() > 0) {
              <p class="price">{{ toAoa(product()!.price) | number:'1.0-0' }} Kz</p>
            } @else {
              <p class="price-loading">A carregar preço em Kz...</p>
            }

            <p class="stock" [class.low]="product()!.stock < 5">
              @if (product()!.stock > 0) {
                Em stock — {{ product()!.stock }} unidades disponíveis
              } @else {
                Esgotado
              }
            </p>

            <p class="description">{{ product()!.description }}</p>

            @if (added()) {
              <div class="success-msg">✓ Adicionado ao carrinho!</div>
            }

            <button
              class="btn-cart"
              [disabled]="product()!.stock === 0 || adding()"
              (click)="addToCart()">
              @if (adding()) {
                A adicionar...
              } @else {
                Adicionar ao Carrinho
              }
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-container { max-width: 900px; margin: 0 auto; }
    .back-link {
      display: inline-block;
      margin-bottom: 1.5rem;
      color: #007bff;
      text-decoration: none;
      font-size: 0.95rem;
    }
    .back-link:hover { text-decoration: underline; }
    .product-detail {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      background: white;
      border-radius: 8px;
      padding: 2rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    .product-image {
      background: #f8f8f8;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      overflow: hidden;
    }
    .product-image img { width: 100%; height: 100%; object-fit: cover; }
    .image-placeholder {
      width: 120px;
      height: 120px;
      background: #007bff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 3rem;
      font-weight: bold;
    }
    .product-info { display: flex; flex-direction: column; gap: 1rem; }
    .category-tag {
      font-size: 0.8rem;
      color: #007bff;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    h1 { margin: 0; color: #333; font-size: 1.8rem; }
    .price { font-size: 2rem; font-weight: bold; color: #e74c3c; margin: 0; }
    .price-loading { margin: -0.7rem 0 0; color: #666; font-size: 0.9rem; }
    .stock { color: #28a745; font-size: 0.95rem; margin: 0; }
    .stock.low { color: #e74c3c; }
    .description { color: #666; line-height: 1.6; }
    .btn-cart {
      padding: 1rem 2rem;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: auto;
    }
    .btn-cart:hover:not(:disabled) { background: #1e7e34; }
    .btn-cart:disabled { background: #ccc; cursor: not-allowed; }
    .success-msg {
      background: #d4edda;
      color: #155724;
      padding: 0.7rem 1rem;
      border-radius: 4px;
      font-size: 0.95rem;
    }
    .loading, .error { text-align: center; padding: 3rem; color: #888; }
    @media (max-width: 900px) {
      .product-detail { grid-template-columns: 1fr; gap: 1.2rem; padding: 1rem; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(true);
  adding  = signal(false);
  added   = signal(false);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    public currencyService: CurrencyService
  ) {
    this.currencyService.ensureRateLoaded();
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/shop']);
      return;
    }

    this.productService.getProduct(id).subscribe({
      next:  res => { this.product.set(res.data); this.loading.set(false); },
      error: ()  => { this.product.set(null);     this.loading.set(false); }
    });
  }

  addToCart() {
    this.adding.set(true);
    this.cartService.addItem(this.product()!.id, 1).subscribe({
      next: () => {
        this.adding.set(false);
        this.added.set(true);
        setTimeout(() => this.added.set(false), 2000);
      },
      error: () => {
        this.adding.set(false);
      }
    });
  }

  toAoa(valueEur: number): number {
    return this.currencyService.toAoa(valueEur);
  }

}