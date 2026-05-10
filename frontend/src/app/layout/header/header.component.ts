import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header>
      <div class="header-inner">
        <a routerLink="/shop" class="logo">🛒 MiniShop</a>

        <nav>
          <a routerLink="/shop" routerLinkActive="active">Loja</a>

          @if (auth.isAuthenticated()) {
            <a routerLink="/cart" routerLinkActive="active">
              Carrinho
            </a>
            <a routerLink="/orders" routerLinkActive="active">Pedidos</a>

            @if (auth.isAdmin()) {
              <a routerLink="/admin" routerLinkActive="active">Admin</a>
            }

            <span class="user-name">Olá, {{ auth.currentUser()?.name }}</span>
            <button (click)="auth.logout()">Sair</button>
          } @else {
            <a routerLink="/login" routerLinkActive="active">Entrar</a>
            <a routerLink="/register" routerLinkActive="active">Registar</a>
          }
        </nav>
      </div>
    </header>
  `,
  styles: [`
    header {
      background: #1a1a2e;
      color: white;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
    }
    .logo {
      color: white;
      text-decoration: none;
      font-size: 1.3rem;
      font-weight: bold;
    }
    nav { display: flex; align-items: center; gap: 1.2rem; }
    nav a {
      color: #ccc;
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.2s;
    }
    nav a:hover, nav a.active { color: white; }
    .user-name { color: #aaa; font-size: 0.9rem; }
    button {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.4rem 0.9rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }
    button:hover { background: #c0392b; }
  `]
})
export class HeaderComponent {
  auth = inject(AuthService);
}