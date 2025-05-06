// Version optimisée de l'API cours utilisant le client Prisma configuré pour Supabase
import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';

// GET - Récupérer tous les cours ou les cours d'un dossier spécifique
export async function GET(request) {
  try {
    console.log('🔍 Récupération des cours...');
    
    // Vérifier la connexion à la base de données
    console.log('🔄 Vérification de la connexion à la base de données...');
    await prisma.$connect();
    console.log('✅ Connexion à la base de données établie avec succès!');
    
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    
    // Construire la requête en fonction des paramètres
    let whereClause = {};
    
    if (folderId) {
      if (folderId === 'null') {
        whereClause = {
          folderId: null
        };
      } else {
        whereClause = {
          folderId: parseInt(folderId)
        };
      }
    }
    
    // Exécuter la requête avec gestion d'erreur améliorée
    console.log(`🔄 Exécution de la requête pour récupérer les cours (folderId: ${folderId || 'tous'})...`);
    
    try {
      const cours = await prisma.cours.findMany({
        where: whereClause,
        include: {
          folder: true,
          image: true
        }
      });
      
      console.log(`✅ ${cours.length} cours récupérés avec succès!`);
      
      // Fermer la connexion
      await prisma.$disconnect();
      
      return NextResponse.json(cours);
    } catch (dbError) {
      console.error('❌ Erreur lors de la requête à la base de données:', dbError);
      
      // Informations de débogage
      console.log('📊 Informations de débogage:');
      console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '***définie***' : '***non définie***'}`);
      if (process.env.DATABASE_URL) {
        // Masquer le mot de passe dans les logs
        const maskedUrl = process.env.DATABASE_URL.replace(/:[^:]*@/, ':***@');
        console.log(`URL masquée: ${maskedUrl}`);
      }
      
      // Fermer la connexion en cas d'erreur
      await prisma.$disconnect();
      
      throw dbError;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des cours:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des cours',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau cours
export async function POST(request) {
  try {
    console.log('🔍 Création d\'un nouveau cours...');
    
    const { title, url, folderId, imageUrl } = await request.json();
    
    // Vérifier les données requises
    if (!title || !url) {
      return NextResponse.json(
        { error: 'Le titre et l\'URL sont requis' },
        { status: 400 }
      );
    }
    
    // Créer le cours
    console.log('🔄 Création du cours dans la base de données...');
    const newCours = await prisma.cours.create({
      data: {
        title,
        url,
        folderId: folderId ? parseInt(folderId) : null
      },
    });
    
    // Si une image est fournie, créer une entrée dans la table CoursImage
    if (imageUrl) {
      console.log('🔄 Ajout de l\'image au cours...');
      await prisma.coursImage.create({
        data: {
          url: imageUrl,
          coursId: newCours.id
        }
      });
    }
    
    // Récupérer le cours avec ses relations
    console.log('🔄 Récupération du cours créé avec ses relations...');
    const coursWithRelations = await prisma.cours.findUnique({
      where: {
        id: newCours.id
      },
      include: {
        folder: true,
        image: true
      }
    });
    
    console.log('✅ Cours créé avec succès!');
    
    return NextResponse.json(coursWithRelations);
  } catch (error) {
    console.error('❌ Erreur lors de la création du cours:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du cours',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un cours
export async function DELETE(request) {
  try {
    console.log('🔍 Suppression d\'un cours...');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du cours non spécifié' },
        { status: 400 }
      );
    }
    
    // Supprimer le cours (la suppression en cascade supprimera aussi l'image)
    console.log(`🔄 Suppression du cours avec l'ID ${id}...`);
    await prisma.cours.delete({
      where: {
        id: parseInt(id)
      }
    });
    
    console.log('✅ Cours supprimé avec succès!');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du cours:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression du cours',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
