# UnderMerch - Sistema de Gestão de Merchandise para Bandas Independentes

## 📋 Visão Geral

**UnderMerch** é um sistema web open source desenvolvido para auxiliar bandas independentes e artistas na gestão profissional de suas vendas de merchandise durante shows e eventos. O projeto nasceu da necessidade real de organizar e controlar o estoque de produtos como camisetas, adesivos e outros itens vendidos em apresentações ao vivo.

### Problema Identificado

Durante shows, é comum que bandas independentes enfrentem diversos desafios na venda de merchandise:

- **Desorganização do Estoque**: Produtos espalhados em malas e caixas, dificultando a localização rápida de tamanhos e modelos específicos
- **Perda de Vendas**: Clientes desistem da compra devido à demora em encontrar o produto desejado
- **Falta de Controle**: Sem visibilidade clara do que está disponível, quantidades e variações
- **Gestão Manual**: Anotações em papel que se perdem ou ficam ilegíveis
- **Decisões sem Dados**: Impossibilidade de analisar quais produtos vendem mais, em quais shows, etc.

### Solução Proposta

UnderMerch oferece uma plataforma web completa para gestão administrativa interna, permitindo que bandas:

- Cadastrem seus produtos com todas as variações (tamanhos, cores, modelos)
- Controlem estoque em tempo real durante os shows
- Registrem vendas rapidamente pelo celular
- Visualizem relatórios de performance
- Gerenciem permissões de múltiplos membros da banda

## 🎯 Objetivos do Projeto

### Objetivo Principal

Democratizar o acesso a ferramentas profissionais de gestão para bandas independentes, contribuindo para a sustentabilidade financeira de artistas locais.

### Objetivos Específicos

1. Reduzir o tempo de atendimento durante vendas em shows
2. Eliminar perdas financeiras por descontrole de estoque
3. Fornecer dados para tomada de decisão estratégica
4. Profissionalizar a operação de merchandise de bandas independentes
5. Criar uma comunidade de suporte entre artistas

## 🌍 Alinhamento com ODS (Objetivos de Desenvolvimento Sustentável)

Este projeto está alinhado com o seguinte ODS da ONU:

### ODS 8 - Trabalho Decente e Crescimento Econômico

- Promove a profissionalização de artistas independentes
- Contribui para a sustentabilidade financeira de bandas
- Fomenta o empreendedorismo cultural

## 💻 Arquitetura Técnica

### Stack Tecnológica

#### Frontend

- **Framework**: React 18+
- **Linguagem**: TypeScript
- **Estado**: Context API / Zustand
- **UI**: Tailwind CSS + shadcn/ui
- **PWA**: Workbox para funcionamento offline

#### Backend

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **API**: RESTful com OpenAPI
- **Validação**: Zod

#### Banco de Dados

- **Principal**: PostgreSQL 15+
- **ORM**: Prisma
- **Cache**: Redis (opcional)

#### Infraestrutura

- **Cloud**: Google Cloud Platform
- **Containers**: Docker
- **Orquestração**: Cloud Run
- **Database**: Cloud SQL
- **Storage**: Cloud Storage (para imagens)
- **CDN**: Cloud CDN

#### Autenticação e Autorização

- **Provider**: Google OAuth 2.0
- **Tokens**: JWT
- **Sessões**: Express-session com Redis

### Arquitetura do Sistema

```
┌─────────────────┐
│   Frontend PWA  │
│    (React)      │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   Cloud CDN     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Cloud Run     │
│   (Backend)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌────────┐
│Cloud  │ │Cloud   │
│SQL    │ │Storage │
└───────┘ └────────┘
```

## 🚀 Funcionalidades

### MVP (Versão 1.0)

#### Gestão de Produtos

- [ ] Cadastro de produtos (nome, descrição, foto)
- [ ] Variações (tamanhos: P, M, G, GG, etc.)
- [ ] Controle de preços e custos
- [ ] Categorização (camisetas, adesivos, CDs, etc.)
- [ ] Upload de imagens

#### Controle de Estoque

- [ ] Entrada de produtos
- [ ] Saída por venda
- [ ] Alertas de estoque baixo
- [ ] Histórico de movimentações
- [ ] Inventário por evento/show

#### Registro de Vendas

- [ ] Interface mobile-first para uso durante shows
- [ ] Registro rápido de vendas
- [ ] Múltiplas formas de pagamento (PIX, dinheiro, cartão)
- [ ] Carrinho de compras
- [ ] Histórico de vendas

#### Sistema de Usuários

- [ ] Login via Google OAuth
- [ ] Superusuário (criador da instância)
- [ ] Sistema de convites para membros
- [ ] Níveis de permissão (admin, vendedor, visualizador)
- [ ] Log de ações

#### Relatórios e Analytics

- [ ] Vendas por período
- [ ] Produtos mais vendidos
- [ ] Performance por show/evento
- [ ] Margem de lucro
- [ ] Exportação de dados (CSV/PDF)

### Funcionalidades Futuras (Versão 2.0+)

- [ ] Modo offline completo com sincronização
- [ ] Integração com gateways de pagamento
- [ ] Código de barras/QR Code para produtos
- [ ] Previsão de demanda com IA
- [ ] App mobile nativo
- [ ] Integração com redes sociais para divulgação

## 👥 Público-Alvo

### Beneficiários Diretos

- Bandas independentes de todos os gêneros
- Artistas solo
- Coletivos culturais
- Pequenos selos independentes
- Produtores de eventos locais

### Características do Público

- Geralmente possuem recursos limitados
- Operam com equipes pequenas (2-5 pessoas)
- Necessitam de soluções simples e intuitivas
- Utilizam principalmente dispositivos móveis
- Precisam de funcionalidade offline

## 🌟 Diferenciais

1. **100% Open Source**: Código aberto e gratuito para sempre
2. **Deploy Simplificado**: Configuração com um clique no GCP
3. **Mobile-First**: Projetado para uso em smartphones durante shows
4. **Offline-First**: Funciona sem internet, sincroniza quando disponível
5. **Documentação em Português**: Acessível para artistas brasileiros
6. **Comunidade Ativa**: Suporte mútuo entre usuários
7. **Customizável**: Adaptável às necessidades de cada banda

## 📈 Impacto Social Esperado

### Curto Prazo (6 meses)

- 2+ bandas utilizando o sistema
- Redução de 50% no tempo de atendimento em vendas
- Aumento de 20% nas vendas por melhor controle

### Médio Prazo (1 ano)

- 10+ bandas ativas na plataforma
- Comunidade de suporte estabelecida
- Primeiras contribuições de código da comunidade

### Longo Prazo (2+ anos)

- Referência em gestão para bandas independentes
- Expansão para outros países de língua portuguesa
- Sustentabilidade do projeto através de doações

## 🛠️ Modelo de Implantação

### Para o Usuário Final

1. **Criação da Conta GCP**: Tutorial passo a passo
2. **Deploy Automatizado**: Script de configuração única
3. **Configuração Inicial**:
   - Login com Google (automático para superusuário)
   - Configuração da banda (nome, logo, etc.)
   - Convite para membros

### Custos Estimados (GCP)

- **Cloud Run**: ~$0 (free tier cobre uso típico)
- **Cloud SQL**: ~$7-15/mês (instância mínima)
- **Cloud Storage**: ~$0.02/GB/mês
- **Total Médio**: ~$10-20/mês por banda

## 📚 Documentação

### Para Desenvolvedores

- README técnico com instruções de setup
- Documentação da API (OpenAPI/Swagger)
- Guia de contribuição
- Testes automatizados

### Para Usuários

- Manual de uso ilustrado
- Vídeos tutoriais
- FAQ
- Suporte via comunidade Discord/Telegram

## 🤝 Como Contribuir

Este é um projeto open source e toda contribuição é bem-vinda:

- **Código**: Pull requests com melhorias e correções
- **Documentação**: Traduções, tutoriais, exemplos
- **Design**: Melhorias de UI/UX
- **Testes**: Reporte de bugs, testes de usabilidade
- **Divulgação**: Compartilhe com bandas que possam se beneficiar

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](../LICENSE) para detalhes.

## 🎸 Sobre o Projeto de Extensão

Este projeto foi desenvolvido como parte do Projeto de Extensão (PEX) do curso de Análise e Desenvolvimento de Sistemas da Faculdade Descomplica. O objetivo é aplicar os conhecimentos acadêmicos em uma solução real que beneficie a comunidade de artistas independentes.

### Coordenação

- **Aluno**: Rodrigo Ferretti
- **Curso**: Análise e Desenvolvimento de Sistemas
- **Instituição**: Faculdade Descomplica
- **Período**: 2025.3

---

_"Democratizando a gestão profissional para que artistas independentes possam focar no que fazem de melhor: criar e performar."_
