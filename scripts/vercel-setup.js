// Script spécial pour configurer Prisma sur Vercel
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fonction pour exécuter des commandes shell
function runCommand(command) {
  try {
    console.log(`Exécution de la commande: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la commande: ${command}`, error);
    return false;
  }
}

// Vérifier si nous sommes sur Vercel
const isVercel = process.env.VERCEL === '1';
console.log(`Environnement Vercel: ${isVercel ? 'Oui' : 'Non'}`);

// Afficher les variables d'environnement (sans les valeurs sensibles)
console.log('Variables d\'environnement:');
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '***définie***' : '***non définie***'}`);

// Fonction principale
async function setupVercel() {
  console.log('🚀 Configuration de Prisma pour Vercel...');

  // Utiliser le schéma spécial pour Vercel
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  const vercelSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.vercel.prisma');
  
  if (fs.existsSync(vercelSchemaPath)) {
    console.log('📄 Utilisation du schéma Prisma spécial pour Vercel...');
    fs.copyFileSync(vercelSchemaPath, schemaPath);
    console.log('✅ Schéma Prisma copié avec succès!');
  }
  
  // Générer le client Prisma
  console.log('🔄 Génération du client Prisma...');
  if (runCommand('npx prisma generate')) {
    console.log('✅ Client Prisma généré avec succès!');
  } else {
    console.error('❌ Erreur lors de la génération du client Prisma!');
    process.exit(1);
  }
  
  // Vérifier la connexion à la base de données
  console.log('🔄 Vérification de la connexion à la base de données...');
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Tester la connexion
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie avec succès!');
    
    // Tester une requête simple
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
    console.log('📊 Tables dans la base de données:');
    tables.forEach(table => {
      console.log(`- ${table.tablename}`);
    });
    
    // Déconnecter
    await prisma.$disconnect();
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error.message);
    console.log('\n🔧 Suggestions de résolution:');
    console.log('1. Vérifiez que votre base de données Supabase est active');
    console.log('2. Vérifiez que l\'URL de connexion est correcte');
    console.log('3. Assurez-vous que votre base de données accepte les connexions externes');
    console.log('4. Vérifiez les règles de pare-feu de Supabase');
    
    return false;
  }
}

// Si ce script est exécuté directement
if (require.main === module) {
  setupVercel()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erreur inattendue:', error);
      process.exit(1);
    });
}

module.exports = setupVercel;
