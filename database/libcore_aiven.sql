-- LibCore schema completo para Aiven MySQL
-- Import into the existing Aiven database, usually defaultdb.
-- Do not include CREATE DATABASE or USE statements on managed hosts.

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `auditoria`;
DROP TABLE IF EXISTS `multas`;
DROP TABLE IF EXISTS `notificacoes`;
DROP TABLE IF EXISTS `reservas`;
DROP TABLE IF EXISTS `espacos`;
DROP TABLE IF EXISTS `emprestimos`;
DROP TABLE IF EXISTS `transacoes`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `livros`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `localizacao_livro`;
SET FOREIGN_KEY_CHECKS=1;

-- Copiando estrutura para tabela libcore.localizacao_livro
CREATE TABLE IF NOT EXISTS `localizacao_livro` (
  `id_localizacao` int NOT NULL AUTO_INCREMENT,
  `setor` varchar(50) NOT NULL,
  `estante` varchar(20) NOT NULL,
  `divisoria` varchar(20) NOT NULL,
  `numero` int NOT NULL,
  PRIMARY KEY (`id_localizacao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando estrutura para tabela libcore.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome_usuario` varchar(150) NOT NULL,
  `email_usuario` varchar(150) NOT NULL,
  `cpf_usuario` char(11) NOT NULL,
  `facial_usuario` text,
  `tipo_usuario` enum('LEITOR','BIBLIOTECARIO','ADMIN','TOTEM') NOT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `senha_hash` varchar(128) DEFAULT NULL,
  `senha_salt` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email_usuario` (`email_usuario`),
  UNIQUE KEY `cpf_usuario` (`cpf_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando estrutura para tabela libcore.livros
CREATE TABLE IF NOT EXISTS `livros` (
  `id_livro` int NOT NULL AUTO_INCREMENT,
  `etiqueta_rfid` varchar(100) NOT NULL,
  `nome_livro` varchar(255) NOT NULL,
  `autor_livro` varchar(150) DEFAULT NULL,
  `categoria_livro` varchar(100) DEFAULT NULL,
  `isbn_livro` varchar(20) DEFAULT NULL,
  `status_livro` enum('DISPONIVEL','EMPRESTADO','RESERVADO','MANUTENCAO','INDISPONIVEL') NOT NULL DEFAULT 'DISPONIVEL',
  `id_localizacao` int DEFAULT NULL,
  PRIMARY KEY (`id_livro`),
  UNIQUE KEY `etiqueta_rfid` (`etiqueta_rfid`),
  KEY `id_localizacao` (`id_localizacao`),
  CONSTRAINT `livros_ibfk_1` FOREIGN KEY (`id_localizacao`) REFERENCES `localizacao_livro` (`id_localizacao`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando estrutura para tabela libcore.tickets
CREATE TABLE IF NOT EXISTS `tickets` (
  `id_ticket` int NOT NULL AUTO_INCREMENT,
  `data_criacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_finalizacao` datetime DEFAULT NULL,
  `status` enum('ABERTO','EM_ANDAMENTO','FINALIZADO','CANCELADO') NOT NULL DEFAULT 'ABERTO',
  `tipo` varchar(50) NOT NULL,
  `descricao` text,
  `id_usuario` int NOT NULL,
  PRIMARY KEY (`id_ticket`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando estrutura para tabela libcore.transacoes
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

-- Empréstimos detalhados para mobile, admin e totem
CREATE TABLE IF NOT EXISTS `emprestimos` (
  `id_emprestimo` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_livro` int NOT NULL,
  `data_saida` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_prevista` datetime NOT NULL,
  `data_devolucao` datetime DEFAULT NULL,
  `status` enum('ATIVO','DEVOLVIDO','ATRASADO','CANCELADO') NOT NULL DEFAULT 'ATIVO',
  PRIMARY KEY (`id_emprestimo`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_livro` (`id_livro`),
  CONSTRAINT `emprestimos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `emprestimos_ibfk_2` FOREIGN KEY (`id_livro`) REFERENCES `livros` (`id_livro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Espaços reserváveis
CREATE TABLE IF NOT EXISTS `espacos` (
  `id_espaco` int NOT NULL AUTO_INCREMENT,
  `nome_espaco` varchar(120) NOT NULL,
  `tipo_espaco` enum('SALA_ESTUDO','MESA_INDIVIDUAL','AREA_LEITURA') NOT NULL,
  `capacidade` int NOT NULL DEFAULT 1,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_espaco`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `reservas` (
  `id_reserva` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_espaco` int NOT NULL,
  `data_reserva` date NOT NULL,
  `horario_inicio` time NOT NULL,
  `horario_fim` time NOT NULL,
  `status_reserva` enum('CONFIRMADA','CANCELADA','FINALIZADA') NOT NULL DEFAULT 'CONFIRMADA',
  `data_criacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_reserva`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_espaco` (`id_espaco`),
  CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`id_espaco`) REFERENCES `espacos` (`id_espaco`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `notificacoes` (
  `id_notificacao` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `titulo` varchar(150) NOT NULL,
  `mensagem` text NOT NULL,
  `tipo` enum('AVISO','RESERVA','DEVOLUCAO','MULTA','SISTEMA') NOT NULL DEFAULT 'AVISO',
  `lida` tinyint(1) NOT NULL DEFAULT 0,
  `data_criacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacao`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `notificacoes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `multas` (
  `id_multa` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_emprestimo` int DEFAULT NULL,
  `valor` decimal(10,2) NOT NULL DEFAULT 0.00,
  `motivo` varchar(180) NOT NULL,
  `status_multa` enum('ABERTA','PAGA','CANCELADA') NOT NULL DEFAULT 'ABERTA',
  `data_criacao` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `data_pagamento` datetime DEFAULT NULL,
  PRIMARY KEY (`id_multa`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_emprestimo` (`id_emprestimo`),
  CONSTRAINT `multas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `multas_ibfk_2` FOREIGN KEY (`id_emprestimo`) REFERENCES `emprestimos` (`id_emprestimo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auditoria` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `acao` varchar(120) NOT NULL,
  `entidade` varchar(80) NOT NULL,
  `id_entidade` int DEFAULT NULL,
  `detalhes` json DEFAULT NULL,
  `data_evento` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_auditoria`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `espacos` (`nome_espaco`, `tipo_espaco`, `capacidade`) VALUES
('Sala de estudo 01', 'SALA_ESTUDO', 4),
('Mesa individual 07', 'MESA_INDIVIDUAL', 1),
('Área de leitura', 'AREA_LEITURA', 20);
