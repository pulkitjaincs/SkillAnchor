import { z } from "zod";
import "dotenv/config";


const envSchema = z.object({
  PORT: z.string().default("5000").transform(Number),
  MONGO_URI: z.string().url("MONGO_URI must be a valid URL"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET should be at least 32 characters for security"),
  CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL"),
  REDIS_URL: z.string().url("REDIS_URL must be a valid URL").optional(),
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_NAME: z.string().optional(),
  EMAIL_HOST: z.string().optional(),
  EMAIL_PORT: z.string().transform(Number).optional(),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(result.error.format(), null, 2));
  process.exit(1);
}

export const env = result.data;
