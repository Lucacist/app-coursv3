import prisma from '../../../lib/prisma';

export async function POST(req) {
  const { name, email } = await req.json();

  try {
    const newEleve = await prisma.eleve.create({
      data: {
        name,
        email,
      },
    });

    return new Response(JSON.stringify(newEleve), { status: 200 });
  } catch (error) {
    return new Response('Error adding eleve', { status: 500 });
  }
}

export async function GET() {
  try {
    const eleves = await prisma.eleve.findMany();
    return new Response(JSON.stringify(eleves), { status: 200 });
  } catch (error) {
    return new Response('Error fetching eleves', { status: 500 });
  }
}
