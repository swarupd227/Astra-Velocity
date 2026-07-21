import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  REDIS_URL: z.string().min(1).default("redis://localhost:6380"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be set to a strong secret"),
  ANTHROPIC_API_KEY: z.string().optional().default(""),
  AZURE_OPENAI_API_KEY: z.string().optional().default(""),
  AZURE_OPENAI_ENDPOINT: z.string().optional().default(""),
  OLLAMA_BASE_URL: z.string().optional().default("http://localhost:11434"),
  FEATURE_ENTRA_SSO: z
    .string()
    .optional()
    .default("false")
    .transform((v) => v === "true"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

/**
 * Validated server-side environment. Import only from server code.
 * In containers, values come from the environment; in local dev, Next.js loads
 * app/.env.local and scripts load the repo-root .env via dotenv.
 */
export const env = EnvSchema.parse(process.env);
