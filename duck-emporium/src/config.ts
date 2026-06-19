import { z } from "zod";

const envSchema = z.object({
  ADMIN_SECRET: z
    .string()
    .min(1, "ADMIN_SECRET must be a non-empty string"),
  PORT: z
    .string()
    .optional()
    .default("3000")
    .transform((v) => Number.parseInt(v, 10))
    .pipe(z.number().int().positive()),
  DATA_FILE: z.string().min(1).optional().default("data/catalog.json"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
  console.error("[duck-emporium] invalid environment:\n" + issues);
  console.error(
    "[duck-emporium] copy .env.example to .env and set ADMIN_SECRET to a non-empty value"
  );
  process.exit(1);
}

export const config = {
  adminSecret: parsed.data.ADMIN_SECRET,
  port: parsed.data.PORT,
  dataFile: parsed.data.DATA_FILE,
} as const;

export type Config = typeof config;
