export type WebRfidStatus = "CONNECTING" | "READY" | "WAITING" | "UNAVAILABLE" | "ERROR";

export type WebRfidReading = {
  etiqueta_rfid: string;
  source: "webrfid" | "webnfc" | "manual";
};

type WebRfidGlobal = {
  connect?: () => Promise<void> | void;
  read?: () => Promise<string | { etiqueta_rfid?: string; rfid?: string; tag?: string }>;
  onReading?: (callback: (value: string | { etiqueta_rfid?: string; rfid?: string; tag?: string }) => void) => void;
};

type NDEFReadingEvent = Event & { serialNumber?: string };
type NDEFReaderInstance = {
  scan: () => Promise<void>;
  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: (() => void) | null;
};

declare global {
  interface Window {
    WebRFID?: WebRfidGlobal;
    webRFID?: WebRfidGlobal;
    NDEFReader?: new () => NDEFReaderInstance;
  }
}

function normalizeReading(value: string | { etiqueta_rfid?: string; rfid?: string; tag?: string }) {
  return typeof value === "string"
    ? value.trim()
    : String(value.etiqueta_rfid ?? value.rfid ?? value.tag ?? "").trim();
}

export async function readRfidFromAvailableReader(): Promise<WebRfidReading> {
  const webRfid = window.WebRFID ?? window.webRFID;

  if (webRfid?.read) {
    await webRfid.connect?.();
    const etiqueta = normalizeReading(await webRfid.read());
    if (!etiqueta) throw new Error("Leitor WebRFID retornou uma leitura vazia.");
    return { etiqueta_rfid: etiqueta, source: "webrfid" };
  }

  if (webRfid?.onReading) {
    await webRfid.connect?.();
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("Tempo esgotado aguardando leitura WebRFID.")), 20000);
      webRfid.onReading?.((value) => {
        window.clearTimeout(timeout);
        const etiqueta = normalizeReading(value);
        if (!etiqueta) {
          reject(new Error("Leitor WebRFID retornou uma leitura vazia."));
          return;
        }
        resolve({ etiqueta_rfid: etiqueta, source: "webrfid" });
      });
    });
  }

  const Reader = window.NDEFReader;
  if (Reader) {
    return new Promise((resolve, reject) => {
      const reader = new Reader();
      reader.scan().catch(reject);
      reader.onreading = (event) => {
        const etiqueta = event.serialNumber?.trim();
        if (!etiqueta) {
          reject(new Error("Etiqueta NFC lida, mas sem serial identificável."));
          return;
        }
        resolve({ etiqueta_rfid: etiqueta, source: "webnfc" });
      };
      reader.onreadingerror = () => reject(new Error("Falha ao ler a etiqueta NFC."));
    });
  }

  throw new Error("Nenhum leitor WebRFID/Web NFC disponível neste ambiente.");
}
