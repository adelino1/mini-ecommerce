import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="confirm">
      <h1>Pedido Confirmado!</h1>
      <p>Obrigado pela compra. Pode acompanhar o estado na sua área de pedidos.</p>
      <a routerLink="/orders">Ver pedidos</a>
    </div>
  `,
  styles: [`
    .confirm { max-width: 620px; margin: 2rem auto; text-align: center; }
    a { color: #0d6efd; }
  `]
})
export class OrderConfirmationComponent {}