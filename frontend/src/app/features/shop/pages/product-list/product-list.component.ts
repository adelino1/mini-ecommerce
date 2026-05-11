import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { Product, Category } from '../../../../core/models/interfaces';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="shop-container">

      <!-- Filtros -->
      <aside class="sidebar">
        <h3>Categorias</h3>
        <ul>
          <li>
            <button
              [class.active]="!selectedCategory()"
              (click)="filterByCategory(null)">
              Todos
            </button>
          </li>
          @for (cat of categories(); track cat.id) {
            <li>
              <button
                [class.active]="selectedCategory() === cat.id"
                (click)="filterByCategory(cat.id)">
                {{ cat.name }}
                <span class="count">({{ cat.products_count }})</span>
              </button>
            </li>
          }
        </ul>
      </aside>

      <!-- Produtos -->
      <section class="products-area">
        <div class="products-header">
          <h2>
            @if (selectedCategory()) {
              {{ getCategoryName() }}
            } @else {
              Todos os Produtos
            }
          </h2>
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            (input)="onSearch($event)"
            class="search-input"/>
        </div>

        @if (loading()) {
          <div class="loading">A carregar produtos...</div>
        } @else if (products().length === 0) {
          <div class="empty">Nenhum produto encontrado.</div>
        } @else {
          <div class="products-grid">
            @for (product of products(); track product.id) {
              <div class="product-card">
                <div class="product-image">
                  @if (product.image_url) {
                    <img [src]="product.image_url" [alt]="product.name" loading="lazy"/>
                  } @else {
                    <div class="image-placeholder">{{ product.name[0] }}</div>
                  }
                </div>
                <div class="product-info">
                  <span class="category-tag">{{ product.category_name }}</span>
                  <h4>{{ product.name }}</h4>
                  @if (currencyService.rate() > 0) {
                    <p class="price">{{ toAoa(product.price) | number:'1.0-0' }} Kz</p>
                  } @else {
                    <p class="price-loading">A carregar preço em Kz...</p>
                  }
                  <p class="stock" [class.low]="product.stock < 5">
                    {{ product.stock > 0 ? 'Em stock (' + product.stock + ')' : 'Esgotado' }}
                  </p>
                  <a [routerLink]="['/shop/produto', product.id]" class="btn-detail">
                    Ver Produto
                  </a>
                </div>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .shop-container {
      display: flex;
      gap: 2rem;
    }

    /* Sidebar */
    .sidebar {
      width: 200px;
      flex-shrink: 0;
    }
    .sidebar h3 {
      margin-bottom: 1rem;
      color: #333;
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sidebar ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .sidebar li { margin-bottom: 0.4rem; }
    .sidebar button {
      width: 100%;
      text-align: left;
      padding: 0.6rem 0.8rem;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: 4px;
      color: #555;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .sidebar button:hover { background: #f0f0f0; color: #333; }
    .sidebar button.active { background: #007bff; color: white; }
    .count { font-size: 0.8rem; opacity: 0.7; }

    /* Área de produtos */
    .products-area { flex: 1; }
    .products-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }
    .products-header h2 { margin: 0; color: #333; }
    .search-input {
      padding: 0.6rem 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.9rem;
      width: 220px;
    }

    /* Grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    /* Card */
    .product-card {
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
      transition: box-shadow 0.2s;
      background: white;
    }
    .product-card:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.1); }

    .product-image {
      height: 160px;
      background: #f8f8f8;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .image-placeholder {
      width: 70px;
      height: 70px;
      background: #007bff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: bold;
    }

    .product-info { padding: 1rem; }
    .category-tag {
      font-size: 0.75rem;
      color: #007bff;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .product-info h4 {
      margin: 0.3rem 0;
      color: #333;
      font-size: 0.95rem;
    }
    .price {
      font-size: 1.2rem;
      font-weight: bold;
      color: #e74c3c;
      margin: 0.3rem 0;
    }
    .price-loading { font-size: 0.85rem; color: #666; margin: 0 0 0.3rem; }
    .stock {
      font-size: 0.8rem;
      color: #28a745;
      margin-bottom: 0.8rem;
    }
    .stock.low { color: #e74c3c; }

    .btn-detail {
      display: block;
      text-align: center;
      padding: 0.5rem;
      background: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    .btn-detail:hover { background: #0056b3; }

    .loading, .empty {
      text-align: center;
      padding: 3rem;
      color: #888;
      font-size: 1.1rem;
    }

    @media (max-width: 900px) {
      .shop-container { flex-direction: column; }
      .sidebar { width: 100%; }
      .products-header { flex-direction: column; align-items: stretch; gap: 0.8rem; }
      .search-input { width: 100%; }
    }
  `]
})
export class ProductListComponent implements OnInit {
  products   = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading    = signal(true);
  selectedCategory = signal<number | null>(null);
  searchQuery      = signal('');
  private searchTimer: any;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    public currencyService: CurrencyService
  ) {
    this.currencyService.ensureRateLoaded();
  }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: res => this.categories.set(res.data),
      error: () => {}
    });
  }

  loadProducts() {
    this.loading.set(true);
    const filters: any = {};
    if (this.selectedCategory()) filters.category_id = this.selectedCategory();
    if (this.searchQuery())      filters.search      = this.searchQuery();

    this.productService.getProducts(filters).subscribe({
      next: res => {
        this.products.set(res.data.products);
        this.loading.set(false);
      },
      error: () => {
        this.products.set([]);
        this.loading.set(false);
      }
    });
  }

  toAoa(valueEur: number): number {
    return this.currencyService.toAoa(valueEur);
  }

  filterByCategory(id: number | null) {
    this.selectedCategory.set(id);
    this.loadProducts();
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.searchQuery.set(value);
      this.loadProducts();
    }, 400);
  }

  getCategoryName(): string {
    return this.categories().find(
      c => c.id === this.selectedCategory()
    )?.name || '';
  }
}