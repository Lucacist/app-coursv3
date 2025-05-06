// Script pour configurer Prisma dans un environnement serverless
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

// Vérifier si nous sommes dans un environnement serverless (Vercel, Netlify, etc.)
const isServerless = process.env.VERCEL === '1' || process.env.NETLIFY === 'true';
console.log(`Environnement serverless: ${isServerless ? 'Oui' : 'Non'}`);

// Afficher les variables d'environnement (sans les valeurs sensibles)
console.log('Variables d\'environnement:');
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '***définie***' : '***non définie***'}`);
if (process.env.DATABASE_URL) {
  // Masquer le mot de passe dans les logs
  const maskedUrl = process.env.DATABASE_URL.replace(/:[^:]*@/, ':***@');
  console.log(`URL masquée: ${maskedUrl}`);
}

// Fonction principale
async function setupServerless() {
  console.log('🚀 Configuration de Prisma pour un environnement serverless...');

  // Utiliser le schéma spécial pour les environnements serverless
  const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
  const serverlessSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.serverless.prisma');
  
  if (fs.existsSync(serverlessSchemaPath)) {
    console.log('📄 Utilisation du schéma Prisma optimisé pour serverless...');
    fs.copyFileSync(serverlessSchemaPath, schemaPath);
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
  
  console.log('✅ Configuration serverless terminée avec succès!');
  return true;
}

// Si ce script est exécuté directement
if (require.main === module) {
  setupServerless()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erreur inattendue:', error);
      process.exit(1);
    });
}

module.exports = setupServerless;
