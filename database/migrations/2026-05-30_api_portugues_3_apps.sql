-- Migração da API LibCore em português para Web/Admin, Mobile/Aluno e Totem.
-- Rode no banco Aiven depois do schema base existente.

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS ativo tinyint(1) NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS senha_hash varchar(128) NULL,
  ADD COLUMN IF NOT EXISTS senha_salt varchar(64) NULL,
  ADD COLUMN IF NOT EXISTS token_validacao char(6) NULL,
  ADD COLUMN IF NOT EXISTS token_validacao_ativo tinyint(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS token_validacao_gerado_em datetime NULL,
  MODIFY COLUMN tipo_usuario enum('LEITOR','BIBLIOTECARIO','ADMIN','TOTEM') NOT NULL;

ALTER TABLE livros
  CHANGE COLUMN rfid_livro etiqueta_rfid varchar(100) NOT NULL,
  ADD COLUMN IF NOT EXISTS autor_livro varchar(150) NULL,
  ADD COLUMN IF NOT EXISTS categoria_livro varchar(100) NULL,
  ADD COLUMN IF NOT EXISTS isbn_livro varchar(20) NULL,
  ADD COLUMN IF NOT EXISTS status_livro enum('DISPONIVEL','EMPRESTADO','RESERVADO','MANUTENCAO','INDISPONIVEL') NOT NULL DEFAULT 'DISPONIVEL';

CREATE TABLE IF NOT EXISTS emprestimos (
  id_emprestimo int NOT NULL AUTO_INCREMENT,
  id_usuario int NOT NULL,
  id_livro int NOT NULL,
  data_saida datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_prevista datetime NOT NULL,
  data_devolucao datetime NULL,
  status enum('ATIVO','DEVOLVIDO','ATRASADO','CANCELADO') NOT NULL DEFAULT 'ATIVO',
  PRIMARY KEY (id_emprestimo),
  KEY emprestimos_usuario_idx (id_usuario),
  KEY emprestimos_livro_idx (id_livro),
  CONSTRAINT emprestimos_usuario_fk FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
  CONSTRAINT emprestimos_livro_fk FOREIGN KEY (id_livro) REFERENCES livros (id_livro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS espacos (
  id_espaco int NOT NULL AUTO_INCREMENT,
  nome_espaco varchar(120) NOT NULL,
  tipo_espaco enum('SALA_ESTUDO','MESA_INDIVIDUAL','AREA_LEITURA') NOT NULL,
  capacidade int NOT NULL DEFAULT 1,
  ativo tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id_espaco)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservas (
  id_reserva int NOT NULL AUTO_INCREMENT,
  id_usuario int NOT NULL,
  id_espaco int NOT NULL,
  data_reserva date NOT NULL,
  horario_inicio time NOT NULL,
  horario_fim time NOT NULL,
  status_reserva enum('CONFIRMADA','CANCELADA','FINALIZADA') NOT NULL DEFAULT 'CONFIRMADA',
  data_criacao datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_reserva),
  KEY reservas_usuario_idx (id_usuario),
  KEY reservas_espaco_idx (id_espaco),
  CONSTRAINT reservas_usuario_fk FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
  CONSTRAINT reservas_espaco_fk FOREIGN KEY (id_espaco) REFERENCES espacos (id_espaco)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notificacoes (
  id_notificacao int NOT NULL AUTO_INCREMENT,
  id_usuario int NULL,
  titulo varchar(150) NOT NULL,
  mensagem text NOT NULL,
  tipo enum('AVISO','RESERVA','DEVOLUCAO','MULTA','SISTEMA') NOT NULL DEFAULT 'AVISO',
  lida tinyint(1) NOT NULL DEFAULT 0,
  data_criacao datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_notificacao),
  KEY notificacoes_usuario_idx (id_usuario),
  CONSTRAINT notificacoes_usuario_fk FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS multas (
  id_multa int NOT NULL AUTO_INCREMENT,
  id_usuario int NOT NULL,
  id_emprestimo int NULL,
  valor decimal(10,2) NOT NULL DEFAULT 0,
  motivo varchar(180) NOT NULL,
  status_multa enum('ABERTA','PAGA','CANCELADA') NOT NULL DEFAULT 'ABERTA',
  data_criacao datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_pagamento datetime NULL,
  PRIMARY KEY (id_multa),
  KEY multas_usuario_idx (id_usuario),
  KEY multas_emprestimo_idx (id_emprestimo),
  CONSTRAINT multas_usuario_fk FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
  CONSTRAINT multas_emprestimo_fk FOREIGN KEY (id_emprestimo) REFERENCES emprestimos (id_emprestimo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS auditoria (
  id_auditoria int NOT NULL AUTO_INCREMENT,
  id_usuario int NULL,
  acao varchar(120) NOT NULL,
  entidade varchar(80) NOT NULL,
  id_entidade int NULL,
  detalhes json NULL,
  data_evento datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_auditoria),
  KEY auditoria_usuario_idx (id_usuario),
  CONSTRAINT auditoria_usuario_fk FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO espacos (nome_espaco, tipo_espaco, capacidade)
SELECT 'Sala de estudo 01', 'SALA_ESTUDO', 4
WHERE NOT EXISTS (SELECT 1 FROM espacos WHERE nome_espaco = 'Sala de estudo 01');

INSERT INTO espacos (nome_espaco, tipo_espaco, capacidade)
SELECT 'Mesa individual 07', 'MESA_INDIVIDUAL', 1
WHERE NOT EXISTS (SELECT 1 FROM espacos WHERE nome_espaco = 'Mesa individual 07');
