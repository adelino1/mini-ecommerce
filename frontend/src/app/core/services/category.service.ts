import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Category, ApiResponse } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private api: ApiService) {}

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.api.get<Category[]>('categories/index.php');
  }

  getAll(): Observable<ApiResponse<Category[]>> {
    return this.api.get<Category[]>('categories/index.php');
  }

  create(category: { name: string; slug: string }): Observable<ApiResponse<any>> {
    return this.api.post<any>('categories/index.php', category);
  }

  update(id: number, category: { name: string; slug: string }): Observable<ApiResponse<any>> {
    return this.api.put<any>(`categories/index.php?id=${id}`, category);
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.api.delete<any>(`categories/index.php?id=${id}`);
  }
}