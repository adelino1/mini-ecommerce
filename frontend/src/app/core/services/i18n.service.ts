import { Injectable, computed, signal } from '@angular/core';

type Lang = 'pt' | 'en';
type Dictionary = Record<string, Record<Lang, string>>;

const dictionary: Dictionary = {
  'nav.shop': { pt: 'Loja', en: 'Shop' },
  'nav.cart': { pt: 'Carrinho', en: 'Cart' },
  'nav.orders': { pt: 'Pedidos', en: 'Orders' },
  'nav.admin': { pt: 'Admin', en: 'Admin' },
  'nav.login': { pt: 'Entrar', en: 'Login' },
  'nav.register': { pt: 'Registar', en: 'Register' },
  'nav.logout': { pt: 'Sair', en: 'Logout' },
  'nav.hello': { pt: 'Olá', en: 'Hi' },
  'auth.forgot': { pt: 'Recuperar password', en: 'Forgot password' },
  'auth.email': { pt: 'Email', en: 'Email' },
  'auth.password': { pt: 'Password', en: 'Password' },
  'auth.name': { pt: 'Nome', en: 'Name' },
  'auth.sendReset': { pt: 'Gerar token de recuperação', en: 'Generate reset token' },
  'auth.resetPassword': { pt: 'Redefinir password', en: 'Reset password' },
  'theme.light': { pt: 'Modo Claro', en: 'Light Mode' },
  'theme.dark': { pt: 'Modo Escuro', en: 'Dark Mode' }
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly storageKey = 'app_lang';
  private _lang = signal<Lang>('pt');

  readonly lang = this._lang.asReadonly();
  readonly isEnglish = computed(() => this._lang() === 'en');

  constructor() {
    const saved = localStorage.getItem(this.storageKey) as Lang | null;
    if (saved === 'pt' || saved === 'en') {
      this._lang.set(saved);
      document.documentElement.lang = saved;
    }
  }

  setLang(lang: Lang) {
    this._lang.set(lang);
    localStorage.setItem(this.storageKey, lang);
    document.documentElement.lang = lang;
  }

  t(key: string): string {
    return dictionary[key]?.[this._lang()] ?? key;
  }
}
