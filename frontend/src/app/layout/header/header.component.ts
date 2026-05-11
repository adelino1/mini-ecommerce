import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header>
      <div class="header-inner">
        <a routerLink="/shop" class="logo">🛒 MiniShop</a>

        <nav>
          <a routerLink="/shop" routerLinkActive="active">{{ i18n.t('nav.shop') }}</a>

          @if (auth.isAuthenticated()) {
            <a routerLink="/cart" routerLinkActive="active" class="cart-link">
              {{ i18n.t('nav.cart') }}
              @if (cart.count() > 0) {
                <span class="badge">{{ cart.count() }}</span>
              }
            </a>
            <a routerLink="/orders" routerLinkActive="active">{{ i18n.t('nav.orders') }}</a>

            @if (auth.isAdmin()) {
              <a routerLink="/admin" routerLinkActive="active">{{ i18n.t('nav.admin') }}</a>
            }

            <span class="user-name">{{ i18n.t('nav.hello') }}, {{ auth.currentUser()?.name }}</span>
            <button (click)="logout()">{{ i18n.t('nav.logout') }}</button>
          } @else {
            <a routerLink="/login" routerLinkActive="active">{{ i18n.t('nav.login') }}</a>
            <a routerLink="/register" routerLinkActive="active">{{ i18n.t('nav.register') }}</a>
          }

          <button (click)="toggleTheme()">
            {{ theme.theme() === 'dark' ? i18n.t('theme.light') : i18n.t('theme.dark') }}
          </button>
          <button (click)="toggleLang()">{{ i18n.lang() === 'pt' ? 'EN' : 'PT' }}</button>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    header {
      background: var(--surface);
      color: var(--text);
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      border-bottom: 1px solid var(--border);
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
      color: var(--text);
      text-decoration: none;
      font-size: 1.3rem;
      font-weight: bold;
    }
    nav { display: flex; align-items: center; gap: 1.2rem; }
    nav a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.2s;
    }
    nav a:hover, nav a.active { color: var(--text); }
    .cart-link { position: relative; }
    .badge {
      background: #e74c3c;
      color: white;
      border-radius: 50%;
      padding: 0.1rem 0.4rem;
      font-size: 0.7rem;
      margin-left: 0.3rem;
      font-weight: bold;
    }
    .user-name { color: var(--muted); font-size: 0.9rem; }
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
    @media (max-width: 900px) {
      .header-inner { height: auto; padding: 0.7rem 0; align-items: flex-start; gap: 0.8rem; flex-direction: column; }
      nav { flex-wrap: wrap; gap: 0.6rem; }
    }
  `]
})
export class HeaderComponent implements OnInit {
  auth = inject(AuthService);
  cart = inject(CartService);
  theme = inject(ThemeService);
  i18n = inject(I18nService);

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.cart.loadCart().subscribe();
    }
  }

  logout() {
    this.cart.clearLocal();
    this.auth.logout();
  }

  toggleTheme() {
    this.theme.toggleTheme();
  }

  toggleLang() {
    this.i18n.setLang(this.i18n.lang() === 'pt' ? 'en' : 'pt');
  }
}