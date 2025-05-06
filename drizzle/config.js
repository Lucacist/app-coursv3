// Configuration pour drizzle-kit
import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

export default defineConfig({
  schema: './drizzle/schema.js',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
