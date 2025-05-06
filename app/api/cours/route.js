import prisma from '../../../lib/prisma';

export async function POST(req) {
  const { title, url, imageUrl, folderId } = await req.json();

  try {
    // Créer le cours d'abord sans l'image
    const newCours = await prisma.cours.create({
      data: {
        title,
        url,
        folderId: folderId ? parseInt(folderId) : null
      },
      include: {
        folder: true
      }
    });

    // Si une image est fournie, créer l'entrée d'image séparément
    if (imageUrl) {
      await prisma.coursImage.create({
        data: {
          url: imageUrl,
          coursId: newCours.id
        }
      });
      
      // Récupérer le cours avec l'image
      const coursWithImage = await prisma.cours.findUnique({
        where: { id: newCours.id },
        include: {
          folder: true,
          image: true
        }
      });
      
      return new Response(JSON.stringify(coursWithImage), { status: 200 });
    }

    return new Response(JSON.stringify(newCours), { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la création du cours:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');
    
    let whereClause = {};
    
    // Si un folderId est spécifié, filtrer par ce dossier
    // Si folderId=null est spécifié, récupérer les cours sans dossier
    if (folderId !== null) {
      if (folderId === 'null') {
        whereClause.folderId = null;
      } else if (folderId) {
        whereClause.folderId = parseInt(folderId);
      }
    }
    
    const cours = await prisma.cours.findMany({
      where: whereClause,
      include: {
        folder: true,
        image: true
      }
    });
    
    return new Response(JSON.stringify(cours), { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID du cours manquant' }), { status: 400 });
    }
    
    const coursId = parseInt(id);
    
    // Vérifier si le cours existe
    const existingCours = await prisma.cours.findUnique({
      where: { id: coursId },
      include: { image: true }
    });
    
    if (!existingCours) {
      return new Response(JSON.stringify({ error: 'Cours non trouvé' }), { status: 404 });
    }
    
    // Supprimer le cours (la relation avec l'image sera automatiquement supprimée grâce à onDelete: Cascade)
    await prisma.cours.delete({
      where: { id: coursId }
    });
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
