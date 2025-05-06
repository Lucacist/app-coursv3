// Script pour préparer la base de données en production
const { execSync } = require('child_process');

// Fonction pour exécuter les commandes shell
function runCommand(command) {
  try {
    execSync(`${command}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Erreur lors de l'exécution de la commande ${command}`, error);
    process.exit(1);
  }
}

// Exécuter les migrations Prisma
console.log('Exécution des migrations Prisma...');
runCommand('npx prisma migrate deploy');

// Générer le client Prisma
console.log('Génération du client Prisma...');
runCommand('npx prisma generate');

console.log('Base de données préparée avec succès !');
