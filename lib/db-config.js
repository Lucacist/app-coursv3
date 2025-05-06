// Configuration de la base de données pour le développement et la production
const isDevelopment = process.env.NODE_ENV === 'development';

// URL de la base de données PostgreSQL pour la production
const productionDatabaseUrl = 'postgresql://postgres:[YOUR-PASSWORD]@db.ftzorhafbciiylorkfyx.supabase.co:5432/postgres';

// Remplacez [YOUR-PASSWORD] par votre mot de passe réel avant le déploiement
// ou utilisez une variable d'environnement sur la plateforme de déploiement

// URL de la base de données pour le développement (SQLite)
const developmentDatabaseUrl = 'file:./prisma/dev.db';

// Exporter l'URL de la base de données en fonction de l'environnement
export const databaseUrl = isDevelopment ? developmentDatabaseUrl : productionDatabaseUrl;
