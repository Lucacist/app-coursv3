import { cookies } from 'next/headers';

export async function POST() {
  // Supprimer le cookie de session
  cookies().delete('session_user');
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
