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
      
      return NextResponse.json(coursWithImage);
    }

    return NextResponse.json(newCours);
  } catch (error) {
    console.error('Erreur lors de la création du cours:', error);
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

// GET - Récupérer tous les cours ou les cours d'un dossier spécifique
export async function GET(request) {
  try {
    console.log(' Récupération des cours...');
    
    // Vérifier la connexion à la base de données
    console.log(' Vérification de la connexion à la base de données...');
    await prisma.$connect();
    console.log(' Connexion à la base de données établie avec succès!');
    
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
    console.log(` Exécution de la requête pour récupérer les cours (folderId: ${folderId || 'tous'})...`);
    
    try {
      const cours = await prisma.cours.findMany({
        where: whereClause,
        include: {
          folder: true,
          image: true
        }
      });
      
      console.log(` ${cours.length} cours récupérés avec succès!`);
      
      // Fermer la connexion
      await prisma.$disconnect();
      
      return NextResponse.json(cours);
    } catch (dbError) {
      console.error(' Erreur lors de la requête à la base de données:', dbError);
      
      // Informations de débogage
      console.log(' Informations de débogage:');
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
    console.error(' Erreur lors de la récupération des cours:', error);
    
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

// DELETE - Supprimer un cours
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
