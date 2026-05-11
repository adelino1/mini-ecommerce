import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-box">
        <h2>Redefinir password</h2>
        @if (message()) { <div class="success-msg">{{ message() }}</div> }
        @if (error()) { <div class="error-msg">{{ error() }}</div> }

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <label>Token</label>
          <input type="text" formControlName="token" placeholder="Cole o token de recuperação" />
          <label>Nova password</label>
          <input type="password" formControlName="password" />
          <button type="submit" [disabled]="loading()">
            {{ loading() ? 'A redefinir...' : 'Redefinir' }}
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
    button { border: none; color: white; background: #28a745; cursor: pointer; }
    .success-msg { background: #d4edda; color: #155724; padding: 0.7rem; border-radius: 4px; margin-bottom: 1rem; }
    .error-msg { background: #ffe0e0; color: #c00; padding: 0.7rem; border-radius: 4px; margin-bottom: 1rem; }
  `]
})
export class ResetPasswordComponent {
  form: FormGroup;
  loading = signal(false);
  message = signal('');
  error = signal('');

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      token: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) this.form.patchValue({ token });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.message.set('');
    this.error.set('');
    const { token, password } = this.form.value;
    this.auth.resetPassword(token, password).subscribe({
      next: () => {
        this.message.set('Password redefinida com sucesso. Vai ser redirecionado.');
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/login']), 1200);
      },
      error: err => {
        this.error.set(err.error?.message || 'Erro ao redefinir password');
        this.loading.set(false);
      }
    });
  }
}
