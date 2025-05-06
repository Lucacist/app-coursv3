import prisma from '../../../lib/prisma';

// GET: récupérer tous les dossiers avec leurs cours
export async function GET() {
  try {
    const folders = await prisma.folder.findMany({
      include: {
        cours: true
      }
    });
    return new Response(JSON.stringify(folders), { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// POST: créer un nouveau dossier
export async function POST(req) {
  try {
    const { name } = await req.json();
    
    const newFolder = await prisma.folder.create({
      data: {
        name
      }
    });
    
    return new Response(JSON.stringify(newFolder), { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du dossier:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
