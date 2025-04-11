import WebSocket from "ws";
import { RealtimeTranscriber } from "./RealTimeTranscriber";

export class OpenAIRealtimeTranscriber implements RealtimeTranscriber {
  private ws?: WebSocket;
  private onTranscriptCallback?: (text: string, isFinal: boolean) => void;

  async connect() {
    const url = "wss://api.openai.com/v1/audio/transcriptions/live";
    this.ws = new WebSocket(url, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    this.ws.on("open", () => {
      const startMessage = {
        type: "start",
        config: {
          language: "pt",
          encoding: "pcm_s16le",
          sample_rate: 16000,
        },
      };
      this.ws?.send(JSON.stringify(startMessage));
    });

    this.ws.on("message", (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === "transcript") {
        const text = msg.text || "";
        const isFinal = msg.final || false;
        this.onTranscriptCallback?.(text, isFinal);
      }
    });
  }

  sendAudioChunk(chunk: Buffer) {
    this.ws?.send(chunk);
  }

  close() {
    this.ws?.close();
  }

  onTranscription(callback: (text: string, isFinal: boolean) => void) {
    this.onTranscriptCallback = callback;
  }
}
