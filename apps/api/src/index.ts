import Fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";
import { eventsRoutes } from "./routes/events";
import { participantsRoutes } from "./routes/participants";
import { categoriesRoutes } from "./routes/categories";
import { votesRoutes } from "./routes/votes";

const app = Fastify({ logger: true });

async function main() {
  await app.register(cors, {
    origin: ["http://localhost:3000", "https://trophify.onrender.com"],
    allowedHeaders: ["Content-Type", "x-organizer-token"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(eventsRoutes);
  await app.register(participantsRoutes);
  await app.register(categoriesRoutes);
  await app.register(votesRoutes);

  await app.listen({ port: Number(process.env.PORT ?? 3001) });
}

main();
