'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RoleGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setSession(data);
          } else {
            setSession(null);
            router.push('/login');
          }
        } else {
          setSession(null);
          router.push('/login');
        }
      } catch (err) {
        setSession(null);
        console.error('Erreur lors de la vérification de l\'authentification:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Vérification de l'authentification...</p>
      </div>
    );
  }

  if (!session) return null;
  return children;
}
