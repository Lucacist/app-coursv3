import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const session = request.cookies.get('session_user');
  
  // Autoriser uniquement l'accès à la page de login et aux assets publics sans session
  if (url.pathname.startsWith('/login') || url.pathname.startsWith('/_next') || url.pathname.startsWith('/api') || url.pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  // Toute autre page nécessite une session valide
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Vérifier le type de session
  try {
    const user = JSON.parse(session.value);
    // Bloquer l'accès à /admin et /dashboard si ce n'est pas un prof
    if (['/admin', '/dashboard'].some(path => url.pathname.startsWith(path)) && user.type !== 'prof') {
      return NextResponse.redirect(new URL('/cours', request.url));
    }
    // Le prof a accès partout
  } catch (e) {
    // Si le cookie est corrompu, forcer le login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirection de la page d'accueil vers la page des cours
  if (url.pathname === '/') {
    return NextResponse.redirect(new URL('/cours', request.url));
  }
  
  
  // Si déjà connecté et sur login, rediriger vers les cours
  if (url.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/cours', request.url));
  }
  
  // Autoriser l'accès à l'API de login même sans authentification
  if (url.pathname === '/api/login' || url.pathname === '/api/logout' || url.pathname === '/favicon.ico') {
    return NextResponse.next();
  }
  
  // Définir les chemins et API réservés au prof
  const profOnlyPaths = [
    '/admin'
  ];
  
  const profOnlyAPIs = [
    '/api/folders',
    '/api/cours/move',
    '/api/users'
  ];
  
  // Vérifier si le chemin actuel est réservé au prof
  const isProfOnlyPath = profOnlyPaths.some(path => 
    url.pathname === path || url.pathname.startsWith(`${path}/`)
  );
  
  // Vérifier si le chemin/API est réservé au prof et que l'utilisateur n'est pas prof
  if ((isProfOnlyPath || isProfOnlyAPI) && user.type !== 'prof') {
    // Pour les API, renvoyer une erreur 403
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Accès réservé aux professeurs' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // Pour les pages, rediriger vers la page des cours
    return NextResponse.redirect(new URL('/cours', request.url));
  }
  const isProfOnlyAPI = profOnlyAPIs.some(path => 
    url.pathname === path || url.pathname.startsWith(`${path}/`)
  );
  
  // Si chemin réservé au prof et utilisateur non connecté, bloquer l'accès
  if ((isProfOnlyPath || isProfOnlyAPI) && !user) {
    // Pour les API, renvoyer une erreur 403
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Accès refusé' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Pour les pages, rediriger vers la page de login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Autoriser l'accès si toutes les vérifications sont passées
  return NextResponse.next();
}
