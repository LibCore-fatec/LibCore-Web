import { query } from "@/lib/server/db";

let started = false;

export async function ensureLocalSchema() {
  if (started) return;
  started = true;

  await query("CREATE TABLE IF NOT EXISTS localizacao_livro (id_localizacao SERIAL PRIMARY KEY, setor varchar(50) NOT NULL, estante varchar(20) NOT NULL, divisoria varchar(20) NOT NULL, numero integer NOT NULL)");
  await query("CREATE TABLE IF NOT EXISTS livros (id_livro SERIAL PRIMARY KEY, etiqueta_rfid varchar(100) UNIQUE NOT NULL, nome_livro varchar(255) NOT NULL, autor_livro varchar(150), categoria_livro varchar(100), status_livro varchar(30) NOT NULL DEFAULT 'DISPONIVEL', id_localizacao integer REFERENCES localizacao_livro(id_localizacao))");
  await query("CREATE TABLE IF NOT EXISTS usuarios (id_usuario SERIAL PRIMARY KEY, nome_usuario varchar(150) NOT NULL DEFAULT 'Admin LibCore', email_usuario varchar(150) UNIQUE, cpf_usuario varchar(14), tipo_usuario varchar(30) NOT NULL DEFAULT 'ADMIN')");
  await query("CREATE TABLE IF NOT EXISTS transacoes (id_transacao SERIAL PRIMARY KEY, tipo varchar(30) NOT NULL, data timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, id_usuario integer, id_livro integer REFERENCES livros(id_livro))");
  await query("CREATE TABLE IF NOT EXISTS auditoria (id_auditoria SERIAL PRIMARY KEY, id_usuario integer, acao varchar(120) NOT NULL, entidade varchar(80) NOT NULL, id_entidade integer, detalhes jsonb, data_evento timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP)");
  await query("CREATE TABLE IF NOT EXISTS espacos (id_espaco SERIAL PRIMARY KEY, nome_espaco varchar(100) NOT NULL, tipo_espaco varchar(50) NOT NULL DEFAULT 'SALA_ESTUDO', capacidade integer NOT NULL DEFAULT 1)");
  await query("CREATE TABLE IF NOT EXISTS salas (id_sala SERIAL PRIMARY KEY, id_espaco integer REFERENCES espacos(id_espaco), nome_sala varchar(100) NOT NULL, status_sala varchar(30) NOT NULL DEFAULT 'ABERTA', camera_url text, largura_planta numeric(10,2), altura_planta numeric(10,2), metadata jsonb, atualizada_em timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP)");

  await query("INSERT INTO localizacao_livro (id_localizacao, setor, estante, divisoria, numero) VALUES (1, 'A', '01', '01', 1) ON CONFLICT (id_localizacao) DO NOTHING");
  await query("INSERT INTO usuarios (id_usuario, nome_usuario, email_usuario, cpf_usuario, tipo_usuario) VALUES (1, 'Admin LibCore', 'admin@libcore.local', '00000000000', 'ADMIN') ON CONFLICT (id_usuario) DO NOTHING");
  await query("INSERT INTO livros (etiqueta_rfid, nome_livro, autor_livro, categoria_livro, status_livro, id_localizacao) VALUES ('53:fd:3a:38:63:00:01', 'Livro 1', 'LibCore', 'Teste RFID', 'DISPONIVEL', 1) ON CONFLICT (etiqueta_rfid) DO NOTHING");
  await query("INSERT INTO espacos (id_espaco, nome_espaco, tipo_espaco, capacidade) VALUES (1, 'Sala de estudo 01', 'SALA_ESTUDO', 4) ON CONFLICT (id_espaco) DO NOTHING");
  await query("INSERT INTO salas (id_sala, id_espaco, nome_sala, status_sala, metadata) VALUES (1, 1, 'Sala de estudo 01', 'ABERTA', '{\"mapa\":\"2d\",\"blender_ready\":true}'::jsonb) ON CONFLICT (id_sala) DO NOTHING");
}
