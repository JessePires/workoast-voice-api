import { FastifyInstance } from "fastify";
import userRoutes from "./user/user.routes";

// import otherRoutes from './other/other.routes' // outros módulos

export default async function routes(app: FastifyInstance) {
  app.register(userRoutes, { prefix: "/users" });
  // app.register(otherRoutes, { prefix: '/other' })
}
