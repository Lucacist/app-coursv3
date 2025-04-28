'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [newEleveName, setNewEleveName] = useState('');
  const [newEleveEmail, setNewEleveEmail] = useState('');
  const [newCoursTitle, setNewCoursTitle] = useState('');
  const [newCoursUrl, setNewCoursUrl] = useState('');
  const [eleves, setEleves] = useState([]);
  const [cours, setCours] = useState([]);

  // Ajouter un élève
  const handleAddEleve = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/eleves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEleveName, email: newEleveEmail }),
      });

      const data = await response.json();
      setEleves((prevEleves) => [...prevEleves, data]);
      setNewEleveName('');
      setNewEleveEmail('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'élève', error);
    }
  };

  // Ajouter un cours
  const handleAddCours = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/cours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newCoursTitle, url: newCoursUrl }),
      });

      const data = await response.json();
      setCours((prevCours) => [...prevCours, data]);
      setNewCoursTitle('');
      setNewCoursUrl('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du cours', error);
    }
  };

  // Charger les élèves et cours
  useEffect(() => {
    const loadData = async () => {
      try {
        const elevesResponse = await fetch('/api/eleves');
        const elevesData = await elevesResponse.json();
        setEleves(elevesData);

        const coursResponse = await fetch('/api/cours');
        const coursData = await coursResponse.json();
        setCours(coursData);
      } catch (error) {
        console.error('Erreur lors du chargement des données', error);
      }
    };

    loadData();
  }, []);

  return (
    <main>
      <h1>Administration</h1>

      {/* Formulaire ajout d'élève */}
      <section>
        <h2>Ajouter un élève</h2>
        <form onSubmit={handleAddEleve}>
          <input
            type="text"
            value={newEleveName}
            onChange={(e) => setNewEleveName(e.target.value)}
            placeholder="Nom de l'élève"
            required
          />
          <input
            type="email"
            value={newEleveEmail}
            onChange={(e) => setNewEleveEmail(e.target.value)}
            placeholder="Email de l'élève"
            required
          />
          <button type="submit">Ajouter</button>
        </form>
      </section>

      {/* Liste des élèves */}
      <section>
        <h2>Liste des élèves</h2>
        <ul>
          {eleves.map((eleve) => (
            <li key={eleve.id}>
              {eleve.name} - {eleve.email}
            </li>
          ))}
        </ul>
      </section>

      {/* Formulaire ajout de cours */}
      <section>
        <h2>Ajouter un cours</h2>
        <form onSubmit={handleAddCours}>
          <input
            type="text"
            value={newCoursTitle}
            onChange={(e) => setNewCoursTitle(e.target.value)}
            placeholder="Titre du cours"
            required
          />
          <input
            type="url"
            value={newCoursUrl}
            onChange={(e) => setNewCoursUrl(e.target.value)}
            placeholder="URL du cours"
            required
          />
          <button type="submit">Ajouter</button>
        </form>
      </section>

      {/* Liste des cours */}
      <section>
        <h2>Liste des cours</h2>
        <ul>
          {cours.map((coursItem) => (
            <li key={coursItem.id}>
              {coursItem.title} - <a href={coursItem.url} target="_blank" rel="noopener noreferrer">Accéder</a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
