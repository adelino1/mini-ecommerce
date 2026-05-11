import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-box">
        <h2>{{ i18n.t('nav.register') }}</h2>

        @if (error()) {
          <div class="error-msg">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <label>{{ i18n.t('auth.name') }}</label>
          <input type="text" formControlName="name" placeholder="o seu nome"/>

          <label>{{ i18n.t('auth.email') }}</label>
          <input type="email" formControlName="email" placeholder="o seu email"/>

          <label>{{ i18n.t('auth.password') }}</label>
          <input type="password" formControlName="password" placeholder="mínimo 6 caracteres"/>

          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'A registar...' : i18n.t('nav.register') }}
          </button>
        </form>

        <p>Já tem conta? <a routerLink="/login">Entrar</a></p>
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
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }
    button:disabled { background: #ccc; cursor: not-allowed; }
    button:hover:not(:disabled) { background: #1e7e34; }
    .error-msg {
      background: #ffe0e0;
      color: #c00;
      padding: 0.7rem;
      border-radius: 4px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    p { text-align: center; margin-top: 1rem; }
    a { color: #28a745; }
  `]
})
export class RegisterComponent {
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
      name:     ['', Validators.required],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { name, email, password } = this.form.value;

    this.auth.register(name!, email!, password!).subscribe({
      next: () => this.router.navigate(['/shop']),
      error: err => {
        this.error.set(err.error?.message || 'Erro ao registar');
        this.loading.set(false);
      }
    });
  }
}