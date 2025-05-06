/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Désactiver l'optimisation des images pour éviter les problèmes avec Netlify
  images: {
    unoptimized: true
  },
  // Configuration pour l'environnement de production
  env: {
    NODE_ENV: process.env.NODE_ENV,
  }
};

export default nextConfig;
