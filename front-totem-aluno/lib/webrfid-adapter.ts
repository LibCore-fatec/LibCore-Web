export type WebRfidReading = {
  etiqueta_rfid: string;
  source: "webrfid" | "webnfc" | "keyboard" | "demo";
};

type ReaderApi = {
  connect?: () => Promise<void> | void;
  read?: () => Promise<string | { etiqueta_rfid?: string; rfid?: string; tag?: string; uid?: string; serialNumber?: string }>;
  readTag?: () => Promise<string | { etiqueta_rfid?: string; rfid?: string; tag?: string; uid?: string; serialNumber?: string }>;
  onReading?: (callback: (value: unknown) => void) => void;
};

type NDEFReadingEvent = Event & { serialNumber?: string };
type NDEFReaderInstance = {
  scan: () => Promise<void>;
  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: (() => void) | null;
};

declare global {
  interface Window {
    WebRFID?: ReaderApi;
    webRFID?: ReaderApi;
    NDEFReader?: new () => NDEFReaderInstance;
  }
}

const DEMO_TAGS = ["53:fd:3a:38:63:00:01", "RFID-TEC-1842", "RFID-TEC-2145"];

function normalize(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value.replace(/[\r\n\t ]+/g, "").trim();
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    const tag = object.etiqueta_rfid ?? object.rfid ?? object.tag ?? object.uid ?? object.serialNumber;
    if (typeof tag === "string") return normalize(tag);
    if (object.detail) return normalize(object.detail);
  }
  return "";
}

async function readFromWebRfid(): Promise<WebRfidReading | null> {
  const reader = window.WebRFID ?? window.webRFID;
  if (!reader) return null;
  await reader.connect?.();
  const method = reader.read ?? reader.readTag;
  if (method) {
    const etiqueta = normalize(await method.call(reader));
    if (etiqueta) return { etiqueta_rfid: etiqueta, source: "webrfid" };
  }
  if (reader.onReading) {
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Tempo esgotado no WebRFID.")), 8000);
      reader.onReading?.((value) => {
        window.clearTimeout(timeout);
        const etiqueta = normalize(value);
        if (etiqueta) resolve({ etiqueta_rfid: etiqueta, source: "webrfid" });
        else reject(new Error("Leitura WebRFID vazia."));
      });
    });
  }
  return null;
}

async function readFromWebNfc(): Promise<WebRfidReading | null> {
  const Reader = window.NDEFReader;
  if (!Reader || !window.isSecureContext) return null;
  return new Promise((resolve, reject) => {
    const reader = new Reader();
    const timeout = window.setTimeout(() => reject(new Error("Tempo esgotado no NFC.")), 8000);
    reader.onreading = (event) => {
      window.clearTimeout(timeout);
      const etiqueta = normalize(event.serialNumber);
      if (etiqueta) resolve({ etiqueta_rfid: etiqueta, source: "webnfc" });
      else reject(new Error("NFC sem serial."));
    };
    reader.onreadingerror = () => reject(new Error("Falha ao ler NFC."));
    reader.scan().catch(reject);
  });
}

function readFromKeyboard(): Promise<WebRfidReading> {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const timeout = window.setTimeout(() => {
      window.removeEventListener("keydown", onKeyDown, true);
      reject(new Error("Leitor em modo teclado não recebeu RFID."));
    }, 8000);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        const etiqueta = normalize(buffer);
        window.clearTimeout(timeout);
        window.removeEventListener("keydown", onKeyDown, true);
        if (etiqueta) resolve({ etiqueta_rfid: etiqueta, source: "keyboard" });
        else reject(new Error("RFID vazio."));
      } else if (event.key.length === 1) {
        buffer += event.key;
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
  });
}

export async function readRfidFromAvailableReader(options?: { allowDemo?: boolean }): Promise<WebRfidReading> {
  try {
    const webRfid = await readFromWebRfid();
    if (webRfid) return webRfid;
    const webNfc = await readFromWebNfc();
    if (webNfc) return webNfc;
    return await readFromKeyboard();
  } catch {
    if (options?.allowDemo ?? true) {
      const etiqueta = DEMO_TAGS[Math.floor(Date.now() / 1000) % DEMO_TAGS.length];
      return { etiqueta_rfid: etiqueta, source: "demo" };
    }
    throw new Error("Leitor RFID/NFC indisponível.");
  }
}
