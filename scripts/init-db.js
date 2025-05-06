// Script pour initialiser la base de données PostgreSQL sur Supabase
const { Pool } = require('pg');
require('dotenv').config();

// SQL pour créer les tables
const CREATE_TABLES_SQL = `
-- Créer la table Classe
CREATE TABLE IF NOT EXISTS "Classe" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL
);

-- Créer la table Folder
CREATE TABLE IF NOT EXISTS "Folder" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL
);

-- Créer la table Cours
CREATE TABLE IF NOT EXISTS "Cours" (
  "id" SERIAL PRIMARY KEY,
  "title" VARCHAR(255) NOT NULL,
  "url" VARCHAR(255) NOT NULL,
  "folderId" INTEGER REFERENCES "Folder"("id")
);

-- Créer la table CoursImage
CREATE TABLE IF NOT EXISTS "CoursImage" (
  "id" SERIAL PRIMARY KEY,
  "url" VARCHAR(255) NOT NULL,
  "coursId" INTEGER NOT NULL UNIQUE REFERENCES "Cours"("id") ON DELETE CASCADE
);
`;

// Données initiales (optionnel)
const INSERT_INITIAL_DATA_SQL = `
-- Insérer une classe de test
INSERT INTO "Classe" ("name", "password")
VALUES ('Test Class', 'password123')
ON CONFLICT ("name") DO NOTHING;

-- Insérer un dossier de test
INSERT INTO "Folder" ("name")
VALUES ('Dossier Test')
ON CONFLICT DO NOTHING;
`;

async function initializeDatabase() {
  console.log('🚀 Initialisation de la base de données PostgreSQL sur Supabase...');
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
    
    // Créer les tables
    console.log('🔄 Création des tables...');
    await client.query(CREATE_TABLES_SQL);
    console.log('✅ Tables créées avec succès!');
    
    // Insérer des données initiales (optionnel)
    console.log('🔄 Insertion des données initiales...');
    await client.query(INSERT_INITIAL_DATA_SQL);
    console.log('✅ Données initiales insérées avec succès!');
    
    // Vérifier les tables créées
    console.log('🔄 Vérification des tables créées...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📊 Tables dans la base de données:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
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
  initializeDatabase()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erreur inattendue:', error);
      process.exit(1);
    });
}
