import type { CatalogBook, Espaco, LoanRecord, LocalizacaoLivro, StudySpace, TipoTransacao } from "@/lib/types";
import { formatLocation } from "@/lib/mock-data";

const statusLivroLabels: Record<string, string> = {
  DISPONIVEL: "Disponível",
  EMPRESTADO: "Emprestado",
  RESERVADO: "Reservado",
  MANUTENCAO: "Manutenção",
  INDISPONIVEL: "Indisponível"
};

const tipoEspacoLabels: Record<string, string> = {
  SALA_ESTUDO: "Grupo",
  MESA_INDIVIDUAL: "Individual",
  AREA_LEITURA: "Leitura"
};

function montarLocalizacao(livro: Record<string, unknown>): LocalizacaoLivro | null {
  if (!livro.id_localizacao) return null;
  return {
    id_localizacao: Number(livro.id_localizacao),
    setor: String(livro.setor ?? ""),
    estante: String(livro.estante ?? ""),
    divisoria: String(livro.divisoria ?? ""),
    numero: Number(livro.numero ?? 0)
  };
}

export function mapearLivroApi(livro: Record<string, unknown>): CatalogBook {
  const localizacao = montarLocalizacao(livro);
  const status = String(livro.status_livro ?? "DISPONIVEL") as CatalogBook["status"];

  return {
    id_livro: Number(livro.id_livro),
    etiqueta_rfid: String(livro.etiqueta_rfid ?? ""),
    nome_livro: String(livro.nome_livro ?? "Livro sem nome"),
    autor_livro: livro.autor_livro ? String(livro.autor_livro) : null,
    categoria_livro: livro.categoria_livro ? String(livro.categoria_livro) : null,
    isbn_livro: livro.isbn_livro ? String(livro.isbn_livro) : null,
    status_livro: status,
    id_localizacao: localizacao?.id_localizacao ?? null,
    status,
    statusLabel: statusLivroLabels[status] ?? status,
    localizacao,
    locationLabel: formatLocation(localizacao)
  };
}

export function mapearEmprestimoApi(item: Record<string, unknown>): LoanRecord {
  const tipo = String(item.tipo ?? (item.status === "DEVOLVIDO" ? "DEVOLUCAO" : "EMPRESTIMO")) as TipoTransacao;
  const data = String(item.data_saida ?? item.data ?? new Date().toISOString());
  const prevista = item.data_prevista ? new Date(String(item.data_prevista)).toLocaleDateString("pt-BR") : "Sem previsão";

  return {
    id_transacao: Number(item.id_transacao ?? item.id_emprestimo ?? 0),
    tipo,
    data,
    id_usuario: Number(item.id_usuario),
    id_livro: Number(item.id_livro),
    livro_nome: String(item.nome_livro ?? item.livro_nome ?? "Livro não identificado"),
    statusLabel: tipo === "DEVOLUCAO" ? "Devolvido" : "Em andamento",
    dateLabel: new Date(data).toLocaleDateString("pt-BR"),
    dueLabel: `Devolução em ${prevista}`
  };
}

export function mapearEspacoApi(espaco: Espaco): StudySpace {
  return {
    id: String(espaco.id_espaco),
    name: espaco.nome_espaco,
    type: tipoEspacoLabels[espaco.tipo_espaco] ?? espaco.tipo_espaco,
    capacity: `${espaco.capacidade} ${espaco.capacidade === 1 ? "pessoa" : "pessoas"}`,
    time: "Escolha um horário disponível"
  };
}
