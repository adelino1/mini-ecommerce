import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);

  currentUser  = this._user.asReadonly();
  isAuthenticated = computed(() => !!this._user());
  isAdmin         = computed(() => this._user()?.role === 'admin');

  constructor(private api: ApiService, private router: Router) {
    this.initAuth();
  }

  private initAuth() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp > Math.floor(Date.now() / 1000)) {
          this.loadCurrentUser().subscribe();
        } else {
          this.logout();
        }
      } catch {
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.api.post<any>('auth/login.php', { email, password }).pipe(
      tap(res => {
        localStorage.setItem('auth_token', res.data.token);
        this._user.set(res.data.user);
      })
    );
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.api.post<any>('auth/register.php', { name, email, password }).pipe(
      tap(res => {
        localStorage.setItem('auth_token', res.data.token);
        this._user.set(res.data.user);
      })
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.api.post<any>('auth/forgot-password.php', { email });
  }

  resetPassword(email: string, token: string, password: string): Observable<any> {
    return this.api.post<any>('auth/reset-password.php', { email, token, password });
  }

  loadCurrentUser(): Observable<any> {
    return this.api.get<User>('auth/me.php').pipe(
      tap(res => this._user.set(res.data))
    );
  }

  logout() {
    localStorage.removeItem('auth_token');
    this._user.set(null);
    this.router.navigate(['/login']);
  }
}