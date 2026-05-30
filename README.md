# Documentação de acesso à aplicação LibCore-Web

## 1. Visão geral

O **LibCore-Web** é uma aplicação web desenvolvida com **Next.js 14**, **React 18**, **TypeScript** e **Tailwind CSS**. A interface atual representa o módulo de biblioteca do sistema do aluno, com recursos como consulta de acervo, reservas, notificações e navegação lateral.

A aplicação utiliza dados mockados na tela principal e possui suporte a banco de dados **MySQL Aiven** para importação do schema.

## 2. Pré-requisitos

Antes de executar o projeto, instale:

- **Node.js 18 ou superior**
- **npm**
- **Git**
- Acesso à internet
- Credenciais do banco de dados Aiven, caso seja necessário importar ou conectar o banco

## 3. Clonar o repositório

```bash
git clone https://github.com/LibCore-fatec/LibCore-Web.git
cd LibCore-Web
