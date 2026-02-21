# Under-Merch Implementation Plan

## Context

Under-merch is a merchandise inventory system for independent bands, built as a university PEX project. The repo currently has zero source code — only docs and reports. We're building it with Google Sheets as database, Google Apps Script as backend, and GitHub Pages for the frontend, following the pattern from the `guest-list` project.

## Architecture

```
GitHub Pages (Frontend)  →  Google Apps Script (API)  →  Google Sheets (Database)
                                     ↓
                              Google Drive (Images)
```

- **Frontend**: Single `index.html` on GitHub Pages (vanilla HTML/CSS/JS, mobile-first)
- **Backend**: Apps Script in TypeScript (clasp transpiles `.ts` → `.gs` on push)
- **Database**: Google Sheets with 4 tabs (Usuarios, Produtos, Movimentacoes, Vendas)
- **Auth**: Google Sign-In (Google Identity Services) — user signs in with Google on the frontend, ID token sent to Apps Script for verification, email checked against Usuarios allowlist
- **Images**: Google Drive (manual upload, file ID stored in Produtos)
- **CI/CD**: GitHub Actions + clasp

## Auth Flow (Google Sign-In)

The Usuarios tab has only `email | role | createdAt` (no passwords).

1. Frontend loads Google Identity Services library (`accounts.google.com/gsi/client`)
2. User clicks "Sign in with Google" → OAuth popup → returns ID token (JWT)
3. Frontend sends token to Apps Script: `POST { action: 'login', idToken: '...' }`
4. Apps Script verifies token via `https://oauth2.googleapis.com/tokeninfo?id_token=TOKEN`
5. Extracts email, looks up in Usuarios tab → returns `{ email, role }`
6. Frontend stores `{ idToken, email, role }` in `sessionStorage`
7. All subsequent requests include `idToken`; backend verifies on every call
8. Token expires after ~1 hour; frontend handles re-auth

**Setup requirement**: A Google Cloud project with OAuth 2.0 Client ID (documented in README tutorial).

## Database Schema (Google Sheets Tabs)

**Usuarios**: email | role | createdAt
**Produtos**: id | nome | descricao | preco | estoque | imagemId | ativo | createdAt | updatedAt
**Movimentacoes**: id | produtoId | tipo | quantidade | motivo | usuarioEmail | createdAt
**Vendas**: id | produtoId | quantidade | precoUnitario | total | metodoPagamento | usuarioEmail | createdAt

## File Structure

```
under-merch/
├── .github/workflows/
│   └── deploy.yml                  # clasp push on appscript/** changes
├── frontend/
│   └── index.html                  # Single-file SPA
├── appscript/
│   ├── appsscript.json             # Apps Script manifest
│   ├── tsconfig.json               # TypeScript config for Apps Script
│   ├── code.ts                     # doGet/doPost router
│   ├── auth.ts                     # verifyGoogleToken, checkAuth, checkPermission
│   ├── produtos.ts                 # Product CRUD
│   ├── vendas.ts                   # Sales operations
│   ├── movimentacoes.ts            # Stock movement operations
│   ├── usuarios.ts                 # User management
│   └── utils.ts                    # getSheet, generateId, now, createJsonResponse
├── package.json                    # devDependencies: @types/google-apps-script, @google/clasp
├── .clasp.json                     # clasp config (scriptId + rootDir: appscript)
├── .gitignore                      # .clasprc.json, node_modules, .env
├── README.md                       # Full tutorial for forking + setup
├── docs/                           # Keep existing university docs
└── reports/                        # Keep existing PEX reports
```

## Permissions Matrix (server-side enforcement)

```typescript
const PERMISSIONS: Record<string, string[]> = {
  getProducts: ["admin", "vendas", "estoque"],
  createProduct: ["admin"],
  updateProduct: ["admin"],
  deleteProduct: ["admin"],
  registerSale: ["admin", "vendas"],
  stockIn: ["admin", "estoque"],
  stockOut: ["admin", "estoque"],
  getVendas: ["admin", "vendas"],
  getMovimentacoes: ["admin", "estoque"],
  manageUsers: ["admin"],
};
```

## Implementation Phases

The project is built module by module. Each phase is self-contained and reviewable.

### Phase 1: Project Scaffolding

- Create repo structure (directories, package.json, tsconfig, .clasp.json, appsscript.json)
- Update .gitignore
- Set up `npm install` for TypeScript types

### Phase 2: Backend — Utils & Auth

- `utils.ts`: getSheet, generateId, now, createJsonResponse
- `auth.ts`: verifyGoogleToken (calls Google tokeninfo endpoint), checkAuth (lookup in Usuarios), checkPermission

### Phase 3: Backend — Router

- `code.ts`: doGet routes reads (getProducts, getVendas, etc.), doPost routes mutations (createProduct, registerSale, etc.)
- Every request: verify token → get email → check permission → route to handler

### Phase 4: Backend — Products

- `produtos.ts`: getProducts, createProduct, updateProduct, deleteProduct (soft delete via ativo=false)

### Phase 5: Backend — Sales

- `vendas.ts`: getVendas, registrarVenda
- registrarVenda does 3 things atomically: append to Vendas, decrement Produtos.estoque, append to Movimentacoes (tipo=saida, motivo=venda)

### Phase 6: Backend — Inventory

- `movimentacoes.ts`: getMovimentacoes, registrarEntrada (increments stock), registrarSaida (decrements stock, for non-sale reasons)

### Phase 7: Backend — Users

- `usuarios.ts`: getUsuarios (excludes sensitive data), addUsuario, removeUsuario

### Phase 8: Frontend — Login + Shell

- Google Sign-In button with Identity Services library
- Bottom tab navigation (Produtos | Vendas | Estoque | Usuarios, shown by role)
- API helper function (wraps fetch with token injection)
- Sticky header with app title + sign-out button

### Phase 9: Frontend — Products View

- Product cards with Google Drive images, name, price, stock badge
- Admin: FAB for "Novo Produto", edit/deactivate in detail modal
- Search/filter

### Phase 10: Frontend — Sales View

- Product grid for quick selection
- Sale modal: quantity, payment method (pix/dinheiro/cartao), auto-calculated total
- Recent sales list
- Optimistic UI with revert on error

### Phase 11: Frontend — Inventory View

- Stock level list with entrada (+) / saida (-) buttons
- Modal: quantity + reason (reposicao, perda, ajuste, etc.)
- Recent movements list

### Phase 12: Frontend — Users View (admin only)

- User list (email, role, createdAt)
- Add user modal (email + role dropdown)
- Remove user button with confirmation

### Phase 13: CI/CD

- GitHub Actions workflow: clasp push on appscript/\*\* changes
- GitHub Pages deployment from frontend/ directory
- Document required secrets (CLASP_CREDENTIALS)

### Phase 14: README & Documentation

- Full tutorial: fork → create Google Cloud project + OAuth Client ID → create Google Sheet with tabs → create Apps Script project → configure clasp → deploy → add first admin user
- Architecture explanation
- Screenshots

## Key Patterns (from guest-list reference)

- **Ref files**: `/home/rodrigo-ferretti/applications/guest-list/apps-script.js` and `index.html`
- **createJsonResponse**: `ContentService.createTextOutput(JSON.stringify(data)).setMimeType(JSON)`
- **Optimistic UI**: mutate local state → re-render → POST → revert on error
- **escapeHtml**: XSS protection on user-provided text
- **Event delegation**: single click handler on list containers
- **Mobile-first**: system fonts, 44px touch targets, bottom nav, iOS-style cards

## Image Handling

Manual workflow: admin uploads to Google Drive, shares publicly, pastes file ID in product form.
Display URL: `https://drive.google.com/thumbnail?id={FILE_ID}&sz=w400`

## Files to Modify/Remove

- **README.md** — complete rewrite (remove React/Node/PostgreSQL references, add fork tutorial)
- **.gitignore** — simplify (remove Node.js boilerplate, add .clasprc.json, keep node_modules)

## Verification

1. Create Google Sheet with 4 tabs + headers + 1 admin user (email only)
2. Create Google Cloud project, enable OAuth, get Client ID
3. Deploy Apps Script as web app, test API with browser/REST client
4. Open frontend locally, test Google Sign-In flow
5. Test all CRUD operations per role
6. Test on mobile (Chrome DevTools emulation)
7. Deploy to GitHub Pages, verify end-to-end
