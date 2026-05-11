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
  'theme.dark': { pt: 'Modo Escuro', en: 'Dark Mode' },
  'admin.products': { pt: 'Produtos', en: 'Products' },
  'admin.orders': { pt: 'Pedidos', en: 'Orders' },
  'admin.categories': { pt: 'Categorias', en: 'Categories' },
  'admin.addProduct': { pt: 'Adicionar Produto', en: 'Add Product' },
  'admin.cancel': { pt: 'Cancelar', en: 'Cancel' },
  'admin.create': { pt: 'Criar', en: 'Create' },
  'admin.update': { pt: 'Atualizar', en: 'Update' },
  'admin.edit': { pt: 'Editar', en: 'Edit' },
  'admin.delete': { pt: 'Excluir', en: 'Delete' },
  'admin.search': { pt: 'Buscar', en: 'Search' },
  'admin.actions': { pt: 'Ações', en: 'Actions' },
  'admin.confirmDelete': { pt: 'Tem certeza que deseja excluir?', en: 'Are you sure you want to delete?' },
  'product.name': { pt: 'Nome', en: 'Name' },
  'product.description': { pt: 'Descrição', en: 'Description' },
  'product.price': { pt: 'Preço', en: 'Price' },
  'product.stock': { pt: 'Stock', en: 'Stock' },
  'product.active': { pt: 'Ativo', en: 'Active' },
  'category.select': { pt: 'Selecionar Categoria', en: 'Select Category' },
  'yes': { pt: 'Sim', en: 'Yes' },
  'no': { pt: 'Não', en: 'No' },
  'order.customer': { pt: 'Cliente', en: 'Customer' },
  'order.total': { pt: 'Total', en: 'Total' },
  'order.status': { pt: 'Status', en: 'Status' },
  'order.date': { pt: 'Data', en: 'Date' },
  'status.pending': { pt: 'Pendente', en: 'Pending' },
  'status.shipped': { pt: 'Enviado', en: 'Shipped' },
  'status.delivered': { pt: 'Entregue', en: 'Delivered' },
  'admin.view': { pt: 'Ver', en: 'View' },
  'admin.addCategory': { pt: 'Adicionar Categoria', en: 'Add Category' },
  'category.name': { pt: 'Nome', en: 'Name' },
  'category.slug': { pt: 'Slug', en: 'Slug' }
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
