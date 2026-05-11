import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { OrderService } from '../../../../core/services/order.service';
import { DecimalPipe } from '@angular/common';
import { CurrencyService } from '../../../../core/services/currency.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  template: `
    <div class="checkout">
      <h1>Checkout</h1>
      @if (currency.rate() > 0) {
        <p>Total: {{ toAoa(cart.total()) | number:'1.0-0' }} Kz</p>
      } @else {
        <p>Total: A carregar valor em Kz...</p>
      }

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <input placeholder="Nome" formControlName="shipping_name" />
        <input placeholder="Email" formControlName="shipping_email" />
        <input placeholder="Telefone" formControlName="shipping_phone" />
        <input placeholder="Morada" formControlName="shipping_address" />
        <input placeholder="Cidade" formControlName="shipping_city" />
        <input placeholder="Código Postal" formControlName="shipping_postal_code" />
        <textarea placeholder="Notas (opcional)" formControlName="notes"></textarea>
        <button [disabled]="loading() || cart.items().length === 0">
          {{ loading() ? 'A finalizar...' : 'Finalizar pedido' }}
        </button>
      </form>
      @if (error()) { <p class="error">{{ error() }}</p> }
    </div>
  `,
  styles: [`
    .checkout { max-width: 520px; margin: 0 auto; }
    form { display: grid; gap: 0.8rem; }
    input, textarea, button { padding: 0.75rem; border-radius: 4px; border: 1px solid var(--border); background: var(--surface); color: var(--text); }
    button { background: #28a745; color: white; border: none; cursor: pointer; }
    .error { color: #d32f2f; }
  `]
})
export class CheckoutComponent {
  cart = inject(CartService);
  currency = inject(CurrencyService);
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private router = inject(Router);
  loading = signal(false);
  error = signal('');

  form = this.fb.group({
    shipping_name: ['', Validators.required],
    shipping_email: ['', [Validators.required, Validators.email]],
    shipping_phone: ['', Validators.required],
    shipping_address: ['', Validators.required],
    shipping_city: ['', Validators.required],
    shipping_postal_code: ['', Validators.required],
    notes: ['']
  });

  constructor() {
    this.currency.ensureRateLoaded();
    this.cart.loadCart().subscribe();
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.orderService.createOrder(this.form.getRawValue() as any).subscribe({
      next: res => {
        this.cart.clearLocal();
        this.loading.set(false);
        this.router.navigate(['/orders/confirmacao', res.data.id]);
      },
      error: err => {
        this.error.set(err.error?.message || 'Erro ao criar pedido');
        this.loading.set(false);
      }
    });
  }

  toAoa(valueEur: number): number {
    return this.currency.toAoa(valueEur);
  }
}