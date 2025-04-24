import WebSocket from "ws";
import dotenv from "dotenv";

dotenv.config();

type RealtimeOptions = {
  onOpen: () => void;
  onMessage: (data: any) => void;
  onClose: () => void;
  onError: (err: any) => void;
};

export function createOpenAIRealtimeSocket(
  options: RealtimeOptions
): WebSocket {
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
      type: "session.update",
      session: {
        turn_detection: { type: "server_vad", silence_duration_ms: 1000 },
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        voice: "alloy",
        instructions: process.env.SYSTEM_MESSAGE,
        temperature: 0.8,
        input_audio_transcription: {
          model: "whisper-1",
        },
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
