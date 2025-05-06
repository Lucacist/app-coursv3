import prisma from '../../../../lib/prisma';

// POST: déplacer un cours vers un dossier
export async function POST(req) {
  try {
    const { coursId, folderId } = await req.json();
    
    console.log('API - Déplacement du cours', coursId, 'vers le dossier', folderId);
    
    if (!coursId) {
      return new Response(JSON.stringify({ error: 'ID du cours manquant' }), { status: 400 });
    }
    
    // Vérifier que le cours existe
    const cours = await prisma.cours.findUnique({
      where: { id: parseInt(coursId) }
    });
    
    if (!cours) {
      return new Response(JSON.stringify({ error: 'Cours non trouvé' }), { status: 404 });
    }
    
    // Vérifier que le dossier existe (sauf si folderId est null pour retirer du dossier)
    if (folderId !== null) {
      const folder = await prisma.folder.findUnique({
        where: { id: parseInt(folderId) }
      });
      
      if (!folder) {
        return new Response(JSON.stringify({ error: 'Dossier non trouvé' }), { status: 404 });
      }
    }
    
    // Mettre à jour le cours
    const updatedCours = await prisma.cours.update({
      where: { id: parseInt(coursId) },
      data: { 
        folder: folderId === null ? 
          { disconnect: true } : 
          { connect: { id: parseInt(folderId) } }
      },
      include: {
        folder: true,
        image: true
      }
    });
    
    console.log('Cours déplacé avec succès:', updatedCours);
    
    return new Response(JSON.stringify(updatedCours), { status: 200 });
  } catch (error) {
    console.error('Erreur lors du déplacement du cours:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
