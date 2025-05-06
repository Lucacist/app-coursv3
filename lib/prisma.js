// /lib/prisma.js
import { PrismaClient } from '@prisma/client';

// Initialiser le client Prisma
let prisma;

// En production, créer une nouvelle instance
// En développement, réutiliser l'instance pour éviter trop de connexions
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
