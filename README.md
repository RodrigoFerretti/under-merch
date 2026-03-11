# UnderMerch

Sistema web para gestao de merchandise de bandas independentes. Controle de produtos, estoque, vendas e usuarios — tudo rodando de graca com servicos do Google.

## Arquitetura

```
GitHub Pages (Frontend)  -->  Google Apps Script (Backend)  -->  Google Sheets (Banco de Dados)
```

- **Frontend:** HTML/CSS/JS vanilla hospedado no GitHub Pages
- **Backend:** Google Apps Script (TypeScript via clasp)
- **Banco de Dados:** Google Sheets (5 abas: Users, Products, SKUs, Movements, Sales)
- **Autenticacao:** Google OAuth 2.0
- **CI/CD:** GitHub Actions (deploy automatico do frontend e backend)

Custo de infraestrutura: zero.

## Funcionalidades

- Cadastro de produtos com imagem, preco e variantes (SKUs)
- Controle de estoque com historico de movimentacoes
- Registro de vendas otimizado para uso durante shows
- Sistema de usuarios com permissoes por role (admin, vendas, estoque)
- Autenticacao via conta Google

## Setup

Veja o [tutorial completo](tutorial.md) para configurar sua propria instancia.

## Licenca

[MIT](LICENSE)
