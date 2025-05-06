// Script de migration pour Drizzle ORM
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './db';

// Fonction pour exécuter les migrations
export async function runMigrations() {
  console.log('🔄 Exécution des migrations Drizzle...');
  
  try {
    // Exécuter les migrations
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    console.log('✅ Migrations terminées avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    return false;
  }
}

// Si ce script est exécuté directement
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}
