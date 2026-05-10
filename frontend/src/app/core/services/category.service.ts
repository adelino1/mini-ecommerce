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
}