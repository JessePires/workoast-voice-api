// src/plugins/index.ts
import { FastifyInstance } from "fastify";
// import swagger from '@fastify/swagger' // exemplo de plugin extra

export const registerPlugins = async (app: FastifyInstance) => {
  // Aqui você registra os plugins que quiser
  // await app.register(swagger, { /* opções */ })
  // Pode também organizar cada plugin em arquivos separados e importar aqui, por exemplo:
  // await registerSwagger(app)
  // await registerDatabase(app)
  // Se não houver plugins por enquanto, essa função pode ficar vazia
};
