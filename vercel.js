// Script spécial pour Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage du script Vercel personnalisé');

// Vérifier si nous sommes sur Vercel
const isVercel = process.env.VERCEL === '1';
console.log(`Environnement Vercel: ${isVercel ? 'Oui' : 'Non'}`);

// Afficher les variables d'environnement (sans les valeurs sensibles)
console.log('Variables d\'environnement:');
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '***définie***' : '***non définie***'}`);
console.log(`PROF_LOGIN: ${process.env.PROF_LOGIN ? '***définie***' : '***non définie***'}`);
console.log(`PROF_PASSWORD: ${process.env.PROF_PASSWORD ? '***définie***' : '***non définie***'}`);

// Fonction pour exécuter une commande
function runCommand(command) {
  try {
    console.log(`Exécution de: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Erreur lors de l'exécution de: ${command}`, error);
    return false;
  }
}

// Supprimer le dossier .prisma s'il existe
const prismaCache = path.join(process.cwd(), 'node_modules', '.prisma');
if (fs.existsSync(prismaCache)) {
  console.log('🧹 Suppression du cache Prisma...');
  try {
    fs.rmSync(prismaCache, { recursive: true, force: true });
    console.log('✅ Cache Prisma supprimé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du cache Prisma:', error);
  }
}

// Générer le client Prisma
console.log('🔄 Génération du client Prisma...');
if (runCommand('npx prisma generate')) {
  console.log('✅ Client Prisma généré avec succès');
} else {
  console.error('❌ Échec de la génération du client Prisma');
  process.exit(1);
}

// Si nous sommes sur Vercel, exécuter les migrations
if (isVercel) {
  console.log('🔄 Exécution des migrations Prisma...');
  if (runCommand('npx prisma migrate deploy')) {
    console.log('✅ Migrations Prisma exécutées avec succès');
  } else {
    console.warn('⚠️ Échec des migrations Prisma, mais on continue...');
  }
}

console.log('🏁 Script Vercel terminé avec succès');
