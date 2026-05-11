import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService } from '../../../../core/services/category.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { Product, Category } from '../../../../core/models/interfaces';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DecimalPipe],
  template: `
    <div class="admin-products">
      <div class="page-head">
        <h1>{{ i18n.t('admin.products') }}</h1>
        <button (click)="showForm = !showForm" class="btn-primary">
          {{ showForm ? i18n.t('admin.cancel') : i18n.t('admin.addProduct') }}
        </button>
      </div>

      @if (showForm) {
        <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="product-form">
          <input formControlName="name" placeholder="{{ i18n.t('product.name') }}" />
          <textarea formControlName="description" placeholder="{{ i18n.t('product.description') }}"></textarea>
          <input type="number" step="0.01" formControlName="price" placeholder="{{ i18n.t('product.price') }}" />
          <input type="number" formControlName="stock" placeholder="{{ i18n.t('product.stock') }}" />
          <input formControlName="image_url" placeholder="URL da imagem (opcional)" />
          <select formControlName="category_id">
            <option value="">{{ i18n.t('category.select') }}</option>
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>
          <label>
            <input type="checkbox" formControlName="active" />
            {{ i18n.t('product.active') }}
          </label>
          <button type="submit" [disabled]="loading()" class="btn-primary">
            {{ editingProduct() ? i18n.t('admin.update') : i18n.t('admin.create') }}
          </button>
        </form>
      }

      <div class="products-list">
        <input
          [(ngModel)]="searchTerm"
          (input)="filterProducts()"
          placeholder="{{ i18n.t('admin.search') }}"
          class="search-input"
        />

        <table class="products-table">
          <thead>
            <tr>
              <th>{{ i18n.t('product.name') }}</th>
              <th>{{ i18n.t('product.price') }}</th>
              <th>{{ i18n.t('product.stock') }}</th>
              <th>{{ i18n.t('product.active') }}</th>
              <th>{{ i18n.t('admin.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            @for (product of filteredProducts(); track product.id) {
              <tr>
                <td>{{ product.name }}</td>
                <td>
                  @if (currency.rate() > 0) {
                    {{ currency.toAoa(product.price) | number:'1.0-0' }} Kz
                  } @else {
                    A carregar...
                  }
                </td>
                <td>{{ product.stock }}</td>
                <td>{{ product.active ? i18n.t('yes') : i18n.t('no') }}</td>
                <td>
                  <button (click)="editProduct(product)" class="btn-secondary">{{ i18n.t('admin.edit') }}</button>
                  <button (click)="deleteProduct(product)" class="btn-danger">{{ i18n.t('admin.delete') }}</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-products { padding: 2rem; }
    .page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .product-form { display: grid; gap: 1rem; margin-bottom: 2rem; max-width: 500px; }
    input, textarea, select { padding: 0.75rem; border: 1px solid var(--border); border-radius: 4px; background: var(--surface); color: var(--text); }
    .search-input { margin-bottom: 1rem; width: 100%; max-width: 400px; }
    .products-table { width: 100%; border-collapse: collapse; }
    @media (max-width: 768px) {
      .products-table { font-size: 0.9rem; }
      .products-table th, .products-table td { padding: 0.5rem; }
    }
    .products-table th, .products-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
    .btn-primary { background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    .btn-secondary { background: #6c757d; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; margin-right: 0.5rem; }
    .btn-danger { background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; }
  `]
})
export class AdminProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  filteredProducts = signal<Product[]>([]);
  searchTerm = '';
  showForm = false;
  editingProduct = signal<Product | null>(null);
  loading = signal(false);

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  currency = inject(CurrencyService);
  public i18n = inject(I18nService);

  productForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    image_url: [''],
    category_id: [''],
    active: [true]
  });

  ngOnInit() {
    this.currency.ensureRateLoaded();
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.productService.getAll().subscribe(res => {
      const list = Array.isArray((res.data as any)?.products)
        ? (res.data as any).products
        : Array.isArray(res.data)
          ? res.data
          : [];
      this.products.set(list);
      this.filteredProducts.set(list);
    });
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(res => {
      this.categories.set(res.data);
    });
  }

  filterProducts() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts.set(
      this.products().filter(p => p.name.toLowerCase().includes(term))
    );
  }

  editProduct(product: Product) {
    this.editingProduct.set(product);
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image_url: product.image_url || '',
      category_id: product.category_id?.toString() || '',
      active: product.active === 1
    });
    this.showForm = true;
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.loading.set(true);
    const formValue = this.productForm.value;

    const productData = {
      name: formValue.name!,
      description: formValue.description!,
      price: formValue.price!,
      stock: formValue.stock!,
      image_url: formValue.image_url || undefined,
      category_id: formValue.category_id ? +formValue.category_id : undefined,
      active: formValue.active ? 1 : 0
    };

    if (this.editingProduct()) {
      this.productService.update(this.editingProduct()!.id, productData).subscribe({
        next: () => {
          this.loadProducts();
          this.resetForm();
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.productService.create(productData).subscribe({
        next: () => {
          this.loadProducts();
          this.resetForm();
        },
        error: () => this.loading.set(false)
      });
    }
  }

  deleteProduct(product: Product) {
    if (confirm(this.i18n.t('admin.confirmDelete'))) {
      this.productService.delete(product.id).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  resetForm() {
    this.productForm.reset({ active: true });
    this.editingProduct.set(null);
    this.showForm = false;
    this.loading.set(false);
  }
}