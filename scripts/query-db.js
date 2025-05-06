// Script pour exécuter des requêtes SQL sur votre base de données PostgreSQL
const { Pool } = require('pg');
require('dotenv').config();

// Requête SQL pour lister toutes les tables dans la base de données
const SQL_QUERY = `
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_name;
`;

async function queryDatabase() {
  console.log('🔍 Connexion à la base de données PostgreSQL...');
  console.log(`URL de connexion: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':***@')}`);
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Nécessaire pour certaines configurations Supabase
    }
  });
  
  try {
    console.log('🔄 Tentative de connexion...');
    const client = await pool.connect();
    console.log('✅ Connexion établie avec succès!');
    
    // Exécuter la requête SQL
    console.log(`🔄 Exécution de la requête: ${SQL_QUERY}`);
    const result = await client.query(SQL_QUERY);
    
    // Afficher les résultats
    console.log('✅ Requête exécutée avec succès!');
    console.log('📊 Résultats:');
    console.table(result.rows);
    console.log(`Total: ${result.rowCount} ligne(s)`);
    
    // Libérer le client
    client.release();
    
    // Fermer le pool
    await pool.end();
    console.log('👋 Connexion fermée.');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    
    try {
      await pool.end();
    } catch (e) {
      // Ignorer les erreurs lors de la fermeture du pool
    }
    
    return false;
  }
}

// Si ce script est exécuté directement
if (require.main === module) {
  queryDatabase()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erreur inattendue:', error);
      process.exit(1);
    });
}
