// Configuration de la connexion à la base de données avec Drizzle ORM
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Fonction pour obtenir la configuration de la base de données
const getDatabaseConfig = () => {
  // Utiliser l'URL de connexion PostgreSQL depuis les variables d'environnement
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL n\'est pas définie dans les variables d\'environnement');
  }
  
  return { connectionString: databaseUrl };
};

// Créer un pool de connexions PostgreSQL
const pool = new Pool(getDatabaseConfig());

// Créer une instance Drizzle avec notre schéma
export const db = drizzle(pool, { schema });

// Fonction pour exécuter une requête et fermer la connexion
export async function executeQuery(callback) {
  try {
    return await callback(db);
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête:', error);
    throw error;
  }
}

// Fonction pour fermer le pool de connexions
export async function closePool() {
  await pool.end();
}

// Export par défaut
export default db;
