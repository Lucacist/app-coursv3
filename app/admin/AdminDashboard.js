'use client';
import React, { useEffect, useState } from 'react';

export default function AdminDashboard() {
  // TOUS les hooks d'abord !
  const [newCoursTitle, setNewCoursTitle] = useState('');
  const [newCoursUrl, setNewCoursUrl] = useState('');
  const [newCoursImage, setNewCoursImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [movingCours, setMovingCours] = useState(null);
  const [cours, setCours] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handler: Gérer le changement d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCoursImage(file);
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler: Télécharger l'image
  const uploadImage = async (file) => {
    if (!file) return null;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du téléchargement de l\'image');
      }
      
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image', error);
      setError('Erreur lors du téléchargement de l\'image: ' + error.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handler: Ajouter un cours
  const handleAddCours = async (e) => {
    e.preventDefault();
    try {
      // Télécharger l'image d'abord si elle existe
      let imageUrl = null;
      if (newCoursImage) {
        imageUrl = await uploadImage(newCoursImage);
      }
      
      const response = await fetch('/api/cours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newCoursTitle, 
          url: newCoursUrl,
          imageUrl,
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
      setNewCoursImage(null);
      setImagePreview('');
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
              <label htmlFor="coursImage">Image de bannière</label>
              <input 
                type="file" 
                id="coursImage" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="mb-2"
              />
              {imagePreview && (
                <div className="mt-2 relative">
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    className="w-full h-32 object-cover rounded" 
                  />
                  <button 
                    type="button" 
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    onClick={() => {
                      setNewCoursImage(null);
                      setImagePreview('');
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
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
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={uploadingImage}
            >
              {uploadingImage ? 'Téléchargement...' : 'Ajouter'}
            </button>
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
                  <th className="py-2 px-4 text-left">Image</th>
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
                      {cours.image ? (
                        <div className="relative group cursor-pointer">
                          <img 
                            src={cours.image.url} 
                            alt="Bannière" 
                            className="w-20 h-14 object-cover rounded" 
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded flex items-center justify-center">
                            <a 
                              href={cours.image.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Aucune image</span>
                      )}
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
