// Configuration spécifique pour Vercel
module.exports = {
  // Forcer la génération du client Prisma
  generatePrisma: true,
  
  // Configurer les variables d'environnement
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    PROF_LOGIN: process.env.PROF_LOGIN,
    PROF_PASSWORD: process.env.PROF_PASSWORD,
    PRISMA_GENERATE_DATAPROXY: "true"
  },
  
  // Hooks pour le build
  hooks: {
    // Avant le build
    beforeBuild: async () => {
      const { execSync } = require('child_process');
      console.log('🔄 Génération du client Prisma...');
      execSync('npx prisma generate', { stdio: 'inherit' });
    },
    
    // Après l'installation
    afterInstall: async () => {
      const { execSync } = require('child_process');
      console.log('🔄 Génération du client Prisma après installation...');
      execSync('npx prisma generate', { stdio: 'inherit' });
    }
  }
};
