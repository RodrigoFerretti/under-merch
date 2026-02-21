# Tutorial de Setup — UnderMerch

Guia completo para configurar sua própria instância do UnderMerch. Ao final, você terá o sistema funcionando com autenticação Google, planilha como banco de dados e frontend publicado no GitHub Pages.

## Pré-requisitos

- Conta Google (Gmail)
- Conta no GitHub
- Git instalado
- [nvm](https://github.com/nvm-sh/nvm) instalado (gerenciador de versões do Node.js)
- [Bun](https://bun.sh/) instalado (gerenciador de pacotes)

### Instalando nvm e Node.js

Se ainda não tem o nvm, instale com:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Depois, na raiz do projeto, rode:

```bash
nvm install    # instala a versão do .nvmrc (Node 22 LTS)
nvm use        # ativa essa versão
```

### Instalando Bun

```bash
curl -fsSL https://bun.sh/install | bash
```

Bun é o gerenciador de pacotes do projeto (substitui npm/yarn). Ele é usado para instalar dependências e rodar scripts.

## Visão Geral da Arquitetura

```
GitHub Pages (Frontend)  →  Google Apps Script (API)  →  Google Sheets (Banco de Dados)
                                     ↓
                              Google Drive (Imagens)
```

O UnderMerch usa **zero servidores**. Todo o backend roda no Google Apps Script (gratuito), os dados ficam numa planilha do Google Sheets e o frontend é hospedado no GitHub Pages.

---

## Etapa 1 — Criar a Planilha (Banco de Dados)

A planilha do Google Sheets funciona como banco de dados. Ela precisa de 4 abas, cada uma com colunas específicas.

### Opção A — Importar o template (recomendado)

O repositório inclui um arquivo Excel pronto com todas as abas e cabeçalhos:

1. Acesse [sheets.google.com](https://sheets.google.com)
2. Vá em **Arquivo → Importar → Upload**
3. Faça upload do arquivo `setup/undermerch-template.xlsx` (disponível no repositório)
4. Selecione **"Substituir planilha"** e clique em **"Importar dados"**
5. Renomeie a planilha para **"UnderMerch"** (clique no título)

As 4 abas (`Usuarios`, `Produtos`, `Movimentacoes`, `Vendas`) já estarão criadas com os cabeçalhos corretos.

Pule para a seção **1.4** abaixo.

### Opção B — Criar manualmente

<details>
<summary>Clique para expandir as instruções manuais</summary>

#### 1.1. Criar a planilha

1. Acesse [sheets.google.com](https://sheets.google.com)
2. Clique em **"Em branco"** para criar uma nova planilha
3. Renomeie para **"UnderMerch"** (clique no título "Planilha sem título")

#### 1.2. Criar as 4 abas

A planilha já vem com uma aba chamada "Página1". Renomeie-a e crie as demais:

1. **Clique duplo** na aba "Página1" → renomeie para `Usuarios`
2. Clique no **"+"** no canto inferior esquerdo para criar novas abas:
   - `Produtos`
   - `Movimentacoes`
   - `Vendas`

**Importante:** Os nomes precisam ser exatamente esses (sem acento, maiúscula inicial).

#### 1.3. Adicionar os cabeçalhos

Em cada aba, preencha a **linha 1** com os cabeçalhos abaixo:

**Aba `Usuarios`** (colunas A até C):

| A | B | C |
|---|---|---|
| email | role | createdAt |

**Aba `Produtos`** (colunas A até I):

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| id | nome | descricao | preco | estoque | imagemId | ativo | createdAt | updatedAt |

**Aba `Movimentacoes`** (colunas A até G):

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| id | produtoId | tipo | quantidade | motivo | usuarioEmail | createdAt |

**Aba `Vendas`** (colunas A até H):

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| id | produtoId | quantidade | precoUnitario | total | metodoPagamento | usuarioEmail | createdAt |

</details>

### 1.4. Adicionar o primeiro usuário admin

Na aba `Usuarios`, preencha a **linha 2**:

| A | B | C |
|---|---|---|
| seu-email@gmail.com | admin | 2026-02-20 |

Substitua `seu-email@gmail.com` pelo e-mail da conta Google que você vai usar para acessar o sistema.

### 1.5. Copiar o ID da planilha

O ID da planilha está na URL. Por exemplo:

```
https://docs.google.com/spreadsheets/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ/edit
                                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                       Esse trecho é o ID da planilha
```

Guarde esse ID — você vai precisar dele no código do Apps Script.

---

## Etapa 2 — Criar o Projeto no Google Cloud (OAuth)

Para que os usuários façam login com a conta Google, precisamos de um **Client ID OAuth 2.0**.

> **Pré-requisito:** O Google Cloud exige **verificação em duas etapas (2FA)** na sua conta Google. Se ainda não ativou, acesse [myaccount.google.com/signinoptions/two-step-verification](https://myaccount.google.com/signinoptions/two-step-verification) antes de continuar.

### 2.1. Criar o projeto

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. No topo da página, clique no seletor de projeto → **"Novo Projeto"**
3. Nome: `UnderMerch`
4. Clique em **"Criar"**
5. Aguarde a criação e selecione o projeto

### 2.2. Configurar a Google Auth Platform

O Google Cloud agora usa a **Google Auth Platform** para configurar OAuth. O fluxo é um wizard de 4 passos:

1. No menu lateral, vá em **"Google Auth Platform" → "Overview"**
2. Clique em **"Get started"**
3. Preencha os 4 passos:

**Passo 1 — App Information:**
- **App name**: `UnderMerch`
- **User support email**: selecione seu e-mail no dropdown
- Clique em **"Next"**

**Passo 2 — Audience:**
- Selecione **"External"** (para contas pessoais; "Internal" só aparece para Google Workspace)
- Clique em **"Next"**

**Passo 3 — Contact Information:**
- **Email addresses**: digite seu e-mail e pressione Enter
- Clique em **"Next"**

**Passo 4 — Finish:**
- Marque o checkbox **"I agree to the Google API Services: User Data Policy"**
- Clique em **"Continue"**

4. Aguarde o processamento. Você verá a mensagem **"OAuth configuration created!"**

### 2.3. Criar o Client ID OAuth

Ainda na Google Auth Platform:

1. Clique em **"Create OAuth client"** (no banner da página Overview) ou vá em **"Clients"** no menu lateral → **"+ Create Client"**
2. **Application type**: selecione **"Web application"**
3. **Name**: `UnderMerch Frontend`
4. Em **"Authorized JavaScript origins"**, clique em **"+ Add URI"** e adicione:
   - `https://SEU-USUARIO.github.io` (para produção no GitHub Pages)
   - `http://localhost:5500` (para desenvolvimento local com Live Server)
   - `http://127.0.0.1:5500` (alternativa do Live Server)
5. Clique em **"Create"**

### 2.4. Copiar o Client ID

Após criar, uma janela mostra o **Client ID**. Ele tem o formato:

```
480654208006-xxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

Copie e guarde — você vai colocá-lo no `index.html` do frontend.

### 2.5. Adicionar usuários de teste

Enquanto o app estiver em modo de teste, apenas e-mails autorizados podem fazer login:

1. No menu lateral da Google Auth Platform, clique em **"Audience"**
2. Na seção **"Test users"**, clique em **"+ Add users"**
3. Adicione seu e-mail e de quem mais for testar
4. Clique em **"Save"**

> **Nota:** Para uso em produção com qualquer conta Google, é necessário publicar o app (o Google pode pedir verificação). Para testes e uso interno da banda, o modo de teste é suficiente — basta adicionar os e-mails dos membros.

---

## Etapa 3 — Criar o Projeto do Apps Script (Backend)

O Google Apps Script é onde roda o backend (a API). Ele é gratuito e conecta-se diretamente à planilha.

### 3.1. Abrir o editor do Apps Script

1. Volte para a planilha que você criou na Etapa 1
2. Vá em **"Extensões" → "Apps Script"**
3. O editor do Apps Script abre em uma nova aba

### 3.2. Configurar o projeto

1. No editor, clique no ícone de engrenagem (**Configurações do projeto**) no menu lateral
2. Marque a opção **"Mostrar o arquivo de manifesto "appsscript.json" no editor"**
3. Anote o **ID do script**, que aparece na seção "IDs" das configurações. O formato é algo como:
   ```
   1aBcDeFgHiJkLmNoPqRsTuVwXyZ_abcdefghijklmnop
   ```

Guarde esse ID — você vai usá-lo no arquivo `.clasp.json`.

### 3.3. Sobre o deploy manual vs. clasp

Existem duas formas de colocar o código no Apps Script:

- **Manual (mais simples):** Copiar e colar o código no editor web do Apps Script. Bom para testes rápidos.
- **Via clasp (recomendado):** Usar a ferramenta de linha de comando `clasp` para fazer push do código TypeScript direto do seu repositório. Permite versionamento com Git e CI/CD.

As duas próximas etapas cobrem ambos os caminhos. Escolha o que preferir (ou faça o manual primeiro para testar, e depois migre para o clasp).

---

## Etapa 4 — Setup Local com clasp (Recomendado)

O `clasp` (Command Line Apps Script) permite fazer push de código TypeScript para o Google Apps Script diretamente do terminal.

### 4.1. Fazer fork do repositório

1. Acesse o repositório no GitHub
2. Clique em **"Fork"**
3. Clone para sua máquina:
   ```bash
   git clone https://github.com/SEU-USUARIO/under-merch.git
   cd under-merch
   ```

### 4.2. Configurar a versão do Node.js

```bash
nvm install   # instala o Node 22 LTS (definido no .nvmrc)
nvm use       # ativa essa versão
```

### 4.3. Instalar as dependências

```bash
bun install
```

Isso instala o `clasp` (ferramenta de deploy para Apps Script), o `biome` (linter e formatador) e os tipos TypeScript para Google Apps Script.

### 4.4. Fazer login no clasp

```bash
bunx clasp login
```

Um navegador abre para autenticar com sua conta Google. Após a autorização, o clasp salva as credenciais localmente em `~/.clasprc.json`.

### 4.5. Configurar o `.clasp.json`

Edite o arquivo `.clasp.json` na raiz do projeto e coloque o ID do script que você anotou na Etapa 3.2:

```json
{
  "scriptId": "SEU_SCRIPT_ID_AQUI",
  "rootDir": "appscript"
}
```

### 4.6. Fazer push do código

```bash
bunx clasp push
```

O clasp transpila os arquivos `.ts` para `.gs` e envia para o Google Apps Script. Se tudo deu certo, você verá os arquivos no editor web do Apps Script.

> **Dica:** Use `bunx clasp push --watch` para fazer push automático a cada salvamento.

### 4.7. Configurar o ID da planilha no código

No arquivo `appscript/utils.ts`, localize a constante `SPREADSHEET_ID` e substitua pelo ID da sua planilha (da Etapa 1.5):

```typescript
const SPREADSHEET_ID = 'SEU_ID_DA_PLANILHA_AQUI';
```

Faça push novamente: `bunx clasp push`

---

## Etapa 5 — Deploy do Apps Script (Web App)

O deploy transforma o Apps Script em uma API acessível via URL.

### 5.1. Criar o deploy

1. No editor do Apps Script (acessível pela planilha em **Extensões → Apps Script**)
2. Clique em **"Implantar" → "Nova implantação"**
3. Clique no ícone de engrenagem ao lado de "Tipo" → selecione **"App da Web"**
4. Configure:
   - **Descrição**: `v1` (ou qualquer texto)
   - **Executar como**: **Eu** (sua conta Google)
   - **Quem pode acessar**: **Qualquer pessoa**
5. Clique em **"Implantar"**
6. Autorize o acesso quando solicitado (clique em "Revisar permissões" → sua conta → "Avançado" → "Acessar UnderMerch (não seguro)" → "Permitir")

### 5.2. Copiar a URL do Web App

Após o deploy, copie a URL. Ela tem o formato:

```
https://script.google.com/macros/s/AKfycbx.../exec
```

Guarde essa URL — ela vai no `index.html` do frontend.

> **Importante:** Cada vez que você alterar o código e fizer push, é preciso criar uma **nova implantação** para que as mudanças reflitam na URL. Se quiser usar a mesma URL sempre, use **"Implantar" → "Gerenciar implantações" → "Editar"** e selecione "Nova versão" na implantação existente.

---

## Etapa 6 — Configurar o Frontend

### 6.1. Editar o `index.html`

No arquivo `frontend/index.html`, atualize duas constantes:

```javascript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
const GOOGLE_CLIENT_ID = '123456789012-abcdefghijklmnop.apps.googleusercontent.com';
```

- `APPS_SCRIPT_URL` → URL do deploy da Etapa 5.2
- `GOOGLE_CLIENT_ID` → Client ID da Etapa 2.4

### 6.2. Testar localmente

Abra o `frontend/index.html` no navegador. Se estiver usando o VS Code, use a extensão **Live Server** (porta 5500).

1. Clique em **"Entrar com Google"**
2. Faça login com o e-mail que você adicionou na aba `Usuarios`
3. Se tudo funcionar, você verá a interface principal

> **Problemas comuns:**
> - **Erro de origem não autorizada:** Verifique se `http://localhost:5500` está nas Origens JavaScript autorizadas (Etapa 2.3)
> - **Erro 403 / "Not authorized":** Verifique se seu e-mail está na aba `Usuarios` com role `admin`
> - **Erro de CORS:** O Apps Script retorna JSON via `ContentService`, que não suporta CORS headers. No entanto, a resposta funciona com `fetch` no modo `no-cors` ou via redirecionamento (o Apps Script redireciona GETs). Verifique se o deploy está como "Qualquer pessoa"

---

## Etapa 7 — Deploy no GitHub Pages

### 7.1. Ativar o GitHub Pages

1. No repositório do GitHub, vá em **Settings → Pages**
2. Em **Source**, selecione **"Deploy from a branch"**
3. Em **Branch**, selecione `master` e a pasta `/frontend`
   - Se a opção de pasta `/frontend` não estiver disponível, selecione `/ (root)` e mova o `index.html` para a raiz, ou use GitHub Actions (Etapa 8)
4. Clique em **"Save"**

### 7.2. Acessar o site

Após alguns minutos, o site estará disponível em:

```
https://SEU-USUARIO.github.io/under-merch/
```

### 7.3. Atualizar as origens OAuth

Volte ao Console do Google Cloud (Etapa 2.3) e confirme que a origem `https://SEU-USUARIO.github.io` está na lista de Origens JavaScript autorizadas.

---

## Etapa 8 — CI/CD com GitHub Actions (Opcional)

Automatiza o push do código Apps Script sempre que houver mudanças na pasta `appscript/`.

### 8.1. Fazer login no clasp

O clasp precisa de autorização para acessar seus projetos do Apps Script:

```bash
bun run login
```

Um navegador abre pedindo permissões. Selecione **"Selecionar tudo"** e confirme. Após a autorização, as credenciais são salvas em `~/.clasprc.json`.

### 8.2. Adicionar o secret no GitHub

As credenciais do clasp precisam ser configuradas como secret no repositório para que o GitHub Actions consiga fazer deploy.

#### Opção A — Via terminal (requer [GitHub CLI](https://cli.github.com/))

```bash
gh secret set CLASP_CREDENTIALS < ~/.clasprc.json
```

#### Opção B — Pelo navegador

1. No repositório do GitHub, vá em **Settings → Secrets and variables → Actions**
2. Clique em **"New repository secret"**
3. Nome: `CLASP_CREDENTIALS`
4. Valor: cole o conteúdo inteiro do arquivo `~/.clasprc.json`:
   ```bash
   cat ~/.clasprc.json
   ```
5. Clique em **"Add secret"**

### 8.3. Workflow do GitHub Actions

O arquivo `.github/workflows/deploy.yml` já está configurado no repositório. Ele:

1. Roda quando há push em `appscript/**`
2. Instala o Bun e as dependências
3. Escreve o `CLASP_CREDENTIALS` em `~/.clasprc.json`
4. Roda `bunx clasp push`

Após configurar o secret, qualquer push na pasta `appscript/` dispara o deploy automaticamente.

---

## Etapa 9 — Gerenciamento de Imagens (Google Drive)

As imagens dos produtos são armazenadas no Google Drive. O fluxo é manual:

### 9.1. Criar uma pasta no Drive

1. Acesse [drive.google.com](https://drive.google.com)
2. Crie uma pasta chamada **"UnderMerch - Imagens"**

### 9.2. Upload de imagens

1. Faça upload das fotos dos produtos na pasta
2. Para cada imagem:
   - Clique com botão direito → **"Compartilhar"**
   - Mude para **"Qualquer pessoa com o link"**
   - Clique em **"Copiar link"**
3. O link tem o formato:
   ```
   https://drive.google.com/file/d/1aBcDeFgHiJkLmNoP/view
                                     ^^^^^^^^^^^^^^^^^
                                     Esse é o FILE ID
   ```

### 9.3. Usar no cadastro de produto

No formulário de cadastro de produto do UnderMerch, cole apenas o **File ID** no campo de imagem. O sistema monta a URL de exibição automaticamente:

```
https://drive.google.com/thumbnail?id=FILE_ID&sz=w400
```

---

## Resumo das Configurações

Ao final do setup, você terá configurado:

| O quê | Onde guardar |
|-------|-------------|
| ID da Planilha | `appscript/utils.ts` → `SPREADSHEET_ID` |
| ID do Script (Apps Script) | `.clasp.json` → `scriptId` |
| URL do Web App | `frontend/index.html` → `APPS_SCRIPT_URL` |
| Client ID OAuth | `frontend/index.html` → `GOOGLE_CLIENT_ID` |
| Credenciais clasp | `~/.clasprc.json` (local) e GitHub Secret (CI/CD) |
| Primeiro admin | Aba `Usuarios` da planilha → seu e-mail com role `admin` |

---

## Resolução de Problemas

### "O login do Google não funciona"

- Verifique se o Client ID está correto no `index.html`
- Verifique se a origem (URL do site) está nas Origens JavaScript autorizadas no Google Cloud
- Se o app está em modo "Teste", verifique se seu e-mail está na lista de usuários de teste

### "A API retorna erro 403"

- Verifique se o deploy do Apps Script está como "Qualquer pessoa"
- Verifique se seu e-mail está na aba `Usuarios` com a role correta

### "Produtos não aparecem / dados não salvam"

- Verifique se o `SPREADSHEET_ID` está correto no `utils.ts`
- Verifique se os nomes das abas na planilha estão exatamente como: `Usuarios`, `Produtos`, `Movimentacoes`, `Vendas`
- Verifique se os cabeçalhos estão na linha 1 de cada aba

### "clasp push dá erro de autenticação"

- Rode `bunx clasp login` novamente
- Verifique se o `scriptId` no `.clasp.json` está correto

### "Imagem do produto não aparece"

- Verifique se o arquivo no Google Drive está compartilhado como "Qualquer pessoa com o link"
- Verifique se o File ID está correto (sem espaços)

---

## Próximos Passos

Após o setup, o sistema está pronto para uso. Veja como operar:

1. **Adicionar membros da banda:** Na aba "Usuários" do sistema, adicione os e-mails com as roles:
   - `admin` — acesso total (gerenciar produtos, usuários, ver tudo)
   - `vendas` — registrar vendas e ver histórico de vendas
   - `estoque` — registrar entradas/saídas de estoque

2. **Cadastrar produtos:** Na aba "Produtos", use o botão "+" para adicionar os itens de merch

3. **Usar durante o show:** Abra o site no celular, faça login e use a aba "Vendas" para registrar vendas rapidamente
