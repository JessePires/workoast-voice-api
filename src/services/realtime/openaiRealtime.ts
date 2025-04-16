import WebSocket from "ws";
import dotenv from "dotenv";

dotenv.config();

type RealtimeOptions = {
  onOpen: () => void;
  onMessage: (data: string) => void;
  onClose: () => void;
  onError: (err: any) => void;
};

export function createOpenAIRealtimeSocket(
  options: RealtimeOptions
): WebSocket {
  console.log("process.env.OPENAI_API_KEY", process.env.OPENAI_API_KEY);
  const url =
    "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17";
  const ws = new WebSocket(url, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "OpenAI-Beta": "realtime=v1",
    },
  });

  ws.on("open", () => {
    const payload = {
      type: "start",
      data: {
        format: "opus",
        sample_rate: 16000,
        encoding: "audio/ogg",
        language: "pt",
      },
    };

    ws.send(JSON.stringify(payload));
    options.onOpen();
  });

  ws.on("message", (data) => {
    options.onMessage(data.toString());
  });

  ws.on("error", options.onError);
  ws.on("close", options.onClose);

  return ws;
}
