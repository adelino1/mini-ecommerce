import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'app_theme';
  private _theme = signal<Theme>('light');

  readonly theme = this._theme.asReadonly();

  constructor() {
    const saved = localStorage.getItem(this.storageKey) as Theme | null;
    this.setTheme(saved === 'dark' ? 'dark' : 'light');
  }

  toggleTheme() {
    this.setTheme(this._theme() === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme) {
    this._theme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
  }
}
