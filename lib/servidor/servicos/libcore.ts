import type { RowDataPacket } from "mysql2/promise";
import { consultar, consultarUm, executar } from "@/lib/servidor/banco/conexao";
import { criarHashSenha, criarToken, senhaConfere } from "@/lib/servidor/autenticacao/jwt";
import { ErroApi } from "@/lib/servidor/http/respostas";
import { dataSql, like } from "@/lib/servidor/repositorios/consultas";
import type { Paginacao, SessaoApi, TipoUsuario } from "@/lib/servidor/tipos";

type Linha = RowDataPacket & Record<string, any>;

const camposLivro = `
  l.id_livro,
  l.etiqueta_rfid,
  l.nome_livro,
  l.autor_livro,
  l.categoria_livro,
  l.isbn_livro,
  l.status_livro,
  l.id_localizacao,
  loc.setor,
  loc.estante,
  loc.divisoria,
  loc.numero
`;

export async function entrar(identificador: string, senha: string) {
  const usuario = await consultarUm<Linha>(
    `SELECT id_usuario, nome_usuario, email_usuario, tipo_usuario, senha_hash, senha_salt
       FROM usuarios
      WHERE email_usuario = :identificador OR cpf_usuario = :identificador
      LIMIT 1`,
    { identificador }
  );

  if (!usuario?.senha_hash || !usuario?.senha_salt || !senhaConfere(senha, usuario.senha_salt, usuario.senha_hash)) {
    throw new ErroApi(401, "CREDENCIAIS_INVALIDAS", "Email, CPF ou senha inválidos.");
  }

  const sessao: SessaoApi = {
    id_usuario: usuario.id_usuario,
    nome_usuario: usuario.nome_usuario,
    email_usuario: usuario.email_usuario,
    tipo_usuario: usuario.tipo_usuario
  };

  return { usuario: sessao, token: criarToken(sessao) };
}

export async function validarRosto(facial_token: string, id_usuario?: number) {
  if (!facial_token.startsWith("facial_mock_")) {
    throw new ErroApi(401, "ROSTO_NAO_RECONHECIDO", "Reconhecimento facial não validado.");
  }

  const usuario = id_usuario
    ? await consultarUm<Linha>(
        `SELECT id_usuario, nome_usuario, email_usuario, tipo_usuario FROM usuarios WHERE id_usuario = :id_usuario LIMIT 1`,
        { id_usuario }
      )
    : await consultarUm<Linha>(
        `SELECT id_usuario, nome_usuario, email_usuario, tipo_usuario FROM usuarios WHERE facial_usuario IS NOT NULL LIMIT 1`
      );

  if (!usuario) {
    throw new ErroApi(404, "USUARIO_NAO_ENCONTRADO", "Usuário não encontrado para validação facial.");
  }

  const sessao: SessaoApi = {
    id_usuario: usuario.id_usuario,
    nome_usuario: usuario.nome_usuario,
    email_usuario: usuario.email_usuario,
    tipo_usuario: usuario.tipo_usuario
  };

  return { usuario: sessao, token: criarToken(sessao), reconhecimento: "SIMULADO" };
}

export async function listarUsuarios(paginacao: Paginacao) {
  const usuarios = await consultar<Linha>(
    `SELECT id_usuario, nome_usuario, email_usuario, cpf_usuario, tipo_usuario, ativo
       FROM usuarios
      ORDER BY nome_usuario
      LIMIT :limite OFFSET :deslocamento`,
    paginacao
  );
  return usuarios;
}

export async function buscarUsuario(id_usuario: number) {
  const usuario = await consultarUm<Linha>(
    `SELECT id_usuario, nome_usuario, email_usuario, cpf_usuario, tipo_usuario, ativo, facial_usuario
       FROM usuarios
      WHERE id_usuario = :id_usuario
      LIMIT 1`,
    { id_usuario }
  );
  if (!usuario) throw new ErroApi(404, "USUARIO_NAO_ENCONTRADO", "Usuário não encontrado.");
  return usuario;
}

export async function criarUsuario(dados: Record<string, unknown>) {
  const senha = String(dados.senha ?? "LibCore@123");
  const senhaGerada = criarHashSenha(senha);
  const resultado = await executar(
    `INSERT INTO usuarios
      (nome_usuario, email_usuario, cpf_usuario, facial_usuario, tipo_usuario, ativo, senha_hash, senha_salt)
     VALUES
      (:nome_usuario, :email_usuario, :cpf_usuario, :facial_usuario, :tipo_usuario, 1, :senha_hash, :senha_salt)`,
    {
      nome_usuario: dados.nome_usuario,
      email_usuario: dados.email_usuario,
      cpf_usuario: dados.cpf_usuario,
      facial_usuario: dados.facial_usuario ?? null,
      tipo_usuario: dados.tipo_usuario ?? "LEITOR",
      senha_hash: senhaGerada.hash,
      senha_salt: senhaGerada.salt
    }
  );
  return buscarUsuario(resultado.insertId);
}

export async function atualizarUsuario(id_usuario: number, dados: Record<string, unknown>) {
  await executar(
    `UPDATE usuarios
        SET nome_usuario = COALESCE(:nome_usuario, nome_usuario),
            email_usuario = COALESCE(:email_usuario, email_usuario),
            cpf_usuario = COALESCE(:cpf_usuario, cpf_usuario),
            facial_usuario = COALESCE(:facial_usuario, facial_usuario),
            tipo_usuario = COALESCE(:tipo_usuario, tipo_usuario)
      WHERE id_usuario = :id_usuario`,
    { ...dados, id_usuario }
  );
  return buscarUsuario(id_usuario);
}

export async function bloquearUsuario(id_usuario: number) {
  await executar(`UPDATE usuarios SET ativo = 0 WHERE id_usuario = :id_usuario`, { id_usuario });
  return buscarUsuario(id_usuario);
}

export async function listarLivros(url: string, paginacao: Paginacao) {
  const parametrosUrl = new URL(url).searchParams;
  const busca = parametrosUrl.get("busca");
  const categoria = parametrosUrl.get("categoria");
  const status = parametrosUrl.get("status");

  return consultar<Linha>(
    `SELECT ${camposLivro}
       FROM livros l
       LEFT JOIN localizacao_livro loc ON loc.id_localizacao = l.id_localizacao
      WHERE (:busca IS NULL OR l.nome_livro LIKE :busca_like OR l.autor_livro LIKE :busca_like OR l.categoria_livro LIKE :busca_like)
        AND (:categoria IS NULL OR l.categoria_livro = :categoria)
        AND (:status IS NULL OR l.status_livro = :status)
      ORDER BY l.nome_livro
      LIMIT :limite OFFSET :deslocamento`,
    { ...paginacao, busca, busca_like: like(busca), categoria, status }
  );
}

export async function buscarLivro(id_livro: number) {
  const livro = await consultarUm<Linha>(
    `SELECT ${camposLivro}
       FROM livros l
       LEFT JOIN localizacao_livro loc ON loc.id_localizacao = l.id_localizacao
      WHERE l.id_livro = :id_livro
      LIMIT 1`,
    { id_livro }
  );
  if (!livro) throw new ErroApi(404, "LIVRO_NAO_ENCONTRADO", "Livro não encontrado.");
  return livro;
}

export async function buscarLivroPorRfid(etiqueta_rfid: string) {
  const livro = await consultarUm<Linha>(
    `SELECT ${camposLivro}
       FROM livros l
       LEFT JOIN localizacao_livro loc ON loc.id_localizacao = l.id_localizacao
      WHERE l.etiqueta_rfid = :etiqueta_rfid
      LIMIT 1`,
    { etiqueta_rfid }
  );
  if (!livro) throw new ErroApi(404, "LIVRO_NAO_ENCONTRADO", "Livro não encontrado para a etiqueta RFID informada.");
  return livro;
}

export async function criarLivro(dados: Record<string, unknown>) {
  const resultado = await executar(
    `INSERT INTO livros
      (etiqueta_rfid, nome_livro, autor_livro, categoria_livro, isbn_livro, status_livro, id_localizacao)
     VALUES
      (:etiqueta_rfid, :nome_livro, :autor_livro, :categoria_livro, :isbn_livro, 'DISPONIVEL', :id_localizacao)`,
    {
      etiqueta_rfid: dados.etiqueta_rfid,
      nome_livro: dados.nome_livro,
      autor_livro: dados.autor_livro ?? null,
      categoria_livro: dados.categoria_livro ?? null,
      isbn_livro: dados.isbn_livro ?? null,
      id_localizacao: dados.id_localizacao ?? null
    }
  );
  return buscarLivro(resultado.insertId);
}

export async function atualizarLivro(id_livro: number, dados: Record<string, unknown>) {
  await executar(
    `UPDATE livros
        SET etiqueta_rfid = COALESCE(:etiqueta_rfid, etiqueta_rfid),
            nome_livro = COALESCE(:nome_livro, nome_livro),
            autor_livro = COALESCE(:autor_livro, autor_livro),
            categoria_livro = COALESCE(:categoria_livro, categoria_livro),
            isbn_livro = COALESCE(:isbn_livro, isbn_livro),
            status_livro = COALESCE(:status_livro, status_livro),
            id_localizacao = COALESCE(:id_localizacao, id_localizacao)
      WHERE id_livro = :id_livro`,
    { ...dados, id_livro }
  );
  return buscarLivro(id_livro);
}

export async function removerLivro(id_livro: number) {
  await executar(`DELETE FROM livros WHERE id_livro = :id_livro`, { id_livro });
}

export async function listarLocalizacoes() {
  return consultar<Linha>(`SELECT * FROM localizacao_livro ORDER BY setor, estante, divisoria, numero`);
}

export async function criarLocalizacao(dados: Record<string, unknown>) {
  const resultado = await executar(
    `INSERT INTO localizacao_livro (setor, estante, divisoria, numero)
     VALUES (:setor, :estante, :divisoria, :numero)`,
    dados
  );
  return consultarUm<Linha>(`SELECT * FROM localizacao_livro WHERE id_localizacao = :id`, { id: resultado.insertId });
}

export async function emprestarLivro(id_usuario: number, etiqueta_rfid: string) {
  const livro = await buscarLivroPorRfid(etiqueta_rfid);
  if (livro.status_livro !== "DISPONIVEL") {
    throw new ErroApi(409, "LIVRO_INDISPONIVEL", "Livro indisponível para empréstimo.");
  }
  const prevista = new Date();
  prevista.setDate(prevista.getDate() + Number(process.env.DIAS_EMPRESTIMO ?? 7));
  await executar(
    `INSERT INTO emprestimos (id_usuario, id_livro, data_saida, data_prevista, status)
     VALUES (:id_usuario, :id_livro, NOW(), :data_prevista, 'ATIVO')`,
    { id_usuario, id_livro: livro.id_livro, data_prevista: dataSql(prevista) }
  );
  await executar(`UPDATE livros SET status_livro = 'EMPRESTADO' WHERE id_livro = :id_livro`, { id_livro: livro.id_livro });
  await registrarTransacao("EMPRESTIMO", id_usuario, livro.id_livro);
  return buscarLivro(livro.id_livro);
}

export async function devolverLivro(id_usuario: number, etiqueta_rfid: string) {
  const livro = await buscarLivroPorRfid(etiqueta_rfid);
  const emprestimo = await consultarUm<Linha>(
    `SELECT * FROM emprestimos WHERE id_livro = :id_livro AND status = 'ATIVO' ORDER BY id_emprestimo DESC LIMIT 1`,
    { id_livro: livro.id_livro }
  );
  if (!emprestimo) throw new ErroApi(409, "EMPRESTIMO_NAO_ENCONTRADO", "Não há empréstimo ativo para este livro.");

  await executar(
    `UPDATE emprestimos SET data_devolucao = NOW(), status = 'DEVOLVIDO' WHERE id_emprestimo = :id_emprestimo`,
    { id_emprestimo: emprestimo.id_emprestimo }
  );
  await executar(`UPDATE livros SET status_livro = 'DISPONIVEL' WHERE id_livro = :id_livro`, { id_livro: livro.id_livro });
  await registrarTransacao("DEVOLUCAO", id_usuario, livro.id_livro);
  return buscarLivro(livro.id_livro);
}

export async function registrarTransacao(tipo: string, id_usuario: number, id_livro: number) {
  await executar(
    `INSERT INTO transacoes (tipo, data, id_usuario, id_livro) VALUES (:tipo, NOW(), :id_usuario, :id_livro)`,
    { tipo, id_usuario, id_livro }
  );
}

export async function listarEmprestimos(sessao: SessaoApi, apenasMeus = false) {
  return consultar<Linha>(
    `SELECT e.*, u.nome_usuario, l.nome_livro, l.etiqueta_rfid
       FROM emprestimos e
       JOIN usuarios u ON u.id_usuario = e.id_usuario
       JOIN livros l ON l.id_livro = e.id_livro
      WHERE (:apenasMeus = 0 OR e.id_usuario = :id_usuario)
      ORDER BY e.data_saida DESC`,
    { apenasMeus: apenasMeus ? 1 : 0, id_usuario: sessao.id_usuario }
  );
}

export async function listarTransacoes() {
  return consultar<Linha>(
    `SELECT t.*, u.nome_usuario, l.nome_livro
       FROM transacoes t
       JOIN usuarios u ON u.id_usuario = t.id_usuario
       JOIN livros l ON l.id_livro = t.id_livro
      ORDER BY t.data DESC`
  );
}

export async function listarEspacos() {
  return consultar<Linha>(`SELECT * FROM espacos ORDER BY nome_espaco`);
}

export async function criarEspaco(dados: Record<string, unknown>) {
  const resultado = await executar(
    `INSERT INTO espacos (nome_espaco, tipo_espaco, capacidade, ativo)
     VALUES (:nome_espaco, :tipo_espaco, :capacidade, 1)`,
    dados
  );
  return consultarUm<Linha>(`SELECT * FROM espacos WHERE id_espaco = :id`, { id: resultado.insertId });
}

export async function criarReserva(id_usuario: number, dados: Record<string, unknown>) {
  const conflito = await consultarUm<Linha>(
    `SELECT id_reserva FROM reservas
      WHERE id_espaco = :id_espaco
        AND data_reserva = :data_reserva
        AND horario_inicio < :horario_fim
        AND horario_fim > :horario_inicio
        AND status_reserva = 'CONFIRMADA'
      LIMIT 1`,
    dados
  );
  if (conflito) throw new ErroApi(409, "RESERVA_CONFLITANTE", "Já existe reserva confirmada para este espaço e horário.");

  const resultado = await executar(
    `INSERT INTO reservas (id_usuario, id_espaco, data_reserva, horario_inicio, horario_fim, status_reserva)
     VALUES (:id_usuario, :id_espaco, :data_reserva, :horario_inicio, :horario_fim, 'CONFIRMADA')`,
    { ...dados, id_usuario }
  );
  return consultarUm<Linha>(`SELECT * FROM reservas WHERE id_reserva = :id`, { id: resultado.insertId });
}

export async function listarReservas(sessao: SessaoApi) {
  return consultar<Linha>(
    `SELECT r.*, e.nome_espaco
       FROM reservas r
       JOIN espacos e ON e.id_espaco = r.id_espaco
      WHERE (:admin = 1 OR r.id_usuario = :id_usuario)
      ORDER BY r.data_reserva DESC, r.horario_inicio DESC`,
    { admin: sessao.tipo_usuario === "ADMIN" || sessao.tipo_usuario === "BIBLIOTECARIO" ? 1 : 0, id_usuario: sessao.id_usuario }
  );
}

export async function cancelarReserva(id_reserva: number, sessao: SessaoApi) {
  await executar(
    `UPDATE reservas SET status_reserva = 'CANCELADA'
      WHERE id_reserva = :id_reserva
        AND (:admin = 1 OR id_usuario = :id_usuario)`,
    { id_reserva, admin: sessao.tipo_usuario === "ADMIN" || sessao.tipo_usuario === "BIBLIOTECARIO" ? 1 : 0, id_usuario: sessao.id_usuario }
  );
}

export async function listarTickets(sessao: SessaoApi) {
  return consultar<Linha>(
    `SELECT t.*, u.nome_usuario
       FROM tickets t
       JOIN usuarios u ON u.id_usuario = t.id_usuario
      WHERE (:admin = 1 OR t.id_usuario = :id_usuario)
      ORDER BY t.data_criacao DESC`,
    { admin: sessao.tipo_usuario === "ADMIN" || sessao.tipo_usuario === "BIBLIOTECARIO" ? 1 : 0, id_usuario: sessao.id_usuario }
  );
}

export async function buscarTicket(id_ticket: number, sessao: SessaoApi) {
  const ticket = await consultarUm<Linha>(
    `SELECT t.*, u.nome_usuario
       FROM tickets t
       JOIN usuarios u ON u.id_usuario = t.id_usuario
      WHERE t.id_ticket = :id_ticket
        AND (:admin = 1 OR t.id_usuario = :id_usuario)
      LIMIT 1`,
    { id_ticket, admin: sessao.tipo_usuario === "ADMIN" || sessao.tipo_usuario === "BIBLIOTECARIO" ? 1 : 0, id_usuario: sessao.id_usuario }
  );
  if (!ticket) throw new ErroApi(404, "TICKET_NAO_ENCONTRADO", "Ticket não encontrado.");
  return ticket;
}

export async function criarTicket(id_usuario: number, dados: Record<string, unknown>) {
  const resultado = await executar(
    `INSERT INTO tickets (status, tipo, descricao, id_usuario) VALUES ('ABERTO', :tipo, :descricao, :id_usuario)`,
    { tipo: dados.tipo, descricao: dados.descricao ?? null, id_usuario }
  );
  return consultarUm<Linha>(`SELECT * FROM tickets WHERE id_ticket = :id`, { id: resultado.insertId });
}

export async function atualizarTicket(id_ticket: number, dados: Record<string, unknown>) {
  await executar(
    `UPDATE tickets
        SET status = COALESCE(:status, status),
            tipo = COALESCE(:tipo, tipo),
            descricao = COALESCE(:descricao, descricao),
            data_finalizacao = CASE WHEN :status = 'FINALIZADO' THEN NOW() ELSE data_finalizacao END
      WHERE id_ticket = :id_ticket`,
    { ...dados, id_ticket }
  );
  return consultarUm<Linha>(`SELECT * FROM tickets WHERE id_ticket = :id_ticket`, { id_ticket });
}

export async function finalizarTicket(id_ticket: number) {
  await executar(
    `UPDATE tickets SET status = 'FINALIZADO', data_finalizacao = NOW() WHERE id_ticket = :id_ticket`,
    { id_ticket }
  );
}

export async function listarNotificacoes(sessao: SessaoApi) {
  return consultar<Linha>(
    `SELECT * FROM notificacoes
      WHERE id_usuario IS NULL OR id_usuario = :id_usuario
      ORDER BY data_criacao DESC`,
    { id_usuario: sessao.id_usuario }
  );
}

export async function marcarNotificacaoComoLida(id_notificacao: number, sessao: SessaoApi) {
  await executar(
    `UPDATE notificacoes SET lida = 1 WHERE id_notificacao = :id_notificacao AND (id_usuario IS NULL OR id_usuario = :id_usuario)`,
    { id_notificacao, id_usuario: sessao.id_usuario }
  );
}

export async function listarMultas(sessao: SessaoApi) {
  return consultar<Linha>(
    `SELECT * FROM multas WHERE (:admin = 1 OR id_usuario = :id_usuario) ORDER BY data_criacao DESC`,
    { admin: sessao.tipo_usuario === "ADMIN" || sessao.tipo_usuario === "BIBLIOTECARIO" ? 1 : 0, id_usuario: sessao.id_usuario }
  );
}

export async function pagarMulta(id_multa: number, sessao: SessaoApi) {
  await executar(
    `UPDATE multas
        SET status_multa = 'PAGA', data_pagamento = NOW()
      WHERE id_multa = :id_multa
        AND (:admin = 1 OR id_usuario = :id_usuario)`,
    { id_multa, admin: sessao.tipo_usuario === "ADMIN" || sessao.tipo_usuario === "BIBLIOTECARIO" ? 1 : 0, id_usuario: sessao.id_usuario }
  );
}

export async function painelAdmin() {
  const [usuarios, livros, emprestimos, tickets] = await Promise.all([
    consultarUm<Linha>(`SELECT COUNT(*) total FROM usuarios`),
    consultarUm<Linha>(`SELECT COUNT(*) total FROM livros`),
    consultarUm<Linha>(`SELECT COUNT(*) total FROM emprestimos WHERE status = 'ATIVO'`),
    consultarUm<Linha>(`SELECT COUNT(*) total FROM tickets WHERE status <> 'FINALIZADO'`)
  ]);
  return {
    total_usuarios: usuarios?.total ?? 0,
    total_livros: livros?.total ?? 0,
    emprestimos_ativos: emprestimos?.total ?? 0,
    tickets_abertos: tickets?.total ?? 0
  };
}

export async function auditoria() {
  return consultar<Linha>(`SELECT * FROM auditoria ORDER BY data_evento DESC LIMIT 100`);
}

export async function relatorios() {
  const livrosPorStatus = await consultar<Linha>(`SELECT status_livro, COUNT(*) total FROM livros GROUP BY status_livro`);
  const transacoesPorTipo = await consultar<Linha>(`SELECT tipo, COUNT(*) total FROM transacoes GROUP BY tipo`);
  return { livros_por_status: livrosPorStatus, transacoes_por_tipo: transacoesPorTipo };
}
