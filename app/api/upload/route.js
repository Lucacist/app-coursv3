import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier n\'a été téléchargé' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Créer un nom de fichier unique
    const fileName = `${uuidv4()}-${file.name}`;
    
    // Chemin où l'image sera enregistrée
    const imagePath = join(process.cwd(), 'public', 'images');
    
    // S'assurer que le dossier existe
    try {
      await mkdir(imagePath, { recursive: true });
    } catch (error) {
      // Ignorer l'erreur si le dossier existe déjà
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
    
    const filePath = join(imagePath, fileName);
    
    // Écrire le fichier
    await writeFile(filePath, buffer);
    
    // Retourner l'URL relative de l'image
    const imageUrl = `/images/${fileName}`;
    
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement de l\'image' },
      { status: 500 }
    );
  }
}
