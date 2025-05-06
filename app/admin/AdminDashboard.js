'use client';
import React, { useEffect, useState } from 'react';

export default function AdminDashboard() {
  // TOUS les hooks d'abord !
  const [newCoursTitle, setNewCoursTitle] = useState('');
  const [newCoursUrl, setNewCoursUrl] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [movingCours, setMovingCours] = useState(null);
  const [cours, setCours] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handler: Ajouter un cours
  const handleAddCours = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/cours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newCoursTitle, 
          url: newCoursUrl,
          folderId: selectedFolder ? parseInt(selectedFolder) : null
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout du cours');
      }
      
      const data = await response.json();
      setCours((prevCours) => [...prevCours, data]);
      setNewCoursTitle('');
      setNewCoursUrl('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du cours', error);
      setError('Erreur lors de l\'ajout du cours: ' + error.message);
    }
  };

  // Handler: Ajouter un dossier
  const handleAddFolder = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout du dossier');
      }
      
      const data = await response.json();
      setFolders((prevFolders) => [...prevFolders, data]);
      setNewFolderName('');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du dossier', error);
      setError('Erreur lors de l\'ajout du dossier: ' + error.message);
    }
  };

  // Handler: Déplacer un cours
  const handleMoveCours = async (targetFolderId) => {
    try {
      const response = await fetch('/api/cours/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          coursId: movingCours.id, 
          folderId: targetFolderId ? parseInt(targetFolderId) : null 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du déplacement du cours');
      }
      
      // Mettre à jour la liste des cours
      loadData();
      setShowMoveModal(false);
    } catch (error) {
      console.error('Erreur lors du déplacement du cours', error);
      setError('Erreur lors du déplacement du cours: ' + error.message);
    }
  };

  // Handler: Supprimer un cours
  const handleDeleteCours = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;
    
    try {
      const response = await fetch(`/api/cours?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression du cours');
      }
      
      setCours((prevCours) => prevCours.filter((cours) => cours.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du cours', error);
      setError('Erreur lors de la suppression du cours: ' + error.message);
    }
  };

  // Handler: Supprimer un dossier
  const handleDeleteFolder = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dossier ? Les cours qu\'il contient seront déplacés à la racine.')) return;
    
    try {
      const response = await fetch(`/api/folders?id=${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression du dossier');
      }
      
      setFolders((prevFolders) => prevFolders.filter((folder) => folder.id !== id));
      // Recharger les cours car certains ont pu être déplacés
      loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression du dossier', error);
      setError('Erreur lors de la suppression du dossier: ' + error.message);
    }
  };

  // Handler: Ouvrir le modal de déplacement
  const openMoveModal = (cours) => {
    setMovingCours(cours);
    setShowMoveModal(true);
  };

  // Charger les données
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Charger les cours
      const coursResponse = await fetch('/api/cours');
      if (!coursResponse.ok) {
        const errorData = await coursResponse.json();
        throw new Error(errorData.error || 'Erreur lors du chargement des cours');
      }
      const coursData = await coursResponse.json();
      setCours(coursData);

      // Charger les dossiers
      const foldersResponse = await fetch('/api/folders');
      if (!foldersResponse.ok) {
        const errorData = await foldersResponse.json();
        throw new Error(errorData.error || 'Erreur lors du chargement des dossiers');
      }
      const foldersData = await foldersResponse.json();
      setFolders(foldersData);
    } catch (error) {
      console.error('Erreur lors du chargement des données', error);
      setError('Erreur lors du chargement des données: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            onClick={loadData}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="container">
      <div className="dashboard-header">
        <h1>Administration</h1>
      </div>
      <div className="flex flex-wrap gap-4">
        {/* Formulaire ajout de cours */}
        <div className="card" style={{ flex: '1', minWidth: '300px' }}>
          <h2 className="mb-3">Ajouter un cours</h2>
          <form onSubmit={handleAddCours}>
            <div className="form-group">
              <label htmlFor="coursTitle">Titre</label>
              <input type="text" id="coursTitle" value={newCoursTitle} onChange={(e) => setNewCoursTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="coursUrl">URL</label>
              <input type="url" id="coursUrl" value={newCoursUrl} onChange={(e) => setNewCoursUrl(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="folderSelect">Dossier (optionnel)</label>
              <select id="folderSelect" value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)}>
                <option value="">Racine</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary">Ajouter</button>
          </form>
        </div>

        {/* Formulaire ajout de dossier */}
        <div className="card" style={{ flex: '1', minWidth: '300px' }}>
          <h2 className="mb-3">Ajouter un dossier</h2>
          <form onSubmit={handleAddFolder}>
            <div className="form-group">
              <label htmlFor="folderName">Nom du dossier</label>
              <input type="text" id="folderName" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary">Ajouter</button>
          </form>
        </div>
      </div>

      {/* Liste des dossiers */}
      <div className="card mt-5">
        <h2 className="mb-3">Dossiers</h2>
        {folders.length === 0 ? (
          <p>Aucun dossier créé</p>
        ) : (
          <ul className="list-disc pl-5">
            {folders.map((folder) => (
              <li key={folder.id} className="mb-2 flex justify-between items-center">
                <span>{folder.name}</span>
                <button 
                  onClick={() => handleDeleteFolder(folder.id)} 
                  className="btn-danger btn"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Liste des cours */}
      <div className="card mt-5">
        <h2 className="mb-3">Cours</h2>
        {cours.length === 0 ? (
          <p>Aucun cours créé</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Titre</th>
                  <th className="py-2 px-4 text-left">URL</th>
                  <th className="py-2 px-4 text-left">Dossier</th>
                  <th className="py-2 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cours.map((cours) => (
                  <tr key={cours.id} className="border-b">
                    <td className="py-2 px-4">{cours.title}</td>
                    <td className="py-2 px-4">
                      <a href={cours.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {cours.url}
                      </a>
                    </td>
                    <td className="py-2 px-4">
                      {cours.folder ? cours.folder.name : 'Racine'}
                    </td>
                    <td className="py-2 px-4 text-center ctn">
                      <button 
                        onClick={() => openMoveModal(cours)} 
                        className="btn-secondary btn mr-2"
                      >
                        Déplacer
                      </button>
                      <button 
                        onClick={() => handleDeleteCours(cours.id)} 
                        className="btn-danger btn"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de déplacement */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg w-96">
            <h2 className="text-xl mb-4">Déplacer le cours</h2>
            <p className="mb-4">Déplacer <strong>{movingCours.title}</strong> vers :</p>
            <div className="mb-4">
              <select 
                className="w-full p-2 border rounded"
                defaultValue={movingCours.folderId || ''}
                onChange={(e) => handleMoveCours(e.target.value)}
              >
                <option value="">Racine</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => setShowMoveModal(false)} 
                className="btn-secondary btn"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
