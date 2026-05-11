import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-box">
        <h2>Recuperar password</h2>

        @if (message()) {
          <div class="success-msg">{{ message() }}</div>
        }
        @if (error()) {
          <div class="error-msg">{{ error() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <label>Email</label>
          <input type="email" formControlName="email" placeholder="o seu email"/>
          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'A processar...' : 'Gerar token' }}
          </button>
        </form>

        <p><a routerLink="/login">Voltar ao login</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); }
    .auth-box { background: var(--surface); padding: 2rem; border-radius: 8px; width: 100%; max-width: 420px; }
    input, button { width: 100%; box-sizing: border-box; margin-top: 0.4rem; margin-bottom: 1rem; padding: 0.75rem; border-radius: 4px; }
    input { border: 1px solid var(--border); background: var(--surface); color: var(--text); }
    button { border: none; color: white; background: #007bff; cursor: pointer; }
    .success-msg { background: #d4edda; color: #155724; padding: 0.7rem; border-radius: 4px; margin-bottom: 1rem; }
    .error-msg { background: #ffe0e0; color: #c00; padding: 0.7rem; border-radius: 4px; margin-bottom: 1rem; }
  `]
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = signal(false);
  message = signal('');
  error = signal('');

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.message.set('');
    this.error.set('');
    this.auth.forgotPassword(this.form.value.email).subscribe({
      next: res => {
        const token = res.data?.reset_token ? ` Token: ${res.data.reset_token}` : '';
        this.message.set(`${res.data?.message ?? 'Pedido processado.'}${token}`);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(err.error?.message || 'Erro ao pedir recuperação');
        this.loading.set(false);
      }
    });
  }
}
