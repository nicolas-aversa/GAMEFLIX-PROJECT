import React, { useState, useEffect } from 'react';
import CreateGame from './createGame';
import ModifyGame from './modifyGame';
import PublishGame from './publishGame';
import UnpublishGame from './unpublishGame';
import DeleteGame from './deleteGame';

export default function ManageGames() {
  const [activeTab, setActiveTab] = useState('create');
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tabs = [
    { key: 'create', label: 'Crear' },
    { key: 'modify', label: 'Modificar' },
    { key: 'publish', label: 'Publicar' },
    { key: 'unpublish', label: 'Despublicar' },
    { key: 'delete', label: 'Eliminar' }
  ];

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const token = localStorage.getItem('token');
      const developerId = localStorage.getItem('developerId');

      if (!developerId) {
        console.error('Developer ID is null');
        return;
      }

      const response = await fetch(`http://localhost:8000/developers/${developerId}/games`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.error) {
        console.error('Error fetching games:', data.message);
        setGames([]);
      } else if (Array.isArray(data.games)) {
        setGames(data.games);
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
    }
  };

  const handleSuccess = (message) => {
    setSuccess(message);
    fetchGames();
  };

  const handleError = (message) => {
    setError(message);
  };

  return (
    <div className="min-h-screen bg-[#220447] text-white font-['Inter']">
      <main className="flex justify-center items-center mt-8">
        <div className="w-full max-w-4xl">
          <h2 className="text-2xl mt-4 mb-12 text-center">Gestionar mis juegos</h2>
          
          <div className="flex flex-wrap justify-center mb-12 space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 rounded-xl text-base mb-4 sm:mb-0 ${
                  activeTab === tab.key
                    ? 'bg-[#C93DEC] text-white hover:bg-[#a331c4]'
                    : 'bg-[#FFFFFF] text-[#220447] hover:bg-[#B1AEAE]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
          {success && <div className="mb-4 text-green-500 text-center">{success}</div>}

          {activeTab === 'create' && <CreateGame onSuccess={handleSuccess} onError={handleError} />}
          {activeTab === 'modify' && <ModifyGame games={games} onSuccess={handleSuccess} onError={handleError} />}
          {activeTab === 'publish' && <PublishGame games={games.filter(game => game.status === 'Despublicado')} onSuccess={handleSuccess} onError={handleError} />}
          {activeTab === 'unpublish' && <UnpublishGame games={games.filter(game => game.status === 'Publicado')} onSuccess={handleSuccess} onError={handleError} />}
          {activeTab === 'delete' && <DeleteGame games={games} onSuccess={handleSuccess} onError={handleError} />}
        </div>
      </main>
    </div>
  );
}