/** @type {import('next').NextConfig} */

// Vérifier si nous sommes en environnement de production
const isProd = process.env.NODE_ENV === 'production';

// Script pour exécuter les commandes Prisma en production
if (isProd) {
  try {
    // Importer et exécuter le script de build Vercel
    require('./vercel-build-steps');
  } catch (error) {
    console.error('Erreur lors de l\'exécution du script de build Vercel:', error);
  }
}

const nextConfig = {
  // Configuration de Next.js
  reactStrictMode: true,
  swcMinify: true,
  
  // Configuration spécifique pour Vercel
  experimental: {
    serverActions: true,
  },
  
  // Configuration des en-têtes HTTP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
