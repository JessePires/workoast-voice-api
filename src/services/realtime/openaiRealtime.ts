import dotenv from "dotenv";
import WebSocket, { RawData } from "ws";
import { injectParamsInScript } from "../../utils/injectPramasInScript";
import { RealtimeOptions, ScriptParams } from "./openaiRealtime.types";

dotenv.config();

export function createOpenAIRealtimeSocket(
  options: RealtimeOptions,
  scriptParams?: ScriptParams
): WebSocket {
  const scriptWithParams = injectParamsInScript(process.env.AI_SCRIPT ?? "", {
    candidateName: scriptParams?.candidateName ?? "",
    companyName: scriptParams?.companyName ?? "",
    jobDescription: scriptParams?.jobDescription ?? "",
  });

  const ws = new WebSocket(
    "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "realtime=v1",
      },
    }
  );

  ws.on("open", () => {
    const payload = {
      type: "session.update",
      session: {
        turn_detection: { type: "server_vad", silence_duration_ms: 1000 },
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        voice: "alloy",
        instructions: scriptWithParams,
        temperature: 0.6,
        modalities: ["text", "audio"],
      },
    };

    ws.send(JSON.stringify(payload));
    options.onOpen();
  });

  ws.on("message", (data: RawData) => {
    options.onMessage(data.toString());

    // if (isBinary) {
    //   options.onAudio(data as Buffer);
    // } else {
    //   options.onMessage(data.toString());
    // }
  });

  ws.on("close", options.onClose);
  ws.on("error", options.onError);

  return ws;
}
