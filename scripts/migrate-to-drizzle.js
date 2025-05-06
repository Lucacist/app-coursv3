// Script pour migrer les données de Prisma vers Drizzle
import { PrismaClient } from '@prisma/client';
import { db } from '../drizzle/db';
import { classe, folder, cours, coursImage } from '../drizzle/schema';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Initialiser Prisma
const prisma = new PrismaClient();

// Fonction principale de migration
async function migrateData() {
  console.log('🚀 Démarrage de la migration des données de Prisma vers Drizzle...');
  
  try {
    // 1. Migrer les classes
    console.log('🔄 Migration des classes...');
    const classes = await prisma.classe.findMany();
    if (classes.length > 0) {
      await db.insert(classe).values(
        classes.map(c => ({
          id: c.id,
          name: c.name,
          password: c.password
        }))
      );
      console.log(`✅ ${classes.length} classes migrées avec succès`);
    } else {
      console.log('ℹ️ Aucune classe à migrer');
    }
    
    // 2. Migrer les dossiers
    console.log('🔄 Migration des dossiers...');
    const folders = await prisma.folder.findMany();
    if (folders.length > 0) {
      await db.insert(folder).values(
        folders.map(f => ({
          id: f.id,
          name: f.name
        }))
      );
      console.log(`✅ ${folders.length} dossiers migrés avec succès`);
    } else {
      console.log('ℹ️ Aucun dossier à migrer');
    }
    
    // 3. Migrer les cours
    console.log('🔄 Migration des cours...');
    const coursesList = await prisma.cours.findMany();
    if (coursesList.length > 0) {
      await db.insert(cours).values(
        coursesList.map(c => ({
          id: c.id,
          title: c.title,
          url: c.url,
          folderId: c.folderId
        }))
      );
      console.log(`✅ ${coursesList.length} cours migrés avec succès`);
    } else {
      console.log('ℹ️ Aucun cours à migrer');
    }
    
    // 4. Migrer les images de cours
    console.log('🔄 Migration des images de cours...');
    const images = await prisma.coursImage.findMany();
    if (images.length > 0) {
      await db.insert(coursImage).values(
        images.map(img => ({
          id: img.id,
          url: img.url,
          coursId: img.coursId
        }))
      );
      console.log(`✅ ${images.length} images de cours migrées avec succès`);
    } else {
      console.log('ℹ️ Aucune image de cours à migrer');
    }
    
    console.log('🎉 Migration des données terminée avec succès!');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la migration des données:', error);
    return false;
  } finally {
    // Fermer les connexions
    await prisma.$disconnect();
  }
}

// Si ce script est exécuté directement
if (require.main === module) {
  migrateData()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}

// Export pour utilisation dans d'autres scripts
export default migrateData;
