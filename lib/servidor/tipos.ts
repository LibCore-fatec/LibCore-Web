export type TipoUsuario = "LEITOR" | "BIBLIOTECARIO" | "ADMIN" | "TOTEM";

export type SessaoApi = {
  id_usuario: number;
  nome_usuario: string;
  email_usuario: string;
  tipo_usuario: TipoUsuario;
};

export type Paginacao = {
  pagina: number;
  limite: number;
  deslocamento: number;
};
