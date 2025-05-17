// import { buildApp } from "./app";

// const start = async () => {
//   const app = await buildApp();

//   try {
//     await app.listen({ port: 3000, host: "0.0.0.0" });
//     console.log("🚀 Servidor rodando em http://localhost:3000");
//   } catch (err) {
//     app.log.error(err);
//     process.exit(1);
//   }
// };

// start();

// server.ts
// import Fastify from "fastify";
// import fastifyWs from "@fastify/websocket";
// import WebSocket from "ws";
// import { v4 as uuid } from "uuid";
// import { createOpenAIRealtimeSocket } from "./services/realtime/openaiRealtime";

// const fastify = Fastify();
// fastify.register(fastifyWs);

// type ClientInfo = {
//   id: string;
//   aiSocket?: WebSocket;
// };

// fastify.register(async function (fastify) {
//   fastify.get("/ws", { websocket: true }, (socket, req) => {
//     console.log("socket", socket.on);

//     const clientId = uuid();
//     const clientInfo: ClientInfo = { id: clientId };

//     console.log(`🟢 Client connected: ${clientId}`);

//     const aiSocket = createOpenAIRealtimeSocket({
//       onOpen() {
//         console.log("🔁 Connected to OpenAI Realtime API");

//         socket.on("message", (data, isBinary) => {
//           if (aiSocket.readyState === WebSocket.OPEN) {
//             aiSocket.send(data, { binary: isBinary });
//           }
//         });

//         socket.on("close", () => {
//           console.log(`🔴 Client disconnected: ${clientId}`);
//           if (
//             clientInfo.aiSocket &&
//             clientInfo.aiSocket.readyState === WebSocket.OPEN
//           ) {
//             clientInfo.aiSocket.close();
//           }
//         });
//       },

//       onMessage(message) {
//         if (socket.readyState === WebSocket.OPEN) {
//           socket.send(message);
//         }
//       },

//       onError(error) {
//         console.error("❌ Error on AI Socket:", error);
//         if (socket.readyState === WebSocket.OPEN) {
//           socket.send(
//             JSON.stringify({ type: "error", error: "AI socket error" })
//           );
//         }
//       },

//       onClose() {
//         console.log("🔁 Closed connection to OpenAI Realtime API");
//         if (socket.readyState === WebSocket.OPEN) {
//           socket.close();
//         }
//       },
//     });

//     clientInfo.aiSocket = aiSocket;
//   });
// });

// fastify.listen({ port: 3001 }, () => {
//   console.log("🚀 Fastify WebSocket server listening on port 3001");
// });

// ==================================================================
//
//
//
//
//
import Fastify from "fastify";
import fastifyWs from "@fastify/websocket";
import WebSocket from "ws";
import { v4 as uuid } from "uuid";
import { createOpenAIRealtimeSocket } from "./services/realtime/openaiRealtime";
import { ScriptParams } from "./services/realtime/openaiRealtime.types";

const fastify = Fastify();
fastify.register(fastifyWs);

type ClientInfo = {
  id: string;
  aiSocket?: WebSocket;
};

fastify.register(async function (fastify) {
  fastify.get("/ws", { websocket: true }, (clientSocket, req) => {
    const clientId = uuid();
    const clientInfo: ClientInfo = { id: clientId };
    const scriptParams = req.query as ScriptParams;
    let canSendAudio = false;

    console.log(`🟢 Client connected: ${clientId}`);

    const aiSocket = createOpenAIRealtimeSocket(
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
      },
      scriptParams
    );

    clientInfo.aiSocket = aiSocket;

    clientSocket.on("message", (data, isBinary) => {
      if (aiSocket.readyState === WebSocket.OPEN) {
        const response: { transcript: string } = JSON.parse(data.toString());
        const buffer = Buffer.isBuffer(data)
          ? data
          : Buffer.from(data as ArrayBuffer);

        const base64Audio = buffer.toString("base64");

        aiSocket.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [{ type: "input_text", text: response.transcript }],
            },
          })
        );

        aiSocket.send(
          JSON.stringify({
            type: "response.create",
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
