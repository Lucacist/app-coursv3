// Ce script est exécuté pendant le processus de build de Vercel
const { execSync } = require('child_process');

// Exécuter les commandes nécessaires pour Prisma
try {
  console.log('🔶 Génération du client Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('🔶 Exécution des migrations Prisma...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  console.log('✅ Configuration de Prisma terminée avec succès !');
} catch (error) {
  console.error('❌ Erreur lors de la configuration de Prisma:', error);
  process.exit(1);
}
