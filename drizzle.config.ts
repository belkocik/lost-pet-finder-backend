import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/modules/drizzle/schema/index.ts',
  out: './src/modules/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'localhost',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: +process.env.POSTGRES_PORT,
    ssl: false,
  },
});
