import { NextResponse } from 'next/server';
import { devolverLivroPorRfid } from '@/lib/server/admin-loans';

export async function POST(request: Request) {
 const body = await request.json();
 const result = await devolverLivroPorRfid({
   etiqueta_rfid: String(body.etiqueta_rfid),
   id_usuario: Number(body.id_usuario),
 });
 return NextResponse.json({ data: result });
}
