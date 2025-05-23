import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

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

// Page admin sécurisée côté serveur
export default async function AdminPage() {
  // Vérification d'authentification côté serveur
  const user = await getUser();
  
  // Si pas d'utilisateur, rediriger vers login
  if (!user) {
    redirect('/login');
  }
  
  // Si l'utilisateur n'est pas un prof, rediriger vers cours
  if (user.role !== 'prof') {
    redirect('/cours');
  }

  // Rendu du composant client AdminDashboard seulement si l'utilisateur est un prof
  return <AdminDashboard />;
}