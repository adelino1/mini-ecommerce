import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-box">
        <h2>{{ i18n.t('nav.login') }}</h2>

        @if (error()) {
          <div class="error-msg">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <label>{{ i18n.t('auth.email') }}</label>
          <input type="email" formControlName="email" placeholder="o seu email"/>

          <label>{{ i18n.t('auth.password') }}</label>
          <input type="password" formControlName="password" placeholder="a sua password"/>

          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'A entrar...' : i18n.t('nav.login') }}
          </button>
        </form>
        <button type="button" class="btn-admin" (click)="loginAsAdmin()" [disabled]="loading()">
          Entrar rápido como Admin (teste)
        </button>

        <p>Não tem conta? <a routerLink="/register">Registar</a></p>
        <p><a routerLink="/forgot-password">{{ i18n.t('auth.forgot') }}</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
    }
    .auth-box {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }
    h2 { margin-bottom: 1.5rem; color: #333; }
    label { display: block; margin-bottom: 0.3rem; color: #555; font-size: 0.9rem; }
    input {
      width: 100%;
      padding: 0.7rem;
      margin-bottom: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    button {
      width: 100%;
      padding: 0.8rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }
    button:disabled { background: #ccc; cursor: not-allowed; }
    button:hover:not(:disabled) { background: #0056b3; }
    .btn-admin { background: #6f42c1; margin-top: 0.4rem; }
    .btn-admin:hover:not(:disabled) { background: #5a32a3; }
    .error-msg {
      background: #ffe0e0;
      color: #c00;
      padding: 0.7rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    p { text-align: center; margin-top: 1rem; }
    a { color: #007bff; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  loading = signal(false);
  error   = signal('');
  i18n: I18nService;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    i18n: I18nService
  ) {
    this.i18n = i18n;
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/shop']),
      error: err => {
        this.error.set(err.error?.message || 'Erro ao fazer login');
        this.loading.set(false);
      }
    });
  }

  loginAsAdmin() {
    this.loading.set(true);
    this.error.set('');
    this.auth.quickAdminLogin().subscribe({
      next: () => this.router.navigate(['/admin']),
      error: err => {
        this.error.set(err.error?.message || 'Erro ao entrar como admin');
        this.loading.set(false);
      }
    });
  }
}