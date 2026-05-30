# LibCore-Web

Documentação para instalação, configuração e acesso à aplicação **LibCore-Web**.

## Visão geral

O **LibCore-Web** é uma aplicação web desenvolvida com **Next.js**, **React**, **TypeScript** e **Tailwind CSS**.

A aplicação representa o módulo de biblioteca do sistema do aluno, permitindo visualizar informações como acervo, reservas, notificações e dados da biblioteca.

Atualmente, a tela principal utiliza dados estáticos no front-end e pode ser acessada diretamente pela rota inicial da aplicação.

## Tecnologias utilizadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- MySQL
- mysql2
- Lucide React

## Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- Node.js 18 ou superior
- npm
- Git
- Acesso às credenciais do banco de dados Aiven, caso seja necessário importar o banco

## Clonar o repositório

Execute o comando abaixo para clonar o projeto:

```bash
git clone https://github.com/LibCore-fatec/LibCore-Web.git
```

Entre na pasta do projeto:

```bash
cd LibCore-Web
```

## Instalar dependências

Execute:

```bash
npm install
```

## Configurar variáveis de ambiente

Na raiz do projeto, crie um arquivo chamado `.env`.

Você pode usar como base o arquivo `.env.example`.

Exemplo de configuração:

```env
DB_HOST=libcore-libcore.d.aivencloud.com
DB_PORT=25574
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=sua_senha_do_aiven
DB_SSL=true
```

### Descrição das variáveis

| Variável | Descrição |
|---|---|
| `DB_HOST` | Endereço do servidor MySQL |
| `DB_PORT` | Porta de conexão com o banco |
| `DB_NAME` | Nome do banco de dados |
| `DB_USER` | Usuário do banco |
| `DB_PASSWORD` | Senha do banco |
| `DB_SSL` | Define se a conexão usa SSL |

> **Importante:** nunca envie senhas ou credenciais reais para o GitHub.

## Importar o banco de dados

Após configurar o arquivo `.env`, execute:

```bash
npm run db:import
```

Esse comando executa o script de importação localizado em:

```txt
scripts/import-libcore.cjs
```

O script importa o arquivo SQL:

```txt
database/libcore_aiven.sql
```

## Executar a aplicação em desenvolvimento

Para iniciar a aplicação localmente, execute:

```bash
npm run dev
```

Depois, acesse no navegador:

```txt
http://localhost:3000
```

## Acessar a aplicação

A aplicação pode ser acessada diretamente pela rota inicial:

```txt
/
```

Em ambiente local, o endereço será:

```txt
http://localhost:3000
```

Atualmente, não há uma tela de login implementada. O sistema abre diretamente a tela principal da biblioteca.

## Tela inicial

Ao acessar a aplicação, será exibido o módulo **Biblioteca**, contendo:

- Menu lateral do sistema
- Cards de estatísticas
- Consulta de livros
- Filtro por categoria
- Lista de livros
- Reservas de espaços
- Notificações
- Botões de reserva e detalhes

## Scripts disponíveis

No projeto, estão disponíveis os seguintes scripts:

```bash
npm run dev
```

Inicia a aplicação em modo de desenvolvimento.

```bash
npm run build
```

Gera a build de produção.

```bash
npm run start
```

Executa a aplicação em modo de produção após a build.

```bash
npm run lint
```

Executa a verificação de lint do projeto.

```bash
npm run db:import
```

Importa o schema do banco de dados para o MySQL configurado no arquivo `.env`.

## Build de produção

Para gerar a build da aplicação, execute:

```bash
npm run build
```

Após finalizar a build, execute:

```bash
npm run start
```

Acesse novamente:

```txt
http://localhost:3000
```

## Estrutura principal do projeto

```txt
LibCore-Web/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── database/
│   └── libcore_aiven.sql
├── scripts/
│   └── import-libcore.cjs
├── .env.example
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── README.md
```

## Arquivos importantes

| Arquivo | Descrição |
|---|---|
| `app/page.tsx` | Página principal da aplicação |
| `app/layout.tsx` | Layout raiz da aplicação |
| `app/globals.css` | Estilos globais |
| `tailwind.config.ts` | Configuração do Tailwind CSS |
| `package.json` | Dependências e scripts do projeto |
| `.env.example` | Exemplo de variáveis de ambiente |
| `scripts/import-libcore.cjs` | Script de importação do banco |
| `database/libcore_aiven.sql` | Arquivo SQL com o schema do banco |

## Problemas comuns

### Erro: `Missing environment variable`

Esse erro acontece quando alguma variável obrigatória não foi configurada no arquivo `.env`.

Verifique se o arquivo `.env` existe na raiz do projeto e se possui todas as variáveis necessárias:

```env
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_SSL=
```

### Erro: `ETIMEDOUT`

Esse erro pode ocorrer quando a rede atual bloqueia a conexão com o banco de dados Aiven.

Possíveis soluções:

- Testar em outra rede
- Usar hotspot do celular
- Usar rede doméstica
- Executar pelo GitHub Codespaces
- Executar pelo GitHub Actions

### Porta 3000 em uso

Se a porta `3000` já estiver sendo usada, execute a aplicação em outra porta:

```bash
npm run dev -- -p 3001
```

Depois acesse:

```txt
http://localhost:3001
```

## Observações importantes

- A aplicação atual não possui autenticação implementada.
- O acesso é feito diretamente pela página inicial.
- Os dados exibidos na tela principal estão definidos no front-end.
- Para usar dados reais do banco, será necessário implementar integração entre a aplicação e o MySQL.
- Para acesso por usuários reais, será necessário implementar login e controle de permissões.

## Fluxo resumido de execução

```bash
git clone https://github.com/LibCore-fatec/LibCore-Web.git
cd LibCore-Web
npm install
```

Crie o arquivo `.env`:

```env
DB_HOST=libcore-libcore.d.aivencloud.com
DB_PORT=25574
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=sua_senha_do_aiven
DB_SSL=true
```

Importe o banco, se necessário:

```bash
npm run db:import
```

Execute a aplicação:

```bash
npm run dev
```

Acesse:

```txt
http://localhost:3000
```
