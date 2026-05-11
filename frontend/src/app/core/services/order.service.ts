import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, Order } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private api: ApiService) {}

  listOrders(): Observable<ApiResponse<Order[]>> {
    return this.api.get<Order[]>('orders/index.php');
  }

  getOrder(id: number): Observable<ApiResponse<Order>> {
    return this.api.get<Order>(`orders/show.php?id=${id}`);
  }

  createOrder(payload: {
    shipping_name: string;
    shipping_email: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_postal_code: string;
    notes?: string;
  }): Observable<ApiResponse<{ id: number; total: number }>> {
    return this.api.post<{ id: number; total: number }>('orders/index.php', payload);
  }
}
