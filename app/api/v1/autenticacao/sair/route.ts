export const dynamic = "force-dynamic";

import { semConteudo } from "@/lib/servidor/http/respostas";

export async function POST() {
  return semConteudo();
}

