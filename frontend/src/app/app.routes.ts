import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'shop',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register.component')
        .then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/pages/forgot-password/forgot-password.component')
        .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/pages/reset-password/reset-password.component')
        .then(m => m.ResetPasswordComponent)
  },
  {
    path: 'shop',
    loadComponent: () =>
      import('./features/shop/pages/product-list/product-list.component')
        .then(m => m.ProductListComponent)
  },
  {
    path: 'shop/produto/:id',
    loadComponent: () =>
      import('./features/shop/pages/product-detail/product-detail.component')
        .then(m => m.ProductDetailComponent)
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/cart/pages/cart/cart.component')
        .then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/pages/checkout/checkout.component')
        .then(m => m.CheckoutComponent)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/pages/order-list/order-list.component')
        .then(m => m.OrderListComponent)
  },
  {
    path: 'orders/confirmacao/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/pages/order-confirmation/order-confirmation.component')
        .then(m => m.OrderConfirmationComponent)
  },

  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/orders/pages/order-detail/order-detail.component')
        .then(m => m.OrderDetailComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/pages/dashboard/dashboard.component')
        .then(m => m.DashboardComponent)
  },
  {
    path: '**',
    redirectTo: 'shop'
  }
];