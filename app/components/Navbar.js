'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  };

  return (
    <header>
      <div className="container">
        <nav>
          <div className="flex items-center">
            <Link href="/" className="text-primary font-bold text-xl">
              App-Cours
            </Link>
          </div>
          
          <ul>
            <li>
              <Link 
                href="/cours" 
                className={pathname === '/cours' ? 'text-primary' : ''}
              >
                Cours
              </Link>
            </li>
            

            
            <li>
              <Link 
                href="/admin" 
                className={pathname === '/admin' ? 'text-primary' : ''}
              >
                Admin
              </Link>
            </li>
            
            {pathname !== '/login' && (
              <li>
                <button onClick={handleLogout} className="btn">
                  Déconnexion
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
