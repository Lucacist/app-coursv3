// Route API pour déboguer la connexion à la base de données
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  console.log('🔍 Débogage de la connexion à la base de données...');
  
  // Afficher les variables d'environnement (sans les valeurs sensibles)
  console.log('Variables d\'environnement:');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '***définie***' : '***non définie***'}`);
  if (process.env.DATABASE_URL) {
    // Masquer le mot de passe dans les logs
    const maskedUrl = process.env.DATABASE_URL.replace(/:[^:]*@/, ':***@');
    console.log(`URL masquée: ${maskedUrl}`);
  }
  
  try {
    console.log('🔄 Initialisation du client Prisma...');
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    console.log('🔄 Tentative de connexion à la base de données...');
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie avec succès!');
    
    // Tester une requête simple
    console.log('🔄 Test d\'une requête simple...');
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
    console.log('📊 Tables dans la base de données:');
    console.log(tables);
    
    // Déconnecter
    await prisma.$disconnect();
    console.log('👋 Connexion fermée.');
    
    return NextResponse.json({
      success: true,
      message: 'Connexion à la base de données établie avec succès!',
      tables: tables.map(table => table.tablename)
    });
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erreur de connexion à la base de données',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
