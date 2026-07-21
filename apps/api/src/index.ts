import Fastify from "fastify";
import cors from "@fastify/cors";
import "dotenv/config";

const app = Fastify({ logger: true });

async function main() {
  await app.register(cors, {
    origin: ["http://localhost:3000", "https://trophify.onrender.com"],
  });

  await app.listen({ port: Number(process.env.PORT ?? 3001) });
}

main();
