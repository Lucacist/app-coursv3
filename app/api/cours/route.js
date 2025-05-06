import prisma from '../../../lib/prisma';

export async function POST(req) {
  const { title, url, folderId } = await req.json();

  try {
    const newCours = await prisma.cours.create({
      data: {
        title,
        url,
        folderId: folderId ? parseInt(folderId) : null
      },
    });

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
        folder: true
      }
    });
    
    return new Response(JSON.stringify(cours), { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
