import prisma from '../../../../lib/prisma';

// DELETE: supprimer un cours par son ID
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    
    // Vérifier si le cours existe
    const cours = await prisma.cours.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!cours) {
      return new Response(JSON.stringify({ error: 'Cours non trouvé' }), { status: 404 });
    }
    
    // Supprimer le cours
    await prisma.cours.delete({
      where: { id: parseInt(id) }
    });
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la suppression du cours:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
