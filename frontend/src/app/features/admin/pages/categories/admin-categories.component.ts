import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/interfaces';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="admin-categories">
      <div class="page-head">
        <h1>{{ i18n.t('admin.categories') }}</h1>
        <button (click)="showForm = !showForm" class="btn-primary">
          {{ showForm ? i18n.t('admin.cancel') : i18n.t('admin.addCategory') }}
        </button>
      </div>

      @if (showForm) {
        <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="category-form">
          <input formControlName="name" placeholder="{{ i18n.t('category.name') }}" />
          <input formControlName="slug" placeholder="{{ i18n.t('category.slug') }}" />
          <button type="submit" [disabled]="loading()" class="btn-primary">
            {{ editingCategory() ? i18n.t('admin.update') : i18n.t('admin.create') }}
          </button>
        </form>
      }

      <div class="categories-list">
        <table class="categories-table">
          <thead>
            <tr>
              <th>{{ i18n.t('category.name') }}</th>
              <th>{{ i18n.t('category.slug') }}</th>
              <th>{{ i18n.t('admin.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            @for (category of categories(); track category.id) {
              <tr>
                <td>{{ category.name }}</td>
                <td>{{ category.slug }}</td>
                <td>
                  <button (click)="editCategory(category)" class="btn-secondary">{{ i18n.t('admin.edit') }}</button>
                  <button (click)="deleteCategory(category)" class="btn-danger">{{ i18n.t('admin.delete') }}</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-categories { padding: 2rem; }
    .page-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .category-form { display: grid; gap: 1rem; margin-bottom: 2rem; max-width: 500px; }
    input { padding: 0.75rem; border: 1px solid var(--border); border-radius: 4px; background: var(--surface); color: var(--text); }
    .categories-table { width: 100%; border-collapse: collapse; }
    .categories-table th, .categories-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border); }
    @media (max-width: 768px) {
      .categories-table { font-size: 0.9rem; }
      .categories-table th, .categories-table td { padding: 0.5rem; }
    }
    .btn-primary { background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    .btn-secondary { background: #6c757d; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; margin-right: 0.5rem; }
    .btn-danger { background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; }
  `]
})
export class AdminCategoriesComponent implements OnInit {
  categories = signal<Category[]>([]);
  showForm = false;
  editingCategory = signal<Category | null>(null);
  loading = signal(false);

  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  public i18n = inject(I18nService);

  categoryForm = this.fb.group({
    name: ['', Validators.required],
    slug: ['', Validators.required]
  });

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(res => {
      this.categories.set(res.data);
    });
  }

  editCategory(category: Category) {
    this.editingCategory.set(category);
    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug
    });
    this.showForm = true;
  }

  onSubmit() {
    if (this.categoryForm.invalid) return;

    this.loading.set(true);
    const formValue = this.categoryForm.value;

    const categoryData = {
      name: formValue.name!,
      slug: formValue.slug!
    };

    if (this.editingCategory()) {
      this.categoryService.update(this.editingCategory()!.id, categoryData).subscribe({
        next: () => {
          this.loadCategories();
          this.resetForm();
        },
        error: () => this.loading.set(false)
      });
    } else {
      this.categoryService.create(categoryData).subscribe({
        next: () => {
          this.loadCategories();
          this.resetForm();
        },
        error: () => this.loading.set(false)
      });
    }
  }

  deleteCategory(category: Category) {
    if (confirm(this.i18n.t('admin.confirmDelete'))) {
      this.categoryService.delete(category.id).subscribe({
        next: () => this.loadCategories(),
        error: () => {}
      });
    }
  }

  resetForm() {
    this.categoryForm.reset();
    this.editingCategory.set(null);
    this.showForm = false;
    this.loading.set(false);
  }
}