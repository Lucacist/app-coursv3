// API pour les cours utilisant Drizzle ORM au lieu de Prisma
import { NextResponse } from 'next/server';
import { db } from '../../../drizzle/db';
import { cours, folder, coursImage } from '../../../drizzle/schema';
import { eq, isNull } from 'drizzle-orm';

// GET - Récupérer tous les cours ou les cours d'un dossier spécifique
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    
    let query = db.select().from(cours);
    
    // Joindre les tables folder et coursImage
    query = query
      .leftJoin(folder, eq(cours.folderId, folder.id))
      .leftJoin(coursImage, eq(cours.id, coursImage.coursId));
    
    // Filtrer par dossier si folderId est spécifié
    if (folderId) {
      if (folderId === 'null') {
        // Cours sans dossier
        query = query.where(isNull(cours.folderId));
      } else {
        // Cours dans un dossier spécifique
        query = query.where(eq(cours.folderId, parseInt(folderId)));
      }
    }
    
    // Exécuter la requête
    const result = await query;
    
    // Formater les résultats
    const formattedCours = result.map(row => ({
      id: row.Cours.id,
      title: row.Cours.title,
      url: row.Cours.url,
      folderId: row.Cours.folderId,
      folder: row.Folder ? {
        id: row.Folder.id,
        name: row.Folder.name
      } : null,
      image: row.CoursImage ? {
        id: row.CoursImage.id,
        url: row.CoursImage.url
      } : null
    }));
    
    return NextResponse.json(formattedCours);
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des cours' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau cours
export async function POST(request) {
  try {
    const { title, url, folderId, imageUrl } = await request.json();
    
    // Créer le cours
    const [newCours] = await db.insert(cours).values({
      title,
      url,
      folderId: folderId ? parseInt(folderId) : null
    }).returning();
    
    // Si une image est fournie, créer une entrée dans la table coursImage
    if (imageUrl) {
      await db.insert(coursImage).values({
        url: imageUrl,
        coursId: newCours.id
      });
    }
    
    // Récupérer le cours avec ses relations
    const result = await db.select()
      .from(cours)
      .where(eq(cours.id, newCours.id))
      .leftJoin(folder, eq(cours.folderId, folder.id))
      .leftJoin(coursImage, eq(cours.id, coursImage.coursId));
    
    // Formater le résultat
    const formattedCours = result.map(row => ({
      id: row.Cours.id,
      title: row.Cours.title,
      url: row.Cours.url,
      folderId: row.Cours.folderId,
      folder: row.Folder ? {
        id: row.Folder.id,
        name: row.Folder.name
      } : null,
      image: row.CoursImage ? {
        id: row.CoursImage.id,
        url: row.CoursImage.url
      } : null
    }))[0];
    
    return NextResponse.json(formattedCours);
  } catch (error) {
    console.error('Erreur lors de la création du cours:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du cours' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un cours
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID du cours non spécifié' },
        { status: 400 }
      );
    }
    
    // Supprimer le cours (la suppression en cascade supprimera aussi l'image)
    await db.delete(cours).where(eq(cours.id, parseInt(id)));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du cours' },
      { status: 500 }
    );
  }
}
