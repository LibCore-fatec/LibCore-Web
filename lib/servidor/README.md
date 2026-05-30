# API LibCore

Código interno da API REST em português.

- `banco`: conexão com MySQL Aiven.
- `autenticacao`: JWT, senha e permissões.
- `repositorios`: utilitários de acesso a dados.
- `servicos`: regras de negócio por módulo.
- `validacoes`: leitura e validação de entrada.
- `http`: envelope padrão de sucesso e erro.

As rotas públicas ficam em `app/api/v1` e devem manter contratos em português para web/admin, mobile/aluno e totem.
