import { config } from "dotenv";
config({ path: "../.env" });
config({ path: ".env.local", override: true });

import { Worker, Queue } from "bullmq";
import IORedis from "ioredis";
import pino from "pino";

const logger = pino({ name: "astra-worker" });

const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6380", {
  maxRetriesPerRequest: null,
});

/**
 * Gateway worker — Phase 0 stub.
 * Phase 5 adds LLM gateway jobs (drafting, RAG indexing); Phase 6 adds agent runs.
 */
export const QUEUES = {
  ai: "astra-ai",
  agents: "astra-agents",
} as const;

export const aiQueue = new Queue(QUEUES.ai, { connection });

const aiWorker = new Worker(
  QUEUES.ai,
  async (job) => {
    logger.info({ jobId: job.id, name: job.name }, "ai job received (stub)");
    return { ok: true };
  },
  { connection },
);

aiWorker.on("ready", () => logger.info("worker ready — queues: %s", Object.values(QUEUES).join(", ")));
aiWorker.on("failed", (job, err) => logger.error({ jobId: job?.id, err: err.message }, "job failed"));

process.on("SIGTERM", async () => {
  await aiWorker.close();
  await connection.quit();
  process.exit(0);
});
