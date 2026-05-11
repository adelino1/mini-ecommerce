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
    limit?: number;
  } = {}): Observable<ApiResponse<PaginatedResponse<Product>>> {
    const params = new URLSearchParams();
    if (filters.category_id) params.set('category_id', String(filters.category_id));
    if (filters.search)      params.set('search', filters.search);
    if (filters.page)        params.set('page', String(filters.page));
    if (filters.limit)       params.set('limit', String(filters.limit));

    const query = params.toString();
    return this.api.get<PaginatedResponse<Product>>(
      `products/index.php${query ? '?' + query : ''}`
    );
  }

  getProduct(id: number): Observable<ApiResponse<Product>> {
    return this.api.get<Product>(`products/show.php?id=${id}`);
  }

  getAll(): Observable<ApiResponse<Product[]>> {
    return this.api.get<Product[]>('products/index.php?limit=500&page=1');
  }

  create(product: Partial<Product>): Observable<ApiResponse<any>> {
    return this.api.post<any>('products/index.php', product);
  }

  update(id: number, product: Partial<Product>): Observable<ApiResponse<any>> {
    return this.api.put<any>(`products/[id].php?id=${id}`, product);
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<any>(`products/[id].php?id=${id}`);
  }
}