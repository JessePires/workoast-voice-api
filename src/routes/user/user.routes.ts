import { FastifyInstance } from "fastify";

export default async function userRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    return { message: "Lista de usuários" };
  });

  app.post("/", async (request, reply) => {
    return { message: "Usuário criado" };
  });
}
