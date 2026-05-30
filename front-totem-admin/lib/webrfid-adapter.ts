export type WebRfidStatus = "CONNECTING" | "READY" | "WAITING" | "UNAVAILABLE" | "ERROR";

export type WebRfidReading = {
  etiqueta_rfid: string;
  source: "webrfid" | "webnfc" | "http" | "keyboard" | "manual";
};

type RfidValue = string | { etiqueta_rfid?: string; etiqueta?: string; rfid?: string; tag?: string; uid?: string; serialNumber?: string; id?: string };

type WebRfidGlobal = EventTarget & {
  connect?: () => Promise<void> | void;
  start?: () => Promise<void> | void;
  open?: () => Promise<void> | void;
  read?: () => Promise<RfidValue>;
  readTag?: () => Promise<RfidValue>;
  readOnce?: () => Promise<RfidValue>;
  scan?: () => Promise<RfidValue | void>;
  onReading?: (callback: (value: RfidValue) => void) => void;
  onreading?: ((event: unknown) => void) | null;
};

type NDEFReadingEvent = Event & {
  serialNumber?: string;
  message?: { records?: Array<{ data?: BufferSource; recordType?: string }> };
};

type NDEFReaderInstance = EventTarget & {
  scan: () => Promise<void>;
  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: (() => void) | null;
};

declare global {
  interface Window {
    WebRFID?: WebRfidGlobal;
    webRFID?: WebRfidGlobal;
    WebRfid?: WebRfidGlobal;
    webRfid?: WebRfidGlobal;
    RFIDReader?: WebRfidGlobal;
    rfidReader?: WebRfidGlobal;
    NDEFReader?: new () => NDEFReaderInstance;
  }
}

function normalizeReading(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    const direct = object.etiqueta_rfid ?? object.etiqueta ?? object.rfid ?? object.tag ?? object.uid ?? object.serialNumber ?? object.id;
    if (typeof direct === "string") return direct.trim();
    if (object.detail) return normalizeReading(object.detail);
    if (object.data) return normalizeReading(object.data);
  }
  return "";
}

function validTag(value: string) {
  return value.replace(/[\r\n\t ]+/g, "").trim();
}

async function readFromWebRfidGlobal(): Promise<WebRfidReading | null> {
  const reader = window.WebRFID ?? window.webRFID ?? window.WebRfid ?? window.webRfid ?? window.RFIDReader ?? window.rfidReader;
  if (!reader) return null;

  await reader.connect?.();
  await reader.open?.();
  await reader.start?.();

  const methods = [reader.read, reader.readTag, reader.readOnce, reader.scan].filter(Boolean) as Array<() => Promise<RfidValue | void>>;
  for (const method of methods) {
    const value = await method.call(reader);
    const etiqueta = validTag(normalizeReading(value));
    if (etiqueta) return { etiqueta_rfid: etiqueta, source: "webrfid" };
  }

  if (reader.onReading) {
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Tempo esgotado aguardando leitura WebRFID.")), 20000);
      reader.onReading?.((value) => {
        window.clearTimeout(timeout);
        const etiqueta = validTag(normalizeReading(value));
        if (!etiqueta) reject(new Error("WebRFID retornou leitura vazia."));
        else resolve({ etiqueta_rfid: etiqueta, source: "webrfid" });
      });
    });
  }

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("WebRFID instalado, mas não emitiu leitura.")), 20000);
    const done = (event: Event) => {
      window.clearTimeout(timeout);
      reader.removeEventListener?.("reading", done);
      reader.removeEventListener?.("rfid", done);
      reader.removeEventListener?.("tag", done);
      const etiqueta = validTag(normalizeReading(event));
      if (!etiqueta) reject(new Error("Evento WebRFID sem etiqueta."));
      else resolve({ etiqueta_rfid: etiqueta, source: "webrfid" });
    };
    reader.addEventListener?.("reading", done);
    reader.addEventListener?.("rfid", done);
    reader.addEventListener?.("tag", done);
  });
}

async function readFromHttpBridge(): Promise<WebRfidReading | null> {
  const configured = process.env.NEXT_PUBLIC_WEBRFID_URL;
  const urls = [
    configured,
    "http://127.0.0.1:8765/rfid/read",
    "http://localhost:8765/rfid/read",
    "http://127.0.0.1:3001/rfid/read",
  ].filter(Boolean) as string[];

  for (const url of urls) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2500);
    try {
      const response = await fetch(url, { cache: "no-store", signal: controller.signal });
      const contentType = response.headers.get("content-type") ?? "";
      const value = contentType.includes("application/json") ? await response.json() : await response.text();
      const etiqueta = validTag(normalizeReading(value));
      if (response.ok && etiqueta) return { etiqueta_rfid: etiqueta, source: "http" };
    } catch {
      // tenta o próximo contrato conhecido sem ocultar o erro final
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return null;
}

async function readFromWebNfc(): Promise<WebRfidReading | null> {
  const Reader = window.NDEFReader;
  if (!Reader) return null;

  if (!window.isSecureContext) {
    throw new Error("Web NFC exige HTTPS ou localhost seguro.");
  }

  return new Promise((resolve, reject) => {
    const reader = new Reader();
    const timeout = window.setTimeout(() => reject(new Error("Tempo esgotado aguardando etiqueta NFC.")), 20000);
    reader.onreading = (event) => {
      window.clearTimeout(timeout);
      const etiqueta = validTag(event.serialNumber ?? "");
      if (!etiqueta) reject(new Error("Etiqueta NFC lida sem serialNumber."));
      else resolve({ etiqueta_rfid: etiqueta, source: "webnfc" });
    };
    reader.onreadingerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("Falha na leitura NFC. Reaproxime a etiqueta."));
    };
    reader.scan().catch((error) => {
      window.clearTimeout(timeout);
      reject(error);
    });
  });
}

function readFromKeyboardWedge(): Promise<WebRfidReading> {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const timeout = window.setTimeout(() => {
      window.removeEventListener("keydown", onKeyDown, true);
      reject(new Error("Nenhum RFID recebido pelo leitor em modo teclado."));
    }, 20000);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        const etiqueta = validTag(buffer);
        buffer = "";
        window.clearTimeout(timeout);
        window.removeEventListener("keydown", onKeyDown, true);
        if (etiqueta.length < 3) reject(new Error("Leitura RFID em modo teclado muito curta."));
        else resolve({ etiqueta_rfid: etiqueta, source: "keyboard" });
        return;
      }
      if (event.key.length === 1) buffer += event.key;
    };

    window.addEventListener("keydown", onKeyDown, true);
  });
}

export async function readRfidFromAvailableReader(): Promise<WebRfidReading> {
  const errors: string[] = [];

  for (const read of [readFromWebRfidGlobal, readFromHttpBridge, readFromWebNfc]) {
    try {
      const result = await read();
      if (result?.etiqueta_rfid) return result;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "falha desconhecida");
    }
  }

  try {
    return await readFromKeyboardWedge();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "falha no modo teclado");
  }

  throw new Error(`RFID indisponível. Tentativas: ${errors.join(" | ") || "nenhum contrato WebRFID/NFC encontrado"}`);
}
