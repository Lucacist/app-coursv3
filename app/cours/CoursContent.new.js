'use client';
import { useEffect, useState } from 'react';

export default function CoursContent() {
  const [cours, setCours] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [coursWithoutFolder, setCoursWithoutFolder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les dossiers et les cours
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Charger les dossiers
        const foldersResponse = await fetch('/api/folders');
        if (!foldersResponse.ok) {
          throw new Error('Erreur lors du chargement des dossiers');
        }
        const foldersData = await foldersResponse.json();
        setFolders(foldersData);
        
        // Charger les cours sans dossier
        const coursResponse = await fetch('/api/cours?folderId=null');
        if (!coursResponse.ok) {
          throw new Error('Erreur lors du chargement des cours');
        }
        const coursData = await coursResponse.json();
        setCoursWithoutFolder(coursData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Charger les cours d'un dossier spécifique
  useEffect(() => {
    const fetchCoursByFolder = async () => {
      if (selectedFolder === null) {
        setCours([]);
        return;
      }
      
      setLoading(true);
      try {
        const response = await fetch(`/api/cours?folderId=${selectedFolder}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des cours du dossier');
        }
        const data = await response.json();
        setCours(data);
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoursByFolder();
  }, [selectedFolder]);
  
  // Sélectionner un dossier
  const handleFolderSelect = (folderId) => {
    setSelectedFolder(folderId);
  };
  
  // Afficher les cours sans dossier
  const handleShowCoursWithoutFolder = () => {
    setSelectedFolder(null);
  };

  if (loading && folders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Chargement des cours...</p>
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
            onClick={() => window.location.reload()}
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
        <h1>Mes Cours</h1>
      </div>
      
      {/* Navigation des dossiers */}
      <div className="folders-nav mb-5">
        <button 
          className={`folder-btn ${selectedFolder === null ? 'active' : ''}`}
          onClick={handleShowCoursWithoutFolder}
        >
          Cours sans dossier ({coursWithoutFolder.length})
        </button>
        
        {folders.map((folder) => (
          <button 
            key={folder.id}
            className={`folder-btn ${selectedFolder === folder.id ? 'active' : ''}`}
            onClick={() => handleFolderSelect(folder.id)}
          >
            {folder.name} ({folder.cours ? folder.cours.length : 0})
          </button>
        ))}
      </div>
      
      {/* Affichage des cours */}
      <div className="courses-grid">
        {selectedFolder === null ? (
          // Afficher les cours sans dossier
          coursWithoutFolder.length > 0 ? (
            coursWithoutFolder.map((cours) => (
              <div key={cours.id} className={`course-card ${!cours.image ? 'no-image' : ''}`}>
                <div className={`course-content ${!cours.image ? 'no-banner' : ''}`}>
                  <h3>{cours.title}</h3>
                  <a 
                    href={cours.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="course-link"
                  >
                    Accéder au cours
                  </a>
                </div>
                {cours.image && (
                  <div className="course-banner">
                    <img 
                      src={cours.image.url} 
                      alt={cours.title}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="no-courses">Aucun cours sans dossier disponible</p>
          )
        ) : (
          // Afficher les cours du dossier sélectionné
          cours.length > 0 ? (
            cours.map((cours) => (
              <div key={cours.id} className={`course-card ${!cours.image ? 'no-image' : ''}`}>
                <div className={`course-content ${!cours.image ? 'no-banner' : ''}`}>
                  <h3>{cours.title}</h3>
                  <a 
                    href={cours.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="course-link"
                  >
                    Accéder au cours
                  </a>
                </div>
                {cours.image && (
                  <div className="course-banner">
                    <img 
                      src={cours.image.url} 
                      alt={cours.title}
                    />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="no-courses">Aucun cours dans ce dossier</p>
          )
        )}
      </div>
    </main>
  );
}
