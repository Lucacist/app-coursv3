// Configuration optimisée du client Prisma pour Supabase et les environnements serverless
import { PrismaClient } from '@prisma/client';

// Options de configuration pour le client Prisma
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Log uniquement les erreurs en production
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    
    // Configuration pour les environnements serverless
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Utiliser un singleton pour éviter de créer plusieurs instances du client Prisma
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || prismaClientSingleton();

// En développement, ne pas mettre en cache le client Prisma
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
