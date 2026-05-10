import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Product, Category, ApiResponse, PaginatedResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiService) {}

  getProducts(filters: {
    category_id?: number;
    search?: string;
    page?: number;
  } = {}): Observable<ApiResponse<PaginatedResponse<Product>>> {
    const params = new URLSearchParams();
    if (filters.category_id) params.set('category_id', String(filters.category_id));
    if (filters.search)      params.set('search', filters.search);
    if (filters.page)        params.set('page', String(filters.page));

    const query = params.toString();
    return this.api.get<PaginatedResponse<Product>>(
      `products/index.php${query ? '?' + query : ''}`
    );
  }

  getProduct(id: number): Observable<ApiResponse<Product>> {
    return this.api.get<Product>(`products/show.php?id=${id}`);
  }
}