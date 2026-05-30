# LibCore-Web

## Banco de dados Aiven MySQL

Este repositório já inclui a configuração base para conectar e importar o schema no Aiven MySQL.

### Variáveis de ambiente

Crie um arquivo `.env` local a partir do `.env.example`:

```env
DB_HOST=libcore-libcore.d.aivencloud.com
DB_PORT=25574
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=sua_senha_do_aiven
DB_SSL=true
```

Nunca envie o arquivo `.env` para o GitHub.

### Importar o schema

Instale as dependências:

```bash
npm install
```

Depois rode:

```bash
npm run db:import
```

O script executa `database/libcore_aiven.sql`, que já está ajustado para o Aiven: sem `CREATE DATABASE`, sem `USE libcore`, com collation compatível e tabelas na ordem correta.

Se aparecer `ETIMEDOUT`, a rede atual está bloqueando a porta MySQL do Aiven. Nesse caso, rode em outra rede, como hotspot do celular, casa, GitHub Codespaces ou GitHub Actions.
