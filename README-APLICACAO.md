# Implementação da API LibCore

Esta pasta contém a implementação pronta para copiar para a raiz do repositório `LibCore-Web`.

## Como aplicar

1. Copie as pastas `app`, `lib`, `docs` e `database` para a raiz do projeto.
2. Rode a migração `database/migrations/2026-05-30_api_portugues_3_apps.sql` no MySQL Aiven.
3. Configure as variáveis:

```env
JWT_SECRET=troque-por-um-segredo-forte
JWT_TEMPO_SEGUNDOS=28800
DIAS_EMPRESTIMO=7
```

4. Instale dependências do projeto, se necessário:

```bash
npm install
```

5. Valide:

```bash
npm run lint
npm run build
```

## Contratos

- Base da API: `/api/v1`.
- Documentação JSON: `/api/documentacao`.
- Resposta de sucesso: `{ "dados": ..., "metadados": ... }`.
- Resposta de erro: `{ "erro": { "codigo": "...", "mensagem": "...", "detalhes": ... } }`.
- Autenticação: `Authorization: Bearer <token>`.
- Mobile aluno: gera token em `POST /api/v1/usuarios/meu-token/gerar`.
- Mobile Totem Principal: valida token em `POST /api/v1/totem-principal/validar-token`, consulta RFID em `GET /api/v1/totem-principal/livro/:etiqueta`, empresta e devolve em `/api/v1/totem-principal`.

## Aplicações

- Web/Admin: usa rotas administrativas, usuários, livros, auditoria e relatórios.
- Mobile/Aluno: usa acervo, reservas, tickets, notificações, multas e histórico.
- Totem: usa identificação facial simulada, RFID, empréstimos, devoluções e tickets rápidos.

## Reconhecimento facial

A primeira versão usa simulação. Para validar, envie um `facial_token` começando com `facial_mock_`.

Exemplo:

```json
{
  "facial_token": "facial_mock_aluno_1",
  "id_usuario": 1
}
```

## Front-totem-aluno

O app `front-totem-aluno` consome a API pela variável:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

Quando a API ou o login não estiverem disponíveis, o app mantém os dados de `mock-data.ts` apenas como fallback de desenvolvimento.
