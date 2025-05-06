// Script spécial pour préparer Prisma sur Vercel
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fonction pour exécuter des commandes shell
function runCommand(command) {
  try {
    console.log(`Exécution de la commande: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la commande: ${command}`, error);
    process.exit(1);
  }
}

// Vérifier si nous sommes sur Vercel
const isVercel = process.env.VERCEL === '1';

if (isVercel) {
  console.log('🚀 Préparation de Prisma pour le déploiement Vercel...');
  
  // Utiliser le schéma spécial pour Vercel
  const schemaPath = path.join(__dirname, 'schema.prisma');
  const vercelSchemaPath = path.join(__dirname, 'schema.prisma.vercel');
  
  if (fs.existsSync(vercelSchemaPath)) {
    console.log('📄 Utilisation du schéma Prisma spécial pour Vercel...');
    fs.copyFileSync(vercelSchemaPath, schemaPath);
  }
  
  // Générer le client Prisma
  console.log('🔄 Génération du client Prisma...');
  runCommand('npx prisma generate');
  
  // Exécuter les migrations
  console.log('🔄 Exécution des migrations Prisma...');
  runCommand('npx prisma migrate deploy');
  
  console.log('✅ Préparation de Prisma terminée avec succès!');
} else {
  console.log('⏩ Pas sur Vercel, aucune action nécessaire.');
}
