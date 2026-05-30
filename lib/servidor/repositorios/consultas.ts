export function like(valor: string | null) {
  return valor ? `%${valor}%` : "%";
}

export function dataSql(data: Date) {
  return data.toISOString().slice(0, 19).replace("T", " ");
}
