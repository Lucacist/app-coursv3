// Ce script est exécuté pendant le processus de build de Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Vérifier si nous sommes sur Vercel
const isVercel = process.env.VERCEL === '1';
console.log(`🔍 Environnement Vercel détecté: ${isVercel ? 'Oui' : 'Non'}`);

// Afficher les variables d'environnement (sans les valeurs sensibles)
console.log('🔍 Variables d\'environnement:');
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '***définie***' : '***non définie***'}`);
console.log(`PROF_LOGIN: ${process.env.PROF_LOGIN ? '***définie***' : '***non définie***'}`);
console.log(`PROF_PASSWORD: ${process.env.PROF_PASSWORD ? '***définie***' : '***non définie***'}`);

// Vérifier le contenu du dossier prisma
const prismaDir = path.join(process.cwd(), 'prisma');
console.log(`🔍 Contenu du dossier prisma (${prismaDir}):`);
if (fs.existsSync(prismaDir)) {
  const files = fs.readdirSync(prismaDir);
  console.log(files.join(', '));
} else {
  console.log('Le dossier prisma n\'existe pas!');
}

// Exécuter les commandes nécessaires pour Prisma
try {
  // Forcer la suppression du cache Prisma
  const prismaCache = path.join(process.cwd(), 'node_modules', '.prisma');
  if (fs.existsSync(prismaCache)) {
    console.log('🧹 Suppression du cache Prisma...');
    fs.rmSync(prismaCache, { recursive: true, force: true });
  }

  // Générer le client Prisma avec des options supplémentaires
  console.log('🔶 Génération du client Prisma...');
  execSync('npx prisma generate --schema=./prisma/schema.prisma', { stdio: 'inherit' });
  
  // Vérifier que le client a bien été généré
  const clientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
  if (fs.existsSync(clientPath)) {
    console.log('✅ Client Prisma généré avec succès!');
  } else {
    console.error('❌ Le client Prisma n\'a pas été généré correctement!');
  }
  
  // Exécuter les migrations Prisma
  console.log('🔶 Exécution des migrations Prisma...');
  execSync('npx prisma migrate deploy --schema=./prisma/schema.prisma', { stdio: 'inherit' });
  
  console.log('✅ Configuration de Prisma terminée avec succès!');
} catch (error) {
  console.error('❌ Erreur lors de la configuration de Prisma:', error);
  process.exit(1);
}
