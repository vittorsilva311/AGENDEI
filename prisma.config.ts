import "dotenv/config"; // Isso garante que o Prisma veja o seu DATABASE_URL
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
}); 