import WebSocket from "ws";
import dotenv from "dotenv";
import { injectParamsInScript } from "../../utils/injectPramasInScript";

dotenv.config();

type RealtimeOptions = {
  onOpen: () => void;
  onMessage: (data: any) => void;
  onClose: () => void;
  onError: (err: any) => void;
};

type ScriptParams = {
  jobDescription?: string;
  candidateName?: string;
  companyName?: string;
  language?: string;
};

export function createOpenAIRealtimeSocket(
  scriptParams: ScriptParams,
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

        instructions: injectParamsInScript(process.env.AI_SCRIPT ?? "", {
          candidateName: scriptParams.candidateName ?? "",
          companyName: scriptParams.companyName ?? "",
          jobDescription: scriptParams.jobDescription ?? "",
          language: scriptParams.language ?? "pt",
        }),
        temperature: 0.6,
        modalities: ["text", "audio"],
        input_audio_transcription: {
          model: "gpt-4o-transcribe",
          language: scriptParams.language ?? "pt",
          prompt: `
            Você deve transcrever com precisão o que for falado em ${scriptParams.language}, com pontuação correta, acentos e separação de frases.
            Não tente fazer aproximações da palavra dita com palvras existentes.
            Se houver palavras ou nomes em inglês, mantenha-os como estão, sem traduzir.
            Ignore ruídos ou hesitações. Atente-se para transcrever corretamente o nome da empresa que é ${scriptParams.companyName}
          `,
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
