# 🎮 QuizNight

Aplicação web de **quiz interativo com perguntas sobre jogos, filmes e músicas**, desenvolvida com Next.js e TypeScript. O projeto combina uma experiência gamificada baseada em roleta de categorias, perguntas de múltipla escolha, limite de tempo e sistema de pontuação.

O QuizNight foi desenvolvido com foco em uma arquitetura moderna full-stack, separação de responsabilidades, validação de dados, persistência de sessões e integração com APIs externas para geração dinâmica das perguntas.

🔗 Deploy: https://quiz-night-nine.vercel.app/  
🔗 Repositório: https://github.com/hubdanielcode/QuizNight

---

## 🚀 Demonstração

O sistema oferece uma experiência de quiz baseada em rodadas rápidas, onde a categoria da próxima pergunta é definida pela roleta.

A aplicação conta com:

- Roleta para seleção aleatória de categorias
- Perguntas sobre **jogos**
- Perguntas sobre **filmes**
- Perguntas sobre **músicas**
- Perguntas de múltipla escolha
- Rodadas de **15 segundos por pergunta**
- Sistema de pontuação
- Encerramento da partida ao responder incorretamente
- Feedback da resposta correta
- Sessão de jogo persistida no servidor
- Interface responsiva
- Estados de carregamento e páginas de erro personalizadas

A página inicial apresenta a proposta do jogo, categorias disponíveis, indicador de nível e acesso direto para iniciar uma partida.

---

## 🏗️ Arquitetura e Decisões Técnicas

O projeto utiliza uma estrutura baseada no **App Router do Next.js**, separando páginas, componentes, ações de servidor, camada de acesso a dados, validações e tipagens.

Principais áreas da aplicação:

```text
src/
├── actions/
├── app/
├── components/
├── lib/
├── prisma/
└── types/
```

A estrutura atual do projeto separa responsabilidades entre:

- `actions` — operações executadas no servidor
- `app` — rotas, páginas e layouts do Next.js
- `components` — componentes específicos do quiz e componentes reutilizáveis
- `lib` — Prisma, fetchers e validações
- `prisma` — schema, migrations e cliente gerado
- `types` — tipagens relacionadas às categorias e dados do jogo

Essa organização permite manter a lógica de negócio, acesso a dados e interface desacoplados, facilitando manutenção e evolução do projeto.

### Principais decisões técnicas

- Server Actions para operações relacionadas ao jogo
- Prisma como ORM
- PostgreSQL como banco de dados
- Validação de payloads com Zod
- Sessões identificadas por cookie `httpOnly`
- Separação entre componentes de UI e componentes específicos do domínio
- Fetchers independentes para cada fonte de perguntas
- Tipagem estática com TypeScript
- Testes automatizados com Vitest e Testing Library

---

## 🎯 Funcionamento do Quiz

Cada partida possui uma sessão própria identificada por `sessionId`.

Quando uma nova pergunta é solicitada, o sistema:

1. Identifica a categoria selecionada pela roleta.
2. Busca dados atualizados da categoria correspondente.
3. Seleciona aleatoriamente um tema de pergunta.
4. Gera a pergunta e suas alternativas.
5. Persiste a pergunta associada à sessão atual.
6. Envia as alternativas para o cliente.
7. Aguarda a resposta do jogador.

As categorias atualmente disponíveis são:

- 🎮 **Jogos**
- 🎬 **Filmes**
- 🎵 **Músicas**

O banco também mantém o estado da sessão, pontuação, perguntas respondidas e motivo de encerramento da partida.

---

## ⚙️ Funcionalidades

✔ Roleta de categorias  
✔ Quiz de jogos, filmes e músicas  
✔ Perguntas de múltipla escolha  
✔ Geração dinâmica de perguntas  
✔ Seleção aleatória de perguntas e alternativas  
✔ Cronômetro de 15 segundos por pergunta  
✔ Sistema de pontuação  
✔ Validação das respostas no servidor  
✔ Identificação da sessão por cookie `httpOnly`  
✔ Persistência das perguntas no PostgreSQL  
✔ Encerramento da partida por resposta incorreta  
✔ Identificação do motivo de término da partida  
✔ Feedback da resposta correta  
✔ Loading state durante o carregamento do jogo  
✔ Página 404 personalizada  
✔ Página de erro personalizada  
✔ Interface responsiva  
✔ Componentes reutilizáveis  
✔ Testes automatizados

A lógica de resposta valida o payload antes de consultar a sessão e o banco de dados, verifica se a pergunta pertence à sessão atual e só então determina se a resposta está correta.

---

## 🎲 Categorias e Geração de Perguntas

### 🎮 Jogos

Os dados de jogos são obtidos através da **RAWG API**.

O sistema pode gerar perguntas relacionadas a:

- Nome do jogo
- Ano de lançamento
- Avaliação no Metacritic
- Plataformas disponíveis

Também são utilizados dados adicionais do jogo, como a publicadora, para compor algumas perguntas.

### 🎬 Filmes

Os dados de filmes são obtidos através da **The Movie Database (TMDB) API**.

As perguntas podem abordar:

- Nome do filme
- Ano de lançamento
- Avaliação
- Diretor

O sistema também consulta os créditos do filme para obter informações sobre o diretor responsável pela obra.

### 🎵 Músicas

Os dados musicais são obtidos através da **Deezer API**, utilizando o ranking de músicas para alimentar a geração das perguntas.

---

## 🗄️ Banco de Dados

O projeto utiliza **Prisma ORM** conectado a um banco PostgreSQL.

O modelo principal é dividido em três entidades:

### `QuizSession`

Representa uma partida do usuário.

Armazena:

- Identificador da sessão
- Pontuação
- Status da partida
- Motivo de encerramento
- Perguntas relacionadas

### `Question`

Representa uma pergunta gerada durante a partida.

Armazena:

- Categoria
- Tipo da pergunta
- Enunciado
- Imagem opcional
- Alternativas
- Resposta selecionada
- Resposta correta
- Sessão relacionada

### `Token`

Estrutura preparada para controle de tokens de inicialização da aplicação.

Os estados das sessões incluem `active` e `finished`, enquanto o encerramento pode ocorrer por resposta incorreta ou tempo esgotado.

---

## 🔐 Sessões e Segurança

O QuizNight utiliza um identificador de sessão armazenado em cookie `httpOnly`.

Quando o jogador inicia uma partida:

- Uma sessão é criada caso ainda não exista.
- O `sessionId` é armazenado no cookie.
- As perguntas são associadas à sessão.
- As respostas são verificadas contra a sessão atual.
- Sessões finalizadas não são reutilizadas.

O cookie possui duração limitada e a validação da sessão é realizada no servidor.

Além disso, os payloads enviados para submissão de respostas são validados com **Zod antes do acesso ao cookie ou ao banco de dados**.

---

## 🧪 Testes

O projeto possui uma estrutura dedicada para testes automatizados, organizada de acordo com as principais áreas da aplicação:

```text
tests/
├── actions/
├── app/
├── components/
├── lib/
├── proxy.test.ts
└── setup.ts
```

Os testes abrangem:

- Páginas do App Router
- Layouts
- Página 404
- Tratamento de erros
- Componentes do quiz
- Componentes de UI
- Ações do servidor
- Funções auxiliares
- Validações
- Middleware/proxy

A estrutura de testes acompanha a organização da aplicação, facilitando a manutenção e a identificação de regressões.

### Executar os testes

```bash
npm run test
```

### Executar testes em modo watch

```bash
npm run test:watch
```

### Abrir a interface do Vitest

```bash
npm run test:ui
```

Os scripts estão definidos diretamente no `package.json` do projeto.

---

## 🛠️ Tecnologias Utilizadas

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Zod
- Vitest
- React Testing Library
- Motion
- Lucide React
- RAWG API
- TMDB API
- Deezer API
- ESLint
- Prettier
- Git & GitHub

As principais dependências e versões utilizadas estão definidas no `package.json` do projeto.

---

## ▶️ Executando Localmente

### Pré-requisitos

Antes de começar, certifique-se de possuir:

- Node.js
- npm
- PostgreSQL
- Uma chave da RAWG API
- Uma chave da TMDB API

### Clone o repositório

```bash
git clone https://github.com/hubdanielcode/QuizNight.git
cd QuizNight
```

### Instale as dependências

```bash
npm install
```

### Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="your_postgresql_connection_string"

RAWG_API_KEY="your_rawg_api_key"

TMDB_API_KEY="your_tmdb_api_key"
```

A aplicação utiliza `DATABASE_URL` para inicializar o Prisma e as variáveis `RAWG_API_KEY` e `TMDB_API_KEY` para consultar as APIs externas.

### Configure o banco de dados

Execute as migrations do Prisma:

```bash
npx prisma migrate dev
```

### Inicie o projeto

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:3000
```

### Build de produção

```bash
npm run build
```

### Executar em produção

```bash
npm run start
```

---

## 🧠 Conceitos Aplicados

- Server Components e Server Actions
- App Router do Next.js
- Componentização e reutilização de UI
- Separação de responsabilidades
- Persistência de sessões
- Cookies `httpOnly`
- Validação de dados com Zod
- ORM com Prisma
- Modelagem relacional com PostgreSQL
- Integração com APIs externas
- Geração dinâmica de conteúdo
- Tipagem forte com TypeScript
- Tratamento de erros
- Estados de loading
- Testes automatizados
- Organização modular de código

---

## 📂 Estrutura do Projeto

```text
QuizNight/
├── src/
│   ├── actions/
│   │   ├── quiz.ts
│   │   └── validateGame.ts
│   │
│   ├── app/
│   │   ├── api/
│   │   │   └── quiz/
│   │   │       └── [category]/
│   │   ├── quiz/
│   │   │   ├── [category]/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── quiz/
│   │   │   ├── AnswersList.tsx
│   │   │   ├── BonusCategoryModal.tsx
│   │   │   ├── PlayAgain.tsx
│   │   │   ├── QuizGame.tsx
│   │   │   ├── RedirectToHome.tsx
│   │   │   ├── SpinningWheel.tsx
│   │   │   └── TimeBar.tsx
│   │   │
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Cards.tsx
│   │       ├── CategoryOptionsButton.tsx
│   │       └── Loading.tsx
│   │
│   ├── lib/
│   │   ├── fetchers/
│   │   │   ├── getGameQuestion.ts
│   │   │   ├── getMovieQuestion.ts
│   │   │   ├── getMusicQuestion.ts
│   │   │   └── quizHelpers.ts
│   │   ├── validations/
│   │   │   └── quiz.ts
│   │   ├── getWheelSlices.ts
│   │   └── prisma.ts
│   │
│   ├── prisma/
│   │   ├── generated/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── types/
│   │   ├── cards.ts
│   │   ├── categories.ts
│   │   ├── games.ts
│   │   ├── movies.ts
│   │   ├── musics.ts
│   │   └── wheelSlice.ts
│   │
│   └── proxy.ts
│
├── tests/
│   ├── actions/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── proxy.test.ts
│   └── setup.ts
│
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── prisma.config.ts
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

A estrutura acima reflete a organização atual do repositório, incluindo as áreas de aplicação, componentes, ações, fetchers, Prisma, tipos e testes.

---

## 📱 Responsividade

A interface foi construída com Tailwind CSS e utiliza layouts adaptáveis para diferentes tamanhos de tela.

O objetivo é manter a experiência do quiz funcional em:

- **Desktop** — experiência completa com roleta, perguntas e elementos de interface.
- **Tablet** — adaptação dos componentes e espaçamentos.
- **Mobile** — interface otimizada para interação por toque e telas menores.

A página inicial e os componentes do jogo utilizam classes responsivas do Tailwind para adaptar o layout conforme o tamanho da viewport.

---

## 🌐 Deploy

O repositório atualmente não informa uma URL pública de deploy nas configurações visíveis do GitHub.

Para disponibilizar o projeto em produção, é necessário configurar:

- Aplicação Next.js
- Banco PostgreSQL
- `DATABASE_URL`
- `RAWG_API_KEY`
- `TMDB_API_KEY`
- Build de produção com `npm run build`

---

## 📌 Observações

- O funcionamento do quiz depende das APIs externas utilizadas para geração das perguntas.
- A aplicação precisa de um banco PostgreSQL configurado através de `DATABASE_URL`.
- As chaves das APIs devem permanecer em variáveis de ambiente e não devem ser commitadas no repositório.
- As sessões são identificadas por cookie e possuem duração limitada.
- A pontuação é persistida no banco de dados.
- Uma resposta incorreta encerra a sessão atual.
- O projeto utiliza dados externos para gerar perguntas dinamicamente.

---

## 📄 Licença

Este projeto é livre para fins de **estudo, aprendizado e uso pessoal**.
