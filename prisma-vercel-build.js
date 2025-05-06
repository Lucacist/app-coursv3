// Script pour forcer la génération du client Prisma sur Vercel
const { execSync } = require('child_process');

console.log('🚀 Exécution du script de build personnalisé pour Vercel...');

try {
  // Forcer la génération du client Prisma
  console.log('📦 Génération du client Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Exécuter les migrations Prisma
  console.log('🔄 Exécution des migrations Prisma...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  
  // Construire l'application Next.js
  console.log('🏗️ Construction de l\'application Next.js...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ Build terminé avec succès!');
} catch (error) {
  console.error('❌ Erreur lors du build:', error);
  process.exit(1);
}
