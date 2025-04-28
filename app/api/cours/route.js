import prisma from '../../../lib/prisma';

export async function POST(req) {
  const { title, url } = await req.json();

  try {
    const newCours = await prisma.cours.create({
      data: {
        title,
        url,
      },
    });

    return new Response(JSON.stringify(newCours), { status: 200 });
  } catch (error) {
    return new Response('Error adding cours', { status: 500 });
  }
}

export async function GET() {
  try {
    const cours = await prisma.cours.findMany();
    return new Response(JSON.stringify(cours), { status: 200 });
  } catch (error) {
    return new Response('Error fetching cours', { status: 500 });
  }
}
