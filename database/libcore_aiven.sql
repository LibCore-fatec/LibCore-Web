-- LibCore schema for Aiven MySQL
-- Import into the existing Aiven database, usually defaultdb.
-- Do not include CREATE DATABASE or USE statements on managed hosts.

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `transacoes`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `livros`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `localizacao_livro`;
SET FOREIGN_KEY_CHECKS=1;
-- Copiando estrutura para tabela libcore.localizacao_livro
DROP TABLE IF EXISTS `localizacao_livro`;
CREATE TABLE IF NOT EXISTS `localizacao_livro` (
  `id_localizacao` int NOT NULL AUTO_INCREMENT,
  `setor` varchar(50) NOT NULL,
  `estante` varchar(20) NOT NULL,
  `divisoria` varchar(20) NOT NULL,
  `numero` int NOT NULL,
  PRIMARY KEY (`id_localizacao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela libcore.localizacao_livro: ~0 rows (aproximadamente)
DELETE FROM `localizacao_livro`;

-- Copiando estrutura para tabela libcore.usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome_usuario` varchar(150) NOT NULL,
  `email_usuario` varchar(150) NOT NULL,
  `cpf_usuario` char(11) NOT NULL,
  `facial_usuario` text,
  `tipo_usuario` enum('LEITOR','BIBLIOTECARIO','ADMIN') NOT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email_usuario` (`email_usuario`),
  UNIQUE KEY `cpf_usuario` (`cpf_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela libcore.usuarios: ~0 rows (aproximadamente)
DELETE FROM `usuarios`;

-- Copiando estrutura para tabela libcore.livros
DROP TABLE IF EXISTS `livros`;
CREATE TABLE IF NOT EXISTS `livros` (
  `id_livro` int NOT NULL AUTO_INCREMENT,
  `rfid_livro` varchar(100) NOT NULL,
  `nome_livro` varchar(255) NOT NULL,
  `id_localizacao` int DEFAULT NULL,
  PRIMARY KEY (`id_livro`),
  UNIQUE KEY `rfid_livro` (`rfid_livro`),
  KEY `id_localizacao` (`id_localizacao`),
  CONSTRAINT `livros_ibfk_1` FOREIGN KEY (`id_localizacao`) REFERENCES `localizacao_livro` (`id_localizacao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela libcore.livros: ~0 rows (aproximadamente)
DELETE FROM `livros`;

-- Copiando estrutura para tabela libcore.tickets
DROP TABLE IF EXISTS `tickets`;
CREATE TABLE IF NOT EXISTS `tickets` (
  `id_ticket` int NOT NULL AUTO_INCREMENT,
  `data_criacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_finalizacao` datetime DEFAULT NULL,
  `status` enum('ABERTO','EM_ANDAMENTO','FINALIZADO','CANCELADO') NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `descricao` text,
  `id_usuario` int NOT NULL,
  PRIMARY KEY (`id_ticket`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela libcore.tickets: ~0 rows (aproximadamente)
DELETE FROM `tickets`;

-- Copiando estrutura para tabela libcore.transacoes
DROP TABLE IF EXISTS `transacoes`;
CREATE TABLE IF NOT EXISTS `transacoes` (
  `id_transacao` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('EMPRESTIMO','DEVOLUCAO','RENOVACAO','RESERVA') NOT NULL,
  `data` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario` int NOT NULL,
  `id_livro` int NOT NULL,
  PRIMARY KEY (`id_transacao`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_livro` (`id_livro`),
  CONSTRAINT `transacoes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `transacoes_ibfk_2` FOREIGN KEY (`id_livro`) REFERENCES `livros` (`id_livro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela libcore.transacoes: ~0 rows (aproximadamente)
DELETE FROM `transacoes`;

