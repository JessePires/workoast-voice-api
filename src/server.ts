import Fastify from "fastify";
import fastifyWs from "@fastify/websocket";
import WebSocket from "ws";
import { v4 as uuid } from "uuid";
import { createOpenAIRealtimeSocket } from "./services/realtime/openaiRealtime";

const fastify = Fastify();
fastify.register(fastifyWs);

type ClientInfo = {
  id: string;
  aiSocket?: WebSocket;
};

fastify.register(async function (fastify) {
  fastify.get("/ws", { websocket: true }, (clientSocket, req: any) => {
    const clientId = uuid();
    const clientInfo: ClientInfo = { id: clientId };

    console.log(`🟢 Client connected: ${clientId}`);

    let canSendAudio = false;

    const aiSocket = createOpenAIRealtimeSocket(
      {
        candidateName: req.query.candidateName,
        jobDescription: req.query.jobDescription,
        companyName: req.query.companyName,
        language: req.query.language,
      },
      {
        onOpen() {
          console.log("🔁 Connected to OpenAI Realtime API");
        },

        onMessage(message) {
          const parsed = JSON.parse(message);

          if (parsed.type === "session.updated") {
            canSendAudio = true;
          }

          if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(message);
          }
        },

        onError(error) {
          console.error("❌ Error on AI Socket:", error);
          if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(
              JSON.stringify({ type: "error", error: "AI socket error" })
            );
          }
        },

        onClose() {
          console.log("🔁 Closed connection to OpenAI Realtime API");
          if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.close();
          }
        },
      }
    );

    clientInfo.aiSocket = aiSocket;

    clientSocket.on("message", (data) => {
      if (aiSocket.readyState === WebSocket.OPEN && canSendAudio) {
        const buffer = Buffer.isBuffer(data)
          ? data
          : Buffer.from(data as ArrayBuffer);

        const base64Audio = buffer.toString("base64");

        aiSocket.send(
          JSON.stringify({
            type: "input_audio_buffer.append",
            audio: base64Audio,
          })
        );
      }
    });

    clientSocket.on("close", () => {
      console.log(`🔴 Client disconnected: ${clientId}`);
      aiSocket.close();
    });
  });
});

fastify.listen({ port: 3001 }, () => {
  console.log("🚀 Fastify WebSocket server listening on port 3001");
});
