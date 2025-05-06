import prisma from '../../../../lib/prisma';

// DELETE: supprimer un dossier par son ID
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    
    // Vérifier si le dossier existe
    const folder = await prisma.folder.findUnique({
      where: { id: parseInt(id) },
      include: { cours: true }
    });
    
    if (!folder) {
      return new Response(JSON.stringify({ error: 'Dossier non trouvé' }), { status: 404 });
    }
    
    // Mettre à jour tous les cours associés à ce dossier (les déplacer hors du dossier)
    if (folder.cours && folder.cours.length > 0) {
      await prisma.cours.updateMany({
        where: { folderId: parseInt(id) },
        data: { folderId: null }
      });
    }
    
    // Supprimer le dossier
    await prisma.folder.delete({
      where: { id: parseInt(id) }
    });
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression du dossier:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
