import { query } from "@/lib/server/db";

let done = false;

export async function ensureLocalSchema() {
  if (done) return;
  done = true;
  await query("CREATE TABLE IF NOT EXISTS localizacao_livro (id_localizacao SERIAL PRIMARY KEY, setor varchar(50) NOT NULL, estante varchar(20) NOT NULL, divisoria varchar(20) NOT NULL, numero integer NOT NULL)");
  await query("CREATE TABLE IF NOT EXISTS livros (id_livro SERIAL PRIMARY KEY, etiqueta_rfid varchar(100) UNIQUE NOT NULL, nome_livro varchar(255) NOT NULL, autor_livro varchar(150), categoria_livro varchar(100), status_livro varchar(30) NOT NULL DEFAULT 'DISPONIVEL', id_localizacao integer REFERENCES localizacao_livro(id_localizacao))");
  await query("CREATE TABLE IF NOT EXISTS usuarios (id_usuario SERIAL PRIMARY KEY, nome_usuario varchar(150) NOT NULL DEFAULT 'Aluno LibCore', email_usuario varchar(150) UNIQUE, cpf_usuario varchar(14), tipo_usuario varchar(30) NOT NULL DEFAULT 'LEITOR')");
  await query("CREATE TABLE IF NOT EXISTS transacoes (id_transacao SERIAL PRIMARY KEY, tipo varchar(30) NOT NULL, data timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, id_usuario integer, id_livro integer REFERENCES livros(id_livro))");
  await query("CREATE TABLE IF NOT EXISTS auditoria (id_auditoria SERIAL PRIMARY KEY, id_usuario integer, acao varchar(120) NOT NULL, entidade varchar(80) NOT NULL, id_entidade integer, detalhes jsonb, data_evento timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP)");
  await query("INSERT INTO localizacao_livro (id_localizacao, setor, estante, divisoria, numero) VALUES (1, 'A', '01', '01', 1) ON CONFLICT (id_localizacao) DO NOTHING");
  await query("INSERT INTO usuarios (id_usuario, nome_usuario, email_usuario, cpf_usuario, tipo_usuario) VALUES (1, 'Aluno LibCore', 'aluno@libcore.local', '11111111111', 'LEITOR') ON CONFLICT (id_usuario) DO NOTHING");
  await query("INSERT INTO livros (etiqueta_rfid, nome_livro, autor_livro, categoria_livro, status_livro, id_localizacao) VALUES ('53:fd:3a:38:63:00:01', 'Livro 1', 'LibCore', 'Teste RFID', 'DISPONIVEL', 1) ON CONFLICT (etiqueta_rfid) DO NOTHING");
}
