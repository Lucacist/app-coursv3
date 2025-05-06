// Script pour tester la connexion à la base de données PostgreSQL
const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Test de connexion à la base de données PostgreSQL...');
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
    
    // Tester une requête simple
    console.log('🔄 Test d\'une requête simple...');
    const result = await client.query('SELECT NOW() as time');
    console.log(`✅ Requête exécutée avec succès. Heure du serveur: ${result.rows[0].time}`);
    
    // Libérer le client
    client.release();
    
    // Fermer le pool
    await pool.end();
    console.log('👋 Connexion fermée.');
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    
    // Suggestions de résolution
    console.log('\n🔧 Suggestions de résolution:');
    console.log('1. Vérifiez que votre base de données Supabase est active');
    console.log('2. Vérifiez que l\'URL de connexion est correcte (nom d\'utilisateur, mot de passe, hôte)');
    console.log('3. Assurez-vous que votre base de données accepte les connexions externes');
    console.log('4. Vérifiez les règles de pare-feu de Supabase');
    
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
  testConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erreur inattendue:', error);
      process.exit(1);
    });
}

module.exports = testConnection;
