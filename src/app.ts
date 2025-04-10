import Fastify from "fastify";
import cors from "@fastify/cors";
import routes from "./routes";
import { registerPlugins } from "./plugins";

export const buildApp = async () => {
  const app = Fastify({
    logger: true, // ou configurar como um objeto para customizar
  });

  // Registra plugins globais
  await app.register(cors);
  await registerPlugins(app);

  // Registra rotas
  await app.register(routes);

  return app;
};
