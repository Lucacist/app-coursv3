// Script pour exécuter les commandes Prisma pendant le déploiement Vercel
const { execSync } = require('child_process');

// Fonction pour exécuter une commande et afficher sa sortie
function runCommand(command) {
  console.log(`Exécution de la commande: ${command}`);
  try {
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

// Afficher les informations sur l'environnement
console.log('Node.js version:', process.version);
console.log('DATABASE_URL définie:', !!process.env.DATABASE_URL);

// Exécuter les commandes Prisma
console.log('=== Génération du client Prisma ===');
if (runCommand('npx prisma generate')) {
  console.log('✅ Client Prisma généré avec succès');
} else {
  console.error('❌ Échec de la génération du client Prisma');
  process.exit(1);
}

// Exécuter les migrations Prisma si nous sommes sur Vercel
if (isVercel) {
  console.log('=== Exécution des migrations Prisma ===');
  if (runCommand('npx prisma migrate deploy')) {
    console.log('✅ Migrations Prisma exécutées avec succès');
  } else {
    console.error('❌ Échec des migrations Prisma');
    // Ne pas quitter avec un code d'erreur pour permettre au build de continuer
    console.log('⚠️ Continuons le build malgré l\'échec des migrations');
  }
}
