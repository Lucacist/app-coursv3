// Script pour tester la connexion à la base de données avec le Transaction pooler de Supabase
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Test de connexion à la base de données avec le Transaction pooler...');
  
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
    
    // Tester une requête sur la table Cours
    console.log('🔄 Test d\'une requête sur la table Cours...');
    const coursCount = await prisma.cours.count();
    console.log(`📊 Nombre de cours dans la base de données: ${coursCount}`);
    
    // Déconnecter
    await prisma.$disconnect();
    console.log('👋 Connexion fermée.');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    return false;
  }
}

// Si ce script est exécuté directement
if (require.main === module) {
  testConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erreur inattendue:', error);
      process.exit(1);
    });
}

module.exports = testConnection;
