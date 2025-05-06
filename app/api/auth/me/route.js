import { cookies } from 'next/headers';
import prisma from '../../../../lib/prisma';

export async function GET() {
  try {
    // Récupérer le cookie de session
    const sessionCookie = cookies().get('session_user');
    
    if (!sessionCookie) {
      console.log('Aucun cookie de session trouvé');
      return new Response(JSON.stringify({ 
        authenticated: false, 
        message: 'No session cookie found' 
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Extraire les données de session
    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
      // Vérifier si le champ role existe (nouveau format) ou type (ancien format)
      if (!sessionData || (!sessionData.role && !sessionData.type)) {
        throw new Error('Invalid session data structure');
      }
      
      // Compatibilité avec l'ancien format (type) et le nouveau format (role)
      const userRole = sessionData.role || sessionData.type;
      
      // Prof
      if (userRole === 'prof') {
        return new Response(JSON.stringify({
          authenticated: true,
          role: 'prof'
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      // Élève (anciennement classe)
      if (userRole === 'eleve' || userRole === 'classe') {
        return new Response(JSON.stringify({
          authenticated: true,
          role: 'eleve',
          id: sessionData.id,
          name: sessionData.name
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      // Autre type
      return new Response(JSON.stringify({
        authenticated: false,
        error: 'Unknown user role'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        authenticated: false,
        error: 'Authentication error',
        details: error.message
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    
  } catch (error) {
    return new Response(JSON.stringify({ 
      authenticated: false,
      error: error.message 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
