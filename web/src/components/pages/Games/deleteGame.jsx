import React from 'react';

export default function DeleteGame({ games, onSuccess, onError }) {
  const handleDelete = async (gameId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Error en la solicitud';

        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          errorMessage = await response.text();
        }

        throw new Error(errorMessage);
      }

      await response.json();
      onSuccess('Juego eliminado exitosamente');
      setTimeout(() => {
        onSuccess('');
      }, 5000);
    } catch (error) {
      console.error('Error al eliminar el juego:', error);
      onError(`Hubo un error al eliminar el juego: ${error.message}`);
    }
  };

  return (
    <div>
      <ul>
        {games.map((game) => (
          <li key={game._id} className="mb-4 flex justify-between items-center bg-gradient-to-r from-purple-900 to-purple-1000 px-8 py-2 rounded-full transition-all duration-300 ease-out p-6 rounded-lg shadow-lg ">
            <div className="flex items-center space-x-4">
              <img
                src={game.imageUrl}
                alt={game.title}
                className="w-28 h-36 object-cover rounded-lg hover:scale-95 transition-transform duration-200"
              />
              <div>
                <h4 className="text-lg">{game.title}</h4>
                <div className="text-xs text-gray-400">
                  <span>{game.category} - </span>
                  <span className="text-[#C93DEC]">${game.price}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="bg-red-600 text-white rounded-2xl py-1.5 px-3 hover:bg-red-800 font-medium shadow-lg hover:scale-105 transition-transform duration-200"
              onClick={() => handleDelete(game._id)}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}