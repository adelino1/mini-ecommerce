# Mini Ecommerce - Documentacao Tecnica

## 1. Visao Geral

Mini Ecommerce desenvolvido com:

- Frontend: Angular standalone components
- Backend: PHP 8 puro (sem framework)
- Base de dados: MySQL (XAMPP)
- Comunicacao: HTTP + JSON

Objetivo: disponibilizar uma loja online com autenticacao, carrinho, checkout, area admin e requisitos tecnicos de laboratorio.

## 2. Estrutura do Projeto

```text
mini-ecommerce/
  frontend/                 # Angular app
  backend/                  # API PHP
    api/                    # Endpoints por dominio
    config/                 # CORS e DB
    helpers/                # JWT e respostas JSON
    middleware/             # Auth/roles
  database/
    schema.sql              # Criacao + migracao defensiva
    seed_sample_data.sql    # Dados de exemplo
```

## 3. Funcionalidades Principais

### 3.1 Autenticacao

- Registo: `POST /api/auth/register.php`
- Login: `POST /api/auth/login.php`
- Perfil atual: `GET /api/auth/me.php`
- Logout: frontend remove token e estado
- Recuperacao de senha:
  - `POST /api/auth/forgot-password.php`
  - `POST /api/auth/reset-password.php`

### 3.2 Loja e Carrinho

- Listagem de produtos com filtros e pesquisa
- Detalhe de produto
- Adicionar/remover itens no carrinho
- Persistencia de carrinho por utilizador autenticado

### 3.3 Pedidos

- Checkout com transacao SQL
- Criacao de `orders` + `order_items`
- Reducao de stock
- Limpeza de carrinho apos sucesso
- Listagem e detalhe de pedidos

### 3.4 Admin

- Dashboard com KPIs (produtos, categorias, pedidos, receita)
- Gestao de produtos (criar, editar, desativar)
- Gestao de categorias (criar, editar, remover)
- Gestao de pedidos (atualizar status)

### 3.5 API Externa e Moeda

- Endpoint: `GET /api/external/rates.php`
- Conversao de EUR para AOA (Kwanza)
- Exibicao de precos apenas em Kz no frontend
- Fallback fixo no frontend para garantir preco mesmo sem API externa

### 3.6 Outros requisitos

- Tema claro/escuro com persistencia em `localStorage`
- i18n PT/EN com toggle
- Exportacao CSV de pedidos para admin
- Roles e permissoes (admin/customer)

## 4. Modelo de Dados (Resumo)

Tabelas principais:

- `users`
- `categories`
- `products`
- `cart_items`
- `orders`
- `order_items`
- `password_resets`

`schema.sql` contem criacao base e migracoes defensivas para ambientes ja existentes.

## 5. Setup Rapido (Windows + XAMPP)

1. Iniciar Apache e MySQL no XAMPP.
2. Aplicar schema:

```sql
SOURCE C:/xampp/htdocs/mini-ecommerce/database/schema.sql;
```

3. Popular dados de teste:

```sql
SOURCE C:/xampp/htdocs/mini-ecommerce/database/seed_sample_data.sql;
```

4. Iniciar frontend:

```bash
cd C:\xampp\htdocs\mini-ecommerce\frontend
npm install
npm start
```

5. Aceder:

- Frontend: `http://localhost:4200`
- Backend API base: `http://localhost/mini-ecommerce/backend/api`

## 6. Contas de Teste

Seed padrao:

- Admin: `admin@minishop.local` / `123456`
- Cliente: `cliente@minishop.local` / `123456`

## 7. Fluxo Admin (tipo Shopify, simplificado)

1. Entrar como admin.
2. Abrir Dashboard (`/admin`) e consultar KPIs.
3. Ir para:
   - `/admin/products` para gerir catalogo
   - `/admin/categories` para gerir taxonomia
   - `/admin/orders` para gerir estado logístico
4. Exportar relatorio CSV em `/orders` (admin).

## 8. Qualidade e Seguranca

- Endpoints protegidos com `requireAuth()` e `requireAdmin()`.
- SQL parametrizado com prepared statements.
- Checkout com transacao e rollback.
- Reset de senha com token hashed, expiracao e uso unico.

## 9. Limites Conhecidos

- Upload real de ficheiro de imagem ainda nao implementado (usa `image_url`).
- i18n cobre base principal; pode ser expandido para 100% dos textos.
- Quick admin login deve ser usado apenas em ambiente de desenvolvimento/teste.

## 10. Checklist de Entrega

- [ ] Sistema funcional em ambiente local
- [ ] Repositorio GitHub com commits progressivos
- [ ] Script SQL (`schema.sql` + `seed_sample_data.sql`)
- [ ] Documento tecnico (este ficheiro pode servir de base)
