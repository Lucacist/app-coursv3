import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CoursContent from './CoursContent';

// Fonction pour vérifier l'authentification côté serveur
async function getUser() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session_user');
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const user = JSON.parse(sessionCookie.value);
    return user;
  } catch (error) {
    console.error('Erreur lors du parsing du cookie de session', error);
    return null;
  }
}

// Page cours sécurisée côté serveur
export default async function CoursPage() {
  // Vérification d'authentification côté serveur
  const user = await getUser();
  
  // Si pas d'utilisateur, rediriger vers login
  if (!user) {
    redirect('/login');
  }
  
  // Tous les utilisateurs authentifiés (prof et élève) peuvent accéder aux cours
  
  // Rendu du composant client CoursContent
  return <CoursContent />;
}
