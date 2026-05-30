import { apiFetch, salvarToken } from "@/lib/api/client";
import { mapearEmprestimoApi, mapearEspacoApi, mapearLivroApi } from "@/lib/api/mappers";
import type { CatalogBook, Espaco, Reserva, StudySpace, Ticket, TokenValidacao, Usuario } from "@/lib/types";

export const autenticacaoApi = {
  async entrar(identificador: string, senha: string) {
    const resposta = await apiFetch<{ usuario: Usuario; token: string }>("/api/v1/autenticacao/entrar", {
      method: "POST",
      body: JSON.stringify({ identificador, senha })
    });
    salvarToken(resposta.token);
    return resposta;
  }
};

export const livrosApi = {
  async listar() {
    const livros = await apiFetch<Record<string, unknown>[]>("/api/v1/livros");
    return livros.map(mapearLivroApi);
  }
};

export const emprestimosApi = {
  async meus() {
    const emprestimos = await apiFetch<Record<string, unknown>[]>("/api/v1/emprestimos/meus");
    return emprestimos.map(mapearEmprestimoApi);
  }
};

export const reservasApi = {
  async listarEspacos(): Promise<StudySpace[]> {
    const espacos = await apiFetch<Espaco[]>("/api/v1/espacos");
    return espacos.map(mapearEspacoApi);
  },
  async listar() {
    return apiFetch<Reserva[]>("/api/v1/reservas");
  },
  async criar(id_espaco: number) {
    const hoje = new Date().toISOString().slice(0, 10);
    return apiFetch<Reserva>("/api/v1/reservas", {
      method: "POST",
      body: JSON.stringify({
        id_espaco,
        data_reserva: hoje,
        horario_inicio: "14:00:00",
        horario_fim: "16:00:00"
      })
    });
  }
};

export const ticketsApi = {
  async listar() {
    return apiFetch<Ticket[]>("/api/v1/tickets");
  },
  async criar(descricao: string) {
    return apiFetch<Ticket>("/api/v1/tickets", {
      method: "POST",
      body: JSON.stringify({ tipo: "GERAL", descricao })
    });
  }
};

export const usuariosApi = {
  async meuToken() {
    return apiFetch<TokenValidacao>("/api/v1/usuarios/meu-token");
  },
  async gerarToken() {
    return apiFetch<TokenValidacao>("/api/v1/usuarios/meu-token/gerar", { method: "POST" });
  }
};

export const totemPrincipalApi = {
  validarToken(token_validacao: string) {
    return apiFetch<{ usuario: Usuario; validado: boolean }>("/api/v1/totem-principal/validar-token", {
      method: "POST",
      body: JSON.stringify({ token_validacao })
    });
  },
  async buscarLivro(etiqueta_rfid: string): Promise<CatalogBook> {
    return mapearLivroApi(await apiFetch<Record<string, unknown>>(`/api/v1/totem-principal/livro/${encodeURIComponent(etiqueta_rfid)}`));
  },
  emprestar(token_validacao: string, etiqueta_rfid: string) {
    return apiFetch("/api/v1/totem-principal/emprestar", {
      method: "POST",
      body: JSON.stringify({ token_validacao, etiqueta_rfid })
    });
  },
  devolver(token_validacao: string, etiqueta_rfid: string) {
    return apiFetch("/api/v1/totem-principal/devolver", {
      method: "POST",
      body: JSON.stringify({ token_validacao, etiqueta_rfid })
    });
  }
};
