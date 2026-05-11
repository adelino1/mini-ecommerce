import { Injectable, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { CartItem, CartSummary } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);

  items = this._items.asReadonly();
  total = computed(() =>
    this._items().reduce((sum, i) => sum + Number(i.subtotal), 0)
  );
  count = computed(() =>
    this._items().reduce((sum, i) => sum + i.quantity, 0)
  );

  constructor(private api: ApiService) {}

  loadCart(): Observable<any> {
    return this.api.get<CartSummary>('cart/index.php').pipe(
      tap(res => this._items.set(res.data.items))
    );
  }

  addItem(productId: number, quantity: number = 1): Observable<any> {
    return this.api.post<CartSummary>('cart/index.php', {
      product_id: productId,
      quantity
    }).pipe(
      tap(res => this._items.set(res.data.items))
    );
  }

  removeItem(productId: number): Observable<any> {
    return this.api.delete<CartSummary>('cart/index.php', {
      product_id: productId
    }).pipe(
      tap(res => this._items.set(res.data.items))
    );
  }

  clearCart(): Observable<any> {
    return this.api.delete<any>('cart/clear.php').pipe(
      tap(() => this._items.set([]))
    );
  }

  clearLocal() {
    this._items.set([]);
  }
}