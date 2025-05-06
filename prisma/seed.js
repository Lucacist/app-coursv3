const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Crée une classe de test
  await prisma.classe.create({
    data: {
      name: '1A',
      password: 'classe123',
    },
  });

  // Crée deux dossiers
  const folder1 = await prisma.folder.create({
    data: { name: 'Maths' },
  });
  const folder2 = await prisma.folder.create({
    data: { name: 'Français' },
  });

  // Crée deux cours
  await prisma.cours.create({
    data: {
      title: 'Algèbre',
      url: 'https://exemple.com/algebre.pdf',
      folder: { connect: { id: folder1.id } },
    },
  });
  await prisma.cours.create({
    data: {
      title: 'Grammaire',
      url: 'https://exemple.com/grammaire.pdf',
      folder: { connect: { id: folder2.id } },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
