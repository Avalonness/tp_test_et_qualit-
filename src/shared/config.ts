import { z } from "zod";

const EnvSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3000),

    // DATABASE_URL au format postgres://user:pass@host:port/db
    DATABASE_URL: z.string().min(1),
    DB_SSL: z.enum(["true", "false"]).optional().default("false"),
});

export type AppConfig = z.infer<typeof EnvSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
    const parsed = EnvSchema.safeParse(env);
    if (!parsed.success) {
        const msg = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("\n");
        throw new Error(`Invalid environment configuration:\n${msg}`);
    }
    return parsed.data;
}
