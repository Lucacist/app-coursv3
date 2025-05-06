import prisma from '../../../lib/prisma';
import { cookies } from 'next/headers';

export async function POST(req) {
  const { type, login, password } = await req.json();

  // Connexion prof (login/mot de passe dans .env)
  if (type === 'prof') {
    const PROF_LOGIN = process.env.PROF_LOGIN || 'prof';
    const PROF_PASSWORD = process.env.PROF_PASSWORD || 'motdepasse';
    if (login === PROF_LOGIN && password === PROF_PASSWORD) {
      await cookies().set('session_user', JSON.stringify({ type: 'prof', role: 'prof' }), {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24,
      });
      return new Response(JSON.stringify({ success: true, role: 'prof' }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: 'Identifiants prof incorrects' }), { status: 401 });
    }
  }

  // Connexion classe (via la BDD)
  if (type === 'classe') {
    const classe = await prisma.classe.findUnique({
      where: { name: login },
    });
    if (!classe || classe.password !== password) {
      return new Response(JSON.stringify({ error: 'Identifiants classe incorrects' }), { status: 401 });
    }
    await cookies().set('session_user', JSON.stringify({ type: 'classe', role: 'classe', id: classe.id, name: classe.name }), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    return new Response(JSON.stringify({ success: true, role: 'classe', classeId: classe.id }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: 'Type de connexion inconnu' }), { status: 400 });
}


